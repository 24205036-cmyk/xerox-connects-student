const fs = require('fs');

/**
 * Counts pages in a PDF file by scanning trailer/cross-reference dictionary and page objects
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {number} - Estimated or exact page count (minimum 1)
 */
const countPdfPages = (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const content = buffer.toString('binary');
    
    // Method 1: Search for /Count in /Pages dictionary
    const countMatches = content.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/g);
    if (countMatches && countMatches.length > 0) {
      let maxCount = 1;
      countMatches.forEach((m) => {
        const match = m.match(/\/Count\s+(\d+)/);
        if (match && match[1]) {
          const count = parseInt(match[1], 10);
          if (count > maxCount) maxCount = count;
        }
      });
      return maxCount;
    }

    // Method 2: Count all distinct /Type /Page objects (excluding /Pages)
    const pageObjects = content.match(/\/Type\s*\/Page[^s]/g);
    if (pageObjects && pageObjects.length > 0) {
      return pageObjects.length;
    }

    return 1;
  } catch (err) {
    console.warn(`Could not determine exact PDF page count for ${filePath}:`, err.message);
    return 1;
  }
};

module.exports = {
  countPdfPages
};
