/**
 * PDF Export Utility with Pillars Branding
 * Exports individual tabs or full dashboard as branded PDFs
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptions {
  tabName: string;
  elementId: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
}

/**
 * Export a single dashboard tab to PDF
 */
export async function exportTabToPDF(options: ExportOptions): Promise<void> {
  const { tabName, elementId, includeHeader = true, includeFooter = true } = options;
  
  try {
    // Get the element to export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Show loading indicator
    const loadingToast = showLoadingToast('Generating PDF...');

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF (A4 size: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add header with logo
    if (includeHeader) {
      await addHeader(pdf, tabName, pageWidth);
    }

    // Calculate content area
    const headerHeight = includeHeader ? 30 : 10;
    const footerHeight = includeFooter ? 15 : 5;
    const contentHeight = pageHeight - headerHeight - footerHeight;
    
    // Calculate image dimensions to fit page
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add content (may span multiple pages)
    let yPosition = headerHeight;
    let remainingHeight = imgHeight;
    let sourceY = 0;
    
    while (remainingHeight > 0) {
      const heightToAdd = Math.min(remainingHeight, contentHeight);
      const sourceHeight = (heightToAdd / imgHeight) * canvas.height;
      
      // Create a temporary canvas for this page's content
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          canvas.width, sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', 10, yPosition, imgWidth, heightToAdd);
      }
      
      // Add footer
      if (includeFooter) {
        addFooter(pdf, pageWidth, pageHeight);
      }
      
      remainingHeight -= heightToAdd;
      sourceY += sourceHeight;
      
      // Add new page if more content remains
      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = 10;
      }
    }

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `Pillars_${tabName.replace(/\s+/g, '_')}_${date}.pdf`;

    // Download PDF
    pdf.save(filename);

    // Hide loading indicator
    hideLoadingToast(loadingToast);
    
    // Show success message
    showSuccessToast(`PDF exported: ${filename}`);
    
  } catch (error) {
    console.error('PDF export failed:', error);
    showErrorToast('Failed to export PDF. Please try again.');
  }
}

/**
 * Export all dashboard tabs to a single PDF
 */
export async function exportFullDashboardToPDF(): Promise<void> {
  try {
    const loadingToast = showLoadingToast('Generating full dashboard PDF...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Tabs to export (in order)
    const tabs = [
      { name: 'Ramp & Launch', elementId: 'ramp-launch-content' },
      { name: '12-Month Projection', elementId: 'projection-content' },
      { name: 'Cash Flow & Balance Sheet', elementId: 'cashflow-content' },
      { name: 'Risk Analysis', elementId: 'risk-content' },
      { name: 'P&L Summary', elementId: 'pl-content' },
      { name: 'Physician ROI', elementId: 'physician-roi-content' },
    ];

    let isFirstPage = true;

    for (const tab of tabs) {
      const element = document.getElementById(tab.elementId);
      if (!element) {
        console.warn(`Element "${tab.elementId}" not found, skipping...`);
        continue;
      }

      // Add new page for each tab (except first)
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Add header with tab name
      await addHeader(pdf, tab.name, pageWidth);

      // Capture tab content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate dimensions
      const headerHeight = 30;
      const footerHeight = 15;
      const contentHeight = pageHeight - headerHeight - footerHeight;
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add content (simplified for full export - single page per tab)
      const heightToUse = Math.min(imgHeight, contentHeight);
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, headerHeight, imgWidth, heightToUse);

      // Add footer
      addFooter(pdf, pageWidth, pageHeight);
    }

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const filename = `Pillars_Full_Dashboard_${date}.pdf`;

    // Download PDF
    pdf.save(filename);

    hideLoadingToast(loadingToast);
    showSuccessToast(`Full dashboard exported: ${filename}`);
    
  } catch (error) {
    console.error('Full dashboard export failed:', error);
    showErrorToast('Failed to export full dashboard. Please try again.');
  }
}

/**
 * Add branded header with Pillars logo
 */
async function addHeader(pdf: jsPDF, title: string, pageWidth: number): Promise<void> {
  // Add logo
  try {
    const logoImg = await loadImage('/pillars-logo.png');
    const logoWidth = 40;
    const logoHeight = 10;
    pdf.addImage(logoImg, 'PNG', 10, 10, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Failed to load logo:', error);
  }

  // Add title
  pdf.setFontSize(16);
  pdf.setTextColor(31, 41, 55); // gray-800
  pdf.text(title, pageWidth / 2, 17, { align: 'center' });

  // Add divider line with gradient colors
  pdf.setDrawColor(45, 212, 191); // teal-400
  pdf.setLineWidth(0.5);
  pdf.line(10, 25, pageWidth - 10, 25);
}

/**
 * Add branded footer
 */
function addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
  const footerY = pageHeight - 10;
  
  // Add divider line
  pdf.setDrawColor(229, 231, 235); // gray-200
  pdf.setLineWidth(0.3);
  pdf.line(10, footerY - 5, pageWidth - 10, footerY - 5);
  
  // Add footer text
  pdf.setFontSize(8);
  pdf.setTextColor(107, 114, 128); // gray-500
  
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  pdf.text('Generated by Pillars Financial Dashboard', 10, footerY);
  pdf.text(date, pageWidth - 10, footerY, { align: 'right' });
}

/**
 * Load image as base64
 */
function loadImage(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Toast notification helpers
 */
function showLoadingToast(message: string): HTMLElement {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3';
  toast.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function hideLoadingToast(toast: HTMLElement): void {
  toast.remove();
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

