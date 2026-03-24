import jsPDF from 'jspdf';
import { formatCurrency, formatPercent, formatMultiple } from './formatters';

/**
 * Direct jsPDF Drawing Utility
 * Bypasses html2canvas/CSS issues by manually drawing the report structure.
 */
export const generatePDF = (context) => {
  const { inputs, metrics, result, risks } = context;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let currY = 20;

  // 1. Header & Branding
  doc.setFillColor(14, 165, 233); // Sky-600
  doc.rect(margin, currY, pageWidth - (margin * 2), 2, 'F');
  currY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(3, 105, 161); // Sky-700
  doc.text('CR EQUITY AI', margin, currY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('ACQUISITION INTELLIGENCE BRIEF', margin, currY + 5);

  const timestamp = new Date().toLocaleString();
  doc.setFontSize(8);
  doc.text(`EXPORTED: ${timestamp}`, pageWidth - margin, currY + 5, { align: 'right' });
  currY += 20;

  // 2. Property Title
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(inputs.propertyName || 'Investment Case', margin, currY);
  currY += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`${inputs.propertyType || 'Asset'} | ${inputs.location || 'Location'}`, margin, currY);
  currY += 15;

  // 3. Executive Recommendation Box
  doc.setFillColor(240, 249, 255); // Sky-50
  doc.setDrawColor(224, 242, 254); // Sky-100
  doc.roundedRect(margin, currY, pageWidth - (margin * 2), 35, 3, 3, 'FD');
  
  let innerY = currY + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199); // Sky-600
  doc.text('EXECUTIVE RECOMMENDATION', margin + 8, innerY);
  
  innerY += 10;
  const rec = result.recommendation || 'Under Review';
  const score = result.score || 0;
  
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${rec}  |  Score: ${score}/100`, margin + 8, innerY);
  
  innerY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105); // Slate-600
  const rationale = `The deterministic core algorithm has flagged this deal as a ${rec} grade based on risk-adjusted threshold alignment.`;
  const splitRationale = doc.splitTextToSize(rationale, pageWidth - (margin * 2) - 16);
  doc.text(splitRationale, margin + 8, innerY);
  currY += 45;

  // 4. Financial Metrics Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('KEY FINANCIAL UNDERWRITING', margin, currY);
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, currY + 2, pageWidth - margin, currY + 2);
  currY += 12;

  const mGrid = [
    { label: 'Acquisition Basis', val: formatCurrency(inputs.askingPrice) },
    { label: 'Going-in Cap Rate', val: formatPercent(metrics.capRate) },
    { label: 'Debt Coverage (DSCR)', val: formatMultiple(metrics.dscr) },
    { label: 'Cash-on-Cash Return', val: formatPercent(metrics.cashOnCashReturn) },
    { label: 'Loan-to-Value (LTV)', val: formatPercent(metrics.ltv, 1) },
    { label: 'Annual NOI', val: formatCurrency(metrics.noi) },
    { label: 'Free Cash Flow (FCF)', val: formatCurrency(metrics.annualCashFlow) },
    { label: 'Break-Even Occupancy', val: formatPercent(metrics.breakEvenOccupancy, 1) }
  ];

  let col = 0;
  let startX = margin;
  mGrid.forEach((m, i) => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(m.label.toUpperCase(), startX + (col * 43), currY);
    
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(m.val || '---', startX + (col * 43), currY + 6);
    
    col++;
    if (col > 3) {
      col = 0;
      currY += 18;
    }
  });
  currY += 15;

  // 5. Risk Signals
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('MATERIAL UNDERWRITING RISKS', margin, currY);
  doc.line(margin, currY + 2, pageWidth - margin, currY + 2);
  currY += 10;

  const activeRisks = risks?.slice(0, 5) || [];
  activeRisks.forEach((risk, idx) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${idx + 1}. ${risk.title.toUpperCase()}`, margin, currY);
    
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38); // Rose-600
    doc.text(`[${risk.severity.toUpperCase()}]`, margin + 110, currY, { align: 'right' });
    
    currY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitExp = doc.splitTextToSize(risk.explanation, pageWidth - (margin * 2));
    doc.text(splitExp, margin, currY);
    currY += (splitExp.length * 4) + 4;

    if (currY > 260) {
      doc.addPage();
      currY = 20;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const footerText = 'CONFIDENTIAL INVESTMENT MEMO — GENERATED BY CR EQUITY AI';
  doc.text(footerText, pageWidth / 2, 285, { align: 'center' });

  // SAVE
  const filename = `${(inputs.propertyName || 'Investment').replace(/\s+/g, '-')}-Brief-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
