import React, { useState } from 'react';
import GlobeCarousel3D from './GlobeCarousel3D';

// 20 Unique, Non-Repeating Coordinated Photographic Assets Tailored to XeroXpress Print Ecosystem
const CAROUSEL_IMAGES = [
  {
    src: '/carousel/mobile_campus_print.jpg',
    title: 'Mobile Cloud Print Dispatch',
    subtitle: 'Upload coursework directly from your smartphone to the campus print queue without drivers.',
    tag: 'MOBILE • DIRECT FEED'
  },
  {
    src: '/carousel/organized_study_desk.jpg',
    title: 'Organized Academic Workstations',
    subtitle: 'Keep your course materials, lab reports, and assignments bound and organized with zero stress.',
    tag: 'ACADEMIC • ZERO DEADLINE STRESS'
  },
  {
    src: '/carousel/student_qr_kiosk.jpg',
    title: 'Autonomous QR Print Kiosk',
    subtitle: 'Tap your student digital pass or scan QR code to release secure printouts instantly.',
    tag: 'HARDWARE • SMART KIOSK'
  },
  {
    src: '/carousel/login_student.jpg',
    title: 'Digital Student Print Portal',
    subtitle: 'Track print quotas, submit lab records, and review document status in real time.',
    tag: 'STUDENT PORTAL • 24/7 ACCESS'
  },
  {
    src: '/carousel/hero_printer.jpg',
    title: 'Commercial Digital Laser Press',
    subtitle: 'Heavy-duty commercial engines capable of handling peak campus submission rush hours.',
    tag: 'HARDWARE • PRODUCTION ENGINE'
  },
  {
    src: '/carousel/campus_service_center.jpg',
    title: 'Campus Central Print Center',
    subtitle: 'Dedicated full-service counters located right next to the library and academic blocks.',
    tag: 'CAMPUS • SERVICE CENTER'
  },
  {
    src: '/carousel/svc_pdf.jpg',
    title: 'Smart PDF Pre-Press Engine',
    subtitle: 'Automated margin check, page counting, color breakdown, and print preview before dispatch.',
    tag: 'ENGINE • INSTANT OCR & PREVIEW'
  },
  {
    src: '/carousel/svc_color.jpg',
    title: 'CAD & Engineering Plotting',
    subtitle: 'High precision wide-format blueprint drawing and high-fidelity presentation posters.',
    tag: 'FORMAT • COLOR PLOTTER'
  },
  {
    src: '/carousel/reg_press_production.jpg',
    title: 'Automated High-Speed Production',
    subtitle: 'Continuous high-volume duplex printing with inline stapling and sorting.',
    tag: 'PERFORMANCE • RELIABLE FEED'
  },
  {
    src: '/carousel/color_press.jpg',
    title: '2400 DPI High-Definition Color',
    subtitle: 'True-to-life CMYK calibration for project presentations and conference papers.',
    tag: 'SYSTEM • 2400 DPI LASER'
  },
  {
    src: '/carousel/reg_thesis_binding.jpg',
    title: 'Hardcover & Thesis Binding',
    subtitle: 'University standard thermal, spiral, wire-o, and gold-embossed project binding.',
    tag: 'FINISHING • ACADEMIC THESIS'
  },
  {
    src: '/carousel/glasscard_kiosk.jpg',
    title: 'Self-Serve Express Terminal',
    subtitle: 'Autonomous tap-and-collect station for picking up confidential documents after hours.',
    tag: 'EXPRESS • 24/7 TERMINAL'
  },
  {
    src: '/carousel/xerox_scan_platen.jpg',
    title: 'Ultra-Clear Duplex Scanning',
    subtitle: 'High-resolution platen scanning with instant OCR and direct university cloud sync.',
    tag: 'OPTICAL • 600 DPI SCAN'
  },
  {
    src: '/carousel/campus_hub.jpg',
    title: 'Campus-Wide Print Network',
    subtitle: 'Seamlessly linked across university libraries, academic departments, and student hostels.',
    tag: 'NETWORK • MULTI-BRANCH'
  },
  {
    src: '/carousel/xerox_campus_queue.jpg',
    title: 'Zero-Wait Queue Management',
    subtitle: 'Smart queuing algorithm reserves your collection slot and notifies you when prints are ready.',
    tag: 'DISPATCH • 5-MIN FAST TRACK'
  },
  {
    src: '/carousel/svc_bw.jpg',
    title: 'High-Speed B&W Laser Stream',
    subtitle: 'Crisp 120 PPM monochrome output optimized for high-volume lecture notes.',
    tag: 'SPEED • 120 PPM MONO'
  },
  {
    src: '/carousel/svc_stationery.jpg',
    title: 'Academic Stationery & Supplies',
    subtitle: 'Official examination sheets, graph paper, lab record binders, and project files.',
    tag: 'SUPPLIES • CAMPUS READY'
  },
  {
    src: '/carousel/reg_student_print.jpg',
    title: 'Counter Collection & Delivery',
    subtitle: 'Quick pickup with dynamic 4-digit verification code — zero confusion, zero lost sheets.',
    tag: 'COLLECTION • ZERO WAIT'
  },
  {
    src: '/carousel/reg_campus_hub.jpg',
    title: 'Library Digital Resource Center',
    subtitle: 'Integrated printing connected directly with campus library workstations and repositories.',
    tag: 'LIBRARY • DIGITAL HUB'
  },
  {
    src: '/carousel/svc_lab.jpg',
    title: 'Lab Manuals & Graph Books',
    subtitle: 'Standard format university lab records, circuit schematics, and calculation logbooks.',
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
