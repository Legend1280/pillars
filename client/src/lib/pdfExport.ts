/**
 * Pillars-Branded PDF Export for Business Plan
 * Matches the style of Pillars Executive Summary documents
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardInputs } from './data';
import { calculateProjections, ProjectionResults } from './calculations';

// Pillars Brand Colors
const COLORS = {
  teal: [77, 201, 189] as [number, number, number],
  darkBlue: [44, 62, 80] as [number, number, number],
  lightTeal: [178, 235, 229] as [number, number, number],
  yellow: [255, 215, 0] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

/**
 * Export comprehensive business plan as branded PDF
 */
export async function exportBusinessPlanPDF(inputs: DashboardInputs): Promise<void> {
  try {
    showLoadingToast('Generating Pillars business plan PDF...');

    // Calculate all projections
    const results = calculateProjections(inputs);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let pageNum = 1;

    // Page 1: Cover Page
    addCoverPage(pdf);
    
    // Page 2: Table of Contents
    pdf.addPage();
    pageNum++;
    addTableOfContents(pdf, pageNum);

    // Page 3: Executive Summary
    pdf.addPage();
    pageNum++;
    addExecutiveSummary(pdf, results, pageNum);

    // Page 4: Ramp Period Analysis
    pdf.addPage();
    pageNum++;
    addRampPeriodPage(pdf, results, pageNum);

    // Page 5: Launch State
    pdf.addPage();
    pageNum++;
    addLaunchStatePage(pdf, results, pageNum);

    // Page 6: 12-Month Projections
    pdf.addPage();
    pageNum++;
    addProjectionsPage(pdf, results, pageNum);

    // Page 7: Revenue Analysis
    pdf.addPage();
    pageNum++;
    addRevenueAnalysisPage(pdf, results, pageNum);

    // Page 8: Cost Analysis
    pdf.addPage();
    pageNum++;
    addCostAnalysisPage(pdf, results, pageNum);

    // Download PDF
    const date = new Date().toISOString().split('T')[0];
    const filename = `Pillars_Financial_Business_Plan_${date}.pdf`;
    pdf.save(filename);

    hideLoadingToast();
    showSuccessToast(`Business plan exported: ${filename}`);

  } catch (error) {
    console.error('PDF export failed:', error);
    hideLoadingToast();
    showErrorToast('Failed to export PDF. Please try again.');
  }
}

// ============================================================================
// COVER PAGE
// ============================================================================

function addCoverPage(pdf: jsPDF) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Teal border
  pdf.setDrawColor(...COLORS.teal);
  pdf.setLineWidth(1);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Add flowing wave pattern (simplified version)
  pdf.setDrawColor(...COLORS.teal);
  pdf.setLineWidth(0.3);
  
  // Draw multiple curved lines to create wave effect (simplified)
  for (let i = 0; i < 15; i++) {
    const offset = i * 3;
    pdf.line(15, 30 + offset, 60, 50 + offset);
    // Simplified wave pattern without bezier curves
    pdf.line(60, 50 + offset, 140, 40 + offset);
    pdf.line(140, 40 + offset, 195, 35 + offset);
  }

  // Add Pillars logo image to cover page
  try {
    const logoPath = '/pillars-logo-cropped.png';
    // Original logo is 604x453, aspect ratio 1.33:1
    const logoWidth = 50;
    const logoHeight = logoWidth / 1.33; // Maintain aspect ratio
    // Position logo in bottom right
    pdf.addImage(logoPath, 'PNG', pageWidth - logoWidth - 15, pageHeight - logoHeight - 48, logoWidth, logoHeight);
    
    // Add tagline and year below logo
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.gray);
    pdf.text('A FRAMEWORK', pageWidth - 60, pageHeight - 48);
    
    const year = new Date().getFullYear();
    pdf.text(year.toString(), pageWidth - 15, pageHeight - 48, { align: 'right' });
  } catch (e) {
    // Fallback to text if image fails
    pdf.setTextColor(...COLORS.darkBlue);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text('pillars', pageWidth - 70, pageHeight - 55);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.gray);
    pdf.text('A FRAMEWORK', pageWidth - 70, pageHeight - 47);
    
    const year = new Date().getFullYear();
    pdf.text(year.toString(), pageWidth - 20, pageHeight - 47, { align: 'right' });
  }

  // Add document title in center
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.text('Pillars Financial Insights', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.gray);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  pdf.text(date, pageWidth / 2, pageHeight / 2 - 5, { align: 'center' });
}

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

function addTableOfContents(pdf: jsPDF, pageNum: number) {
  addPageHeader(pdf, 'INDEX', pageNum);

  const contents = [
    { title: 'Executive Summary', page: 3 },
    { title: '     Key Metrics Overview', page: 3 },
    { title: '     Investment Highlights', page: 3 },
    { title: 'Ramp Period Analysis (Months 0-6)', page: 4 },
    { title: '     Capital Deployment', page: 4 },
    { title: '     Monthly Breakdown', page: 4 },
    { title: 'Launch State (Month 7)', page: 5 },
    { title: '     Practice Snapshot', page: 5 },
    { title: '     Active Services', page: 5 },
    { title: '12-Month Projections (Months 7-18)', page: 6 },
    { title: '     Revenue Forecast', page: 6 },
    { title: '     Member Growth', page: 6 },
    { title: 'Revenue Analysis', page: 7 },
    { title: '     Revenue by Stream', page: 7 },
    { title: '     Growth Trends', page: 7 },
    { title: 'Cost Analysis', page: 8 },
    { title: '     Cost Structure', page: 8 },
    { title: '     Optimization Opportunities', page: 8 },
  ];

  let yPos = 40;
  pdf.setFontSize(10);
  
  contents.forEach(item => {
    const isMainSection = !item.title.startsWith('     ');
    
    if (isMainSection) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...COLORS.darkBlue);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...COLORS.gray);
    }
    
    pdf.text(item.title, 25, yPos);
    pdf.text(item.page.toString(), 185, yPos, { align: 'right' });
    
    yPos += isMainSection ? 8 : 6;
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================

function addExecutiveSummary(pdf: jsPDF, results: ProjectionResults, pageNum: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  addPageHeader(pdf, 'Executive Summary', pageNum);

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.text('Pillars MSO Financial Framework', 25, 35);
  
  // Subtitle in black
  pdf.setFontSize(12);
  pdf.setTextColor(...COLORS.darkBlue);
  pdf.text('EXECUTIVE SUMMARY', 25, 43);

  // Key metrics in a clean grid
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.darkBlue);

  const metrics = [
    { label: 'Capital Deployed', value: formatCurrency(Math.abs(results.kpis.totalRampBurn)), desc: 'Total investment required' },
    { label: 'Launch MRR', value: formatCurrency(results.kpis.launchMRR), desc: 'Monthly revenue at launch' },
    { label: 'Members at Launch', value: results.kpis.membersAtLaunch.toString(), desc: 'Primary care members' },
    { label: 'Cash at Launch', value: formatCurrency(results.kpis.cashPositionAtLaunch), desc: 'End of Month 6' },
    { label: '12-Month Revenue', value: formatCurrency(results.kpis.totalRevenue12Mo), desc: 'Total first year' },
    { label: '12-Month Profit', value: formatCurrency(results.kpis.totalProfit12Mo), desc: 'Net profit first year' },
    { label: 'Physician ROI', value: results.kpis.physicianROI.toFixed(1) + '%', desc: 'Annual return on investment' },
    { label: 'Breakeven', value: results.kpis.breakevenMonth ? `Month ${results.kpis.breakevenMonth}` : 'N/A', desc: 'Cash flow positive' },
  ];

  let yPos = 55;
  for (let i = 0; i < metrics.length; i += 2) {
    // Left column
    pdf.setFillColor(...COLORS.lightTeal);
    pdf.rect(25, yPos - 5, 80, 18, 'F');
    
    pdf.setTextColor(...COLORS.gray);
    pdf.setFontSize(9);
    pdf.text(metrics[i].label, 28, yPos);
    
    pdf.setTextColor(...COLORS.darkBlue);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metrics[i].value, 28, yPos + 7);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.gray);
    pdf.text(metrics[i].desc, 28, yPos + 12);

    // Right column
    if (i + 1 < metrics.length) {
      pdf.setFillColor(...COLORS.lightTeal);
      pdf.rect(110, yPos - 5, 80, 18, 'F');
      
      pdf.setTextColor(...COLORS.gray);
      pdf.setFontSize(9);
      pdf.text(metrics[i + 1].label, 113, yPos);
      
      pdf.setTextColor(...COLORS.darkBlue);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metrics[i + 1].value, 113, yPos + 7);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...COLORS.gray);
      pdf.text(metrics[i + 1].desc, 113, yPos + 12);
    }

    yPos += 23;
  }

  // Key Highlights section
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.teal);
  pdf.text('KEY HIGHLIGHTS', 25, yPos);

  yPos += 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.darkBlue);
  
  const highlights = [
    `Practice launches with ${results.launchState.primaryMembers} primary care members and ${results.launchState.specialtyMembers} specialty clients`,
    `Team of ${results.launchState.teamHeadcount} professionals providing comprehensive care`,
    `${results.launchState.activeServices.length} active service lines: ${results.launchState.activeServices.join(', ')}`,
    `Monthly revenue reaches ${formatCurrency(results.kpis.launchMRR)} at launch (Month 7)`,
    `Peak membership of ${results.kpis.peakMembers} members achieved in first 12 months`,
    `Physician ROI of ${results.kpis.physicianROI.toFixed(1)}% demonstrates strong investment returns`,
  ];

  highlights.forEach(highlight => {
    const lines = pdf.splitTextToSize(highlight, 160);
    pdf.text('•', 28, yPos);
    pdf.text(lines, 33, yPos);
    yPos += lines.length * 5;
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// RAMP PERIOD PAGE
// ============================================================================

function addRampPeriodPage(pdf: jsPDF, results: ProjectionResults, pageNum: number) {
  addPageHeader(pdf, 'Ramp Period Analysis (Months 0-6)', pageNum);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.teal);
  pdf.text('CAPITAL DEPLOYMENT & MONTHLY BREAKDOWN', 25, 35);

  const tableData = results.rampPeriod.map(month => [
    `M${month.month}`,
    month.members.primaryActive.toString(),
    formatCurrency(month.revenue.total),
    formatCurrency(month.costs.total),
    formatCurrency(month.profit),
    formatCurrency(month.cumulativeCash),
  ]);

  autoTable(pdf, {
    startY: 42,
    head: [['Month', 'Members', 'Revenue', 'Costs', 'Profit/Loss', 'Cumulative Cash']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: COLORS.teal,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.darkBlue,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightTeal,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'right', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 35, fontStyle: 'bold' },
    },
    margin: { left: 25, right: 25 },
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// LAUNCH STATE PAGE
// ============================================================================

function addLaunchStatePage(pdf: jsPDF, results: ProjectionResults, pageNum: number) {
  addPageHeader(pdf, 'Launch State (Month 7)', pageNum);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.teal);
  pdf.text('PRACTICE SNAPSHOT AT LAUNCH', 25, 35);

  const tableData = [
    ['Primary Members', results.launchState.primaryMembers.toString()],
    ['Specialty Members', results.launchState.specialtyMembers.toString()],
    ['Monthly Revenue', formatCurrency(results.launchState.monthlyRevenue)],
    ['Monthly Costs', formatCurrency(results.launchState.monthlyCosts)],
    ['Net Monthly Profit', formatCurrency(results.launchState.monthlyRevenue - results.launchState.monthlyCosts)],
    ['Team Headcount', results.launchState.teamHeadcount.toString()],
    ['Equipment Lease', formatCurrency(results.launchState.equipmentLease)],
    ['Active Services', results.launchState.activeServices.join(', ')],
  ];

  autoTable(pdf, {
    startY: 42,
    head: [['Metric', 'Value']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: COLORS.teal,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: COLORS.darkBlue,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightTeal,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 80 },
    },
    margin: { left: 25, right: 25 },
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// PROJECTIONS PAGE
// ============================================================================

function addProjectionsPage(pdf: jsPDF, results: ProjectionResults, pageNum: number) {
  addPageHeader(pdf, '12-Month Projections (Months 7-18)', pageNum);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.teal);
  pdf.text('MONTHLY FINANCIAL PROJECTIONS', 25, 35);

  const tableData = results.projection.map(month => [
    `M${month.month}`,
    month.members.primaryActive.toString(),
    month.members.specialtyActive.toString(),
    formatCurrency(month.revenue.total),
    formatCurrency(month.costs.total),
    formatCurrency(month.profit),
    formatCurrency(month.cumulativeCash),
  ]);

  autoTable(pdf, {
    startY: 42,
    head: [['Month', 'Primary', 'Specialty', 'Revenue', 'Costs', 'Profit', 'Cum. Cash']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: COLORS.teal,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.darkBlue,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightTeal,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 },
      1: { halign: 'right', cellWidth: 22 },
      2: { halign: 'right', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 26 },
      6: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
    },
    margin: { left: 25, right: 25 },
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// REVENUE ANALYSIS PAGE
// ============================================================================

function addRevenueAnalysisPage(pdf: jsPDF, results: ProjectionResults, pageNum: number) {
  addPageHeader(pdf, 'Revenue Analysis', pageNum);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.teal);
  pdf.text('REVENUE BY STREAM', 25, 35);

  const allMonths = [...results.rampPeriod, ...results.projection];
  const tableData = allMonths.map(month => [
    `M${month.month}`,
    formatCurrency(month.revenue.primary),
    formatCurrency(month.revenue.specialty),
    formatCurrency(month.revenue.corporate),
    formatCurrency(month.revenue.echo + month.revenue.ct + month.revenue.labs),
    formatCurrency(month.revenue.total),
  ]);

  autoTable(pdf, {
    startY: 42,
    head: [['Month', 'Primary', 'Specialty', 'Corporate', 'Diagnostics', 'Total']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: COLORS.teal,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLORS.darkBlue,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightTeal,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    margin: { left: 25, right: 25 },
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// COST ANALYSIS PAGE
// ============================================================================

function addCostAnalysisPage(pdf: jsPDF, results: ProjectionResults, pageNum: number) {
  addPageHeader(pdf, 'Cost Analysis', pageNum);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...COLORS.teal);
  pdf.text('COST STRUCTURE & BREAKDOWN', 25, 35);

  const allMonths = [...results.rampPeriod, ...results.projection];
  const tableData = allMonths.map(month => [
    `M${month.month}`,
    formatCurrency(month.costs.salaries),
    formatCurrency(month.costs.fixedOverhead),
    formatCurrency(month.costs.marketing),
    formatCurrency(month.costs.variable),
    formatCurrency(month.costs.total),
  ]);

  autoTable(pdf, {
    startY: 42,
    head: [['Month', 'Salaries', 'Overhead', 'Marketing', 'Variable', 'Total']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: COLORS.teal,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: COLORS.darkBlue,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightTeal,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'right', cellWidth: 28 },
      2: { halign: 'right', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 28 },
      5: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    margin: { left: 25, right: 25 },
  });

  addPageFooter(pdf, pageNum);
}

// ============================================================================
// PAGE HEADER & FOOTER
// ============================================================================

function addPageHeader(pdf: jsPDF, title: string, pageNum: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Teal border at top
  pdf.setDrawColor(...COLORS.teal);
  pdf.setLineWidth(0.5);
  pdf.line(10, 10, pageWidth - 10, 10);
  
  // Logo area (left)
  try {
    const logoPath = '/pillars-logo-cropped.png';
    // Original logo is 604x453, aspect ratio 1.33:1
    const logoWidth = 20;
    const logoHeight = logoWidth / 1.33; // Maintain aspect ratio
    pdf.addImage(logoPath, 'PNG', 15, 13, logoWidth, logoHeight);
  } catch (e) {
    // Fallback to text if image fails
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...COLORS.darkBlue);
    pdf.text('pillars', 15, 18);
  }
  
  // Title (right)
  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.teal);
  pdf.text(title.toUpperCase(), pageWidth - 15, 18, { align: 'right' });
  
  // Divider line
  pdf.setDrawColor(...COLORS.teal);
  pdf.setLineWidth(0.3);
  pdf.line(15, 22, pageWidth - 15, 22);
}

function addPageFooter(pdf: jsPDF, pageNum: number) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Divider line
  pdf.setDrawColor(...COLORS.gray);
  pdf.setLineWidth(0.3);
  pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
  
  // Footer text
  pdf.setFontSize(8);
  pdf.setTextColor(...COLORS.gray);
  pdf.text('Pillars Financial Dashboard', 15, pageHeight - 10);
  pdf.text(`Pg. ${pageNum}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  
  // Teal border at bottom
  pdf.setDrawColor(...COLORS.teal);
  pdf.setLineWidth(0.5);
  pdf.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

let loadingToastElement: HTMLElement | null = null;

function showLoadingToast(message: string): void {
  loadingToastElement = document.createElement('div');
  loadingToastElement.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
  loadingToastElement.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(loadingToastElement);
}

function hideLoadingToast(): void {
  if (loadingToastElement) {
    loadingToastElement.remove();
    loadingToastElement = null;
  }
}

function showSuccessToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showErrorToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

