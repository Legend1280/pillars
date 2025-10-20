import { Router } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';

const router = Router();

const REPORTS_FILE = join(process.cwd(), 'data', 'analysis-reports.json');

/**
 * Analysis Report Structure with Provenance
 * 
 * Reports are stored with provenance metadata at the top for easy ingestion
 * and tracking of when/how the analysis was performed.
 */

interface AnalysisReport {
  // Provenance (metadata at top)
  provenance: {
    reportId: string;
    timestamp: string;
    scenario: string;
    modelVersion: string;
    totalNodes: number;
    totalEdges: number;
    totalPhysicians: number;
    launchMonth: number;
    capitalDeployed: number;
    manusTaskUrl?: string;
    manusShareUrl?: string;
  };
  
  // Analysis Results
  analysis: {
    step1Summary: string;
    step2Summary: string;
    inaccuracies: Array<{
      title: string;
      description: string;
      priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      impact: string;
      recommendation: string;
    }>;
    strengths: string[];
    overallAssessment: string;
  };
}

/**
 * Load all analysis reports from file
 */
async function loadReports(): Promise<AnalysisReport[]> {
  try {
    const data = await fs.readFile(REPORTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Save reports to file
 */
async function saveReports(reports: AnalysisReport[]): Promise<void> {
  await fs.writeFile(REPORTS_FILE, JSON.stringify(reports, null, 2), 'utf-8');
}

/**
 * GET /api/analysis-reports
 * List all analysis reports
 */
router.get('/analysis-reports', async (req, res) => {
  try {
    const reports = await loadReports();
    res.json({ reports });
  } catch (error) {
    console.error('Error loading reports:', error);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

/**
 * POST /api/analysis-reports
 * Save a new analysis report
 */
router.post('/analysis-reports', async (req, res) => {
  try {
    const { provenance, analysis } = req.body;

    if (!provenance || !analysis) {
      return res.status(400).json({ error: 'Missing provenance or analysis data' });
    }

    // Load existing reports
    const reports = await loadReports();

    // Create new report with provenance at top
    const newReport: AnalysisReport = {
      provenance: {
        reportId: provenance.reportId || `report_${Date.now()}`,
        timestamp: new Date().toISOString(),
        scenario: provenance.scenario || 'Unknown',
        modelVersion: '1.0',
        totalNodes: provenance.totalNodes || 0,
        totalEdges: provenance.totalEdges || 0,
        totalPhysicians: provenance.totalPhysicians || 0,
        launchMonth: provenance.launchMonth || 6,
        capitalDeployed: provenance.capitalDeployed || 0,
        manusTaskUrl: provenance.manusTaskUrl,
        manusShareUrl: provenance.manusShareUrl,
      },
      analysis: {
        step1Summary: analysis.step1Summary || '',
        step2Summary: analysis.step2Summary || '',
        inaccuracies: analysis.inaccuracies || [],
        strengths: analysis.strengths || [],
        overallAssessment: analysis.overallAssessment || '',
      },
    };

    // Add to reports (most recent first)
    reports.unshift(newReport);

    // Keep only last 50 reports
    const trimmedReports = reports.slice(0, 50);

    // Save to file
    await saveReports(trimmedReports);

    console.log(`✅ Saved analysis report: ${newReport.provenance.reportId}`);

    res.json({ 
      success: true, 
      reportId: newReport.provenance.reportId,
      report: newReport 
    });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

/**
 * GET /api/analysis-reports/:reportId
 * Get a specific analysis report
 */
router.get('/analysis-reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const reports = await loadReports();
    
    const report = reports.find(r => r.provenance.reportId === reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error loading report:', error);
    res.status(500).json({ error: 'Failed to load report' });
  }
});

/**
 * DELETE /api/analysis-reports/:reportId
 * Delete a specific analysis report
 */
router.delete('/analysis-reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const reports = await loadReports();
    
    const filteredReports = reports.filter(r => r.provenance.reportId !== reportId);
    
    if (filteredReports.length === reports.length) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await saveReports(filteredReports);

    console.log(`🗑️ Deleted analysis report: ${reportId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

/**
 * GET /api/analysis-reports/export/:reportId
 * Export a report in a formatted, human-readable format
 */
router.get('/analysis-reports/export/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const reports = await loadReports();
    
    const report = reports.find(r => r.provenance.reportId === reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Format as markdown for easy reading
    const markdown = `# Financial Model Analysis Report

## Provenance
- **Report ID**: ${report.provenance.reportId}
- **Timestamp**: ${report.provenance.timestamp}
- **Scenario**: ${report.provenance.scenario}
- **Model Version**: ${report.provenance.modelVersion}
- **Total Nodes**: ${report.provenance.totalNodes}
- **Total Edges**: ${report.provenance.totalEdges}
- **Total Physicians**: ${report.provenance.totalPhysicians}
- **Launch Month**: ${report.provenance.launchMonth}
- **Capital Deployed**: $${report.provenance.capitalDeployed.toLocaleString()}
${report.provenance.manusTaskUrl ? `- **Manus Task URL**: ${report.provenance.manusTaskUrl}` : ''}
${report.provenance.manusShareUrl ? `- **Manus Share URL**: ${report.provenance.manusShareUrl}` : ''}

---

## Step 1: Ontology Graph Assessment
${report.analysis.step1Summary}

## Step 2: Calculation Code Assessment
${report.analysis.step2Summary}

## Inaccuracies Found

${report.analysis.inaccuracies.length === 0 ? 'No inaccuracies found.' : report.analysis.inaccuracies.map((issue, i) => `
### ${i + 1}. ${issue.title} [${issue.priority}]

**Description**: ${issue.description}

**Impact**: ${issue.impact}

**Recommendation**: ${issue.recommendation}
`).join('\n')}

## Strengths

${report.analysis.strengths.map(s => `- ${s}`).join('\n')}

## Overall Assessment

${report.analysis.overallAssessment}

---

*Generated by Pillars Financial Dashboard - AI Analysis System*
`;

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="analysis-${reportId}.md"`);
    res.send(markdown);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

export default router;

