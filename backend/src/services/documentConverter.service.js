const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');

/**
 * Safely removes a file from disk without throwing
 */
const cleanupFile = async (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      // In case Windows holds a lock briefly, retry after a short delay
      setTimeout(async () => {
        try {
          if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
        } catch (_) {}
      }, 500);
    }
  }
};

/**
 * Extracts text from PDF with multiple fallback strategies
 */
const extractTextFromPdf = async (dataBuffer) => {
  let rawText = '';

  // Strategy 1: pdf-parse
  try {
    const parser = new PDFParse({ data: dataBuffer });
    await parser.load();
    const result = await parser.getText();
    if (result && result.text) {
      rawText = result.text.trim();
    }
  } catch (err) {
    console.warn('PDFParse primary extraction notice:', err.message);
  }

  // Strategy 2: Raw stream scanning fallback if pdf-parse fails or returned empty text
  if (!rawText || rawText.length < 5) {
    try {
      const content = dataBuffer.toString('utf-8');
      const textMatches = content.match(/\(([^()]{3,})\)T[jJ]/g) || content.match(/\[(.*?)\]TJ/g);
      if (textMatches && textMatches.length > 0) {
        rawText = textMatches
          .map(m => m.replace(/^[(\[]|[)\]]T[jJ]?$/g, ''))
          .filter(t => t.trim().length > 0)
          .join(' ');
      }
    } catch (_) {}
  }

  return rawText;
};

/**
 * Converts a PDF document into a genuine Microsoft Word (.docx) document in memory
 * @param {string} pdfFilePath - Local path of uploaded PDF
 * @param {string} originalFilename - Original filename of the upload
 * @returns {Promise<{ buffer: Buffer, outputFilename: string, fileSize: number }>}
 */
const convertPdfToWord = async (pdfFilePath, originalFilename) => {
  const dataBuffer = await fs.promises.readFile(pdfFilePath);
  
  const rawText = await extractTextFromPdf(dataBuffer);

  if (!rawText || rawText.length < 3) {
    throw new Error('This PDF appears to be scanned or image-based without extractable text. Please ensure the PDF contains digital text.');
  }

  // Clean raw text: remove page boundary markers like "-- 1 of 5 --"
  const cleanRaw = rawText.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '');

  // Group text into natural paragraphs rather than splitting on every newline
  const rawParagraphs = cleanRaw
    .split(/\r?\n\r?\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const baseTitle = originalFilename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const docxParagraphs = [];

  // Title Header
  docxParagraphs.push(
    new Paragraph({
      text: baseTitle,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 }
    })
  );

  for (const block of rawParagraphs) {
    // If a paragraph contains internal single newlines, join them smoothly unless formatted like a list
    const isSingleLine = !block.includes('\n');
    const isHeading = isSingleLine && (
      (block.length < 60 && block === block.toUpperCase() && /[A-Z]/.test(block)) ||
      /^(Chapter|Section|Unit|Module|Part)\s+\d+/i.test(block)
    );

    if (isHeading) {
      docxParagraphs.push(
        new Paragraph({
          text: block,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
    } else {
      // Clean joined paragraph text
      const paragraphText = block.replace(/\s+/g, ' ');
      docxParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraphText,
              size: 24 // 12pt standard font size
            })
          ],
          spacing: { after: 160 },
          alignment: AlignmentType.BOTH
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxParagraphs
      }
    ]
  });

  // Generate buffer in memory directly without disk write
  const buffer = await Packer.toBuffer(doc);
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  const outputFilename = `${baseName}_converted.docx`;

  return {
    buffer,
    outputFilename,
    fileSize: buffer.length
  };
};

/**
 * Converts a Word document (.docx / .doc) into a genuine Adobe PDF document in memory
 * @param {string} wordFilePath - Local path of uploaded Word file
 * @param {string} originalFilename - Original filename of the upload
 * @returns {Promise<{ buffer: Buffer, outputFilename: string, fileSize: number }>}
 */
const convertWordToPdf = async (wordFilePath, originalFilename) => {
  let rawText = '';
  try {
    const result = await mammoth.extractRawText({ path: wordFilePath });
    rawText = result.value ? result.value.trim() : '';
  } catch (err) {
    // If mammoth fails (e.g. legacy binary .doc or specific encoding), attempt raw string extraction
    try {
      const buffer = await fs.promises.readFile(wordFilePath);
      const content = buffer.toString('latin1');
      const textMatches = content.match(/[A-Za-z0-9 ,.!?;:'"()\-]{10,}/g);
      if (textMatches && textMatches.length > 0) {
        rawText = textMatches.slice(0, 500).join('\n\n');
      }
    } catch (_) {}

    if (!rawText) {
      throw new Error('Unable to read Word document. Please ensure it is a valid .docx or modern Word file.');
    }
  }

  if (!rawText || rawText.length < 2) {
    throw new Error('The uploaded Word document contains no readable text or is empty.');
  }

  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  const outputFilename = `${baseName}_converted.pdf`;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 45, bottom: 45, left: 50, right: 50 },
        info: {
          Title: baseName,
          Author: 'XeroXpress Document Converter',
          Creator: 'XeroXpress Campus Printing'
        },
        autoFirstPage: true
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          outputFilename,
          fileSize: buffer.length
        });
      });
      doc.on('error', (err) => {
        reject(new Error('Failed to generate PDF document: ' + err.message));
      });

      // Header Title
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#0f172a')
        .text(baseName.replace(/[_-]/g, ' '), { align: 'center' });

      doc.moveDown(0.4);

      // Subtle separator line
      const currentY = doc.y;
      doc
        .strokeColor('#cbd5e1')
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(545, currentY)
        .stroke();

      doc.moveDown(0.8);

      // Paragraph processing
      const paragraphs = rawText
        .split(/\r?\n\r?\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      for (const p of paragraphs) {
        const isSingleLine = !p.includes('\n');
        const isHeading = isSingleLine && (
          (p.length < 60 && p === p.toUpperCase() && /[A-Z]/.test(p)) ||
          /^(Chapter|Section|Unit|Module|Part)\s+\d+/i.test(p)
        );

        if (isHeading) {
          doc.moveDown(0.5);
          doc.font('Helvetica-Bold').fontSize(13).fillColor('#1e293b').text(p);
          doc.moveDown(0.3);
        } else {
          doc.font('Helvetica').fontSize(10.5).fillColor('#334155').text(p.replace(/\s+/g, ' '), {
            align: 'justify',
            lineGap: 3
          });
          doc.moveDown(0.6);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  convertPdfToWord,
  convertWordToPdf,
  cleanupFile
};
