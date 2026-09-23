import React, { useState } from 'react';
import GlobeCarousel3D from './GlobeCarousel3D';

// 20 Unique, Non-Repeating Images Tailored to XeroXpress Print Ecosystem
const CAROUSEL_IMAGES = [
  {
    src: '/carousel/phone_paper_stream.png',
    title: 'Mobile Direct Print Stream',
    subtitle: 'Upload assignments directly from mobile to printer without extra drivers or cables.',
    tag: 'FEATURED 01 • DIRECT FEED'
  },
  {
    src: '/carousel/paper_mountain_stress.png',
    title: 'End Manual Paper Chaos',
    subtitle: 'Eliminate disorganized paper towers, lost assignments, and endless counter queues.',
    tag: 'FEATURED 02 • QUEUE BYPASS'
  },
  {
    src: '/carousel/holographic_mobile_qr.png',
    title: 'Touchless Holographic QR Print',
    subtitle: 'Wave your mobile QR pass over the reader to print and authenticate instantly.',
    tag: 'TOUCHLESS • QR DISPATCH'
  },
  {
    src: '/carousel/anime_xerox_exhausted.jpg',
    title: 'Late Night Submission Hero',
    subtitle: 'No more staying up all night wrestling with broken campus printers.',
    tag: 'STUDENT LIFE • ZERO DEADLINE STRESS'
  },
  {
    src: '/carousel/student_qr_kiosk.jpg',
    title: 'Campus QR Code Print Kiosk',
    subtitle: 'Instant tap-and-collect automated printing terminals across the university.',
    tag: 'HARDWARE • SMART KIOSK'
  },
  {
    src: '/carousel/epson_smart_scanner.png',
    title: 'High-Speed Duplex Scanner',
    subtitle: 'Dual-side scanning with instant optical OCR and direct PDF cloud upload.',
    tag: 'SCANNING • 600 DPI DUPLEX'
  },
  {
    src: '/carousel/laptop_digital_docs.png',
    title: 'Cloud Document Dispatch',
    subtitle: 'Send Word, PDF, and PPT files straight from student portal to Xerox queue.',
    tag: 'PORTAL • INSTANT SYNC'
  },
  {
    src: '/carousel/printed_charts_pen.png',
    title: 'Precision Report Analytics',
    subtitle: 'Crisp color charts, technical tables, and presentation document outputs.',
    tag: 'COLOR PRINT • HIGH DEFINITION'
  },
  {
    src: '/carousel/cartoon_xerox_flying_paper.png',
    title: 'Continuous High-Speed Output',
    subtitle: 'High capacity paper trays and automated jam prevention mechanisms.',
    tag: 'PERFORMANCE • RELIABLE FEED'
  },
  {
    src: '/carousel/color_press.jpg',
    title: 'Digital High-Speed Press',
    subtitle: 'High precision 2400 DPI duplex laser printing at 60 pages per minute.',
    tag: 'SYSTEM • 60 PPM LASER'
  },
  {
    src: '/carousel/reg_thesis_binding.jpg',
    title: 'Hardcover & Thesis Binding',
    subtitle: 'University standard thermal, spiral, and gold-embossed project binding.',
    tag: 'FINISHING • ACADEMIC'
  },
  {
    src: '/carousel/glasscard_kiosk.jpg',
    title: 'Self-Serve Pickup Kiosk',
    subtitle: 'Instant QR code tap-and-collect station for 24/7 autonomous collection.',
    tag: 'HARDWARE • SMART KIOSK'
  },
  {
    src: '/carousel/xerox_scan_platen.jpg',
    title: 'Ultra-Clear Duplex Scanning',
    subtitle: 'Optical character recognition (OCR) and instant PDF cloud sync.',
    tag: 'OPTICAL • 600 DPI SCAN'
  },
  {
    src: '/carousel/reg_campus_hub.jpg',
    title: 'Campus-Wide Print Hub',
    subtitle: 'Coordinated across main library, cafeteria, and department terminals.',
    tag: 'NETWORK • MULTI-BRANCH'
  },
  {
    src: '/carousel/xerox_speed_runner.png',
    title: '5-Minute Express Turnaround',
    subtitle: 'Automated job priority scheduling eliminates physical counter wait times.',
    tag: 'DISPATCH • 5-MIN FAST TRACK'
  },
  {
    src: '/carousel/svc_color.jpg',
    title: 'CAD & Engineering Plotting',
    subtitle: 'Large format blueprint drawing and high-fidelity presentation charts.',
    tag: 'FORMAT • A0-A3 PLOTTER'
  },
  {
    src: '/carousel/svc_stationery.jpg',
    title: 'Stationery & Project Supplies',
    subtitle: 'Examination papers, drawing sheets, lab record materials & files.',
    tag: 'SUPPLIES • CAMPUS READY'
  },
  {
    src: '/carousel/reg_student_print.jpg',
    title: 'Counter Collection Desk',
    subtitle: 'Quick pickup with digital verification code — no confusion or lost sheets.',
    tag: 'COLLECTION • ZERO WAIT'
  },
  {
    src: '/carousel/xerox_paper_vortex.png',
    title: 'Bulk Lecture Notes & Packets',
    subtitle: 'Automated collating, double-sided stapling, and bound handout sets.',
    tag: 'BULK PRINT • AUTOMATED COLLATING'
  },
  {
    src: '/carousel/svc_lab.jpg',
    title: 'Lab Manuals & Graph Books',
    subtitle: 'Grid ruled graph sheets, circuit diagrams, and university format records.',
    tag: 'LAB RECORDS • APPROVED FORMAT'
  }
];

export default function RelationAnimation() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center select-none relative">
      {/* ── Framer 3D Globe Carousel Stage (20 Unique Non-Repeating Images) ── */}
      <div className="relative w-full h-full flex items-center justify-center">
        <GlobeCarousel3D
          images={CAROUSEL_IMAGES}
          radius={195}
          tileWidth={120}
          tileHeight={114}
          distance={700}
          speed={11}
          count={20}
          axis="y"
          friction={0.94}
        />
      </div>
    </div>
  );
}
