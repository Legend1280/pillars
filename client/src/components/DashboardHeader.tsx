import { Button } from "@/components/ui/button";
import { ExportImportDialog } from "@/components/ExportImportDialog";
import { ScenarioManager } from "@/components/ScenarioManager";
import { useDashboard } from "@/contexts/DashboardContext";
import { exportConfigToExcel } from "@/lib/configDrivenExcelExport";
import { headerTabs } from "@/lib/data";
import { Download, FileSpreadsheet, FileJson, FileText, Code, Upload, Save, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { exportBusinessPlanPDF } from "@/lib/pdfExport";
import { downloadConfig, uploadConfig } from "@/lib/configManager";
import { dashboardConfig } from "@/lib/dashboardConfig";
import { useState, useEffect } from "react";

export function DashboardHeader() {
  const { activeTab, setActiveTab, inputs, updateInputs } = useDashboard();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [scenarioManagerOpen, setScenarioManagerOpen] = useState(false);
  const [currentScenarioName, setCurrentScenarioName] = useState(() => {
    return localStorage.getItem('pillars-last-scenario') || 'default';
  });
  const [devMode, setDevMode] = useState(() => {
    // Load dev mode state from localStorage
    const saved = localStorage.getItem('pillars-dev-mode');
    return saved === 'true';
  });

  // Save dev mode state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pillars-dev-mode', devMode.toString());
  }, [devMode]);

  return (
    <>
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Header buttons */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Scenario Editor Button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setScenarioManagerOpen(true)}
              >
                <FolderOpen className="h-4 w-4" />
                Scenario Editor
              </Button>
              {/* Dev Mode Toggle */}
              <Button
                variant={devMode ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setDevMode(!devMode)}
                title={devMode ? "Dev Mode: ON" : "Dev Mode: OFF"}
              >
                <Code className="h-4 w-4" />
                Dev Mode
              </Button>
              
              {/* Dev-only buttons */}
              {devMode && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setExportDialogOpen(true)}
                  >
                    <FileJson className="h-4 w-4" />
                    Manage Scenarios
                  </Button>
                  
                  <button
                    onClick={() => {
                      exportConfigToExcel(inputs);
                      toast.success('CSV file exported');
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-gray-500 text-white shadow-md hover:bg-gray-600 transition-all flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export to CSV
                  </button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      downloadConfig(dashboardConfig);
                      toast.success('Dashboard config downloaded');
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Config
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      try {
                        const config = await uploadConfig();
                        toast.success('Config uploaded successfully');
                        // Note: Config upload doesn't automatically apply changes
                        // It just validates and returns the config
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Upload failed');
                      }
                    }}
                  >
                    <Upload className="h-4 w-4" />
                    Upload Config
                  </Button>
                </>
              )}
              
              {/* Always visible PDF export */}
              <button
                onClick={async () => {
                  await exportBusinessPlanPDF(inputs);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-purple-500 text-white shadow-md hover:bg-purple-600 transition-all flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Export Business Plan PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <ExportImportDialog 
        open={exportDialogOpen} 
        onOpenChange={setExportDialogOpen} 
      />
      
      <ScenarioManager
        open={scenarioManagerOpen}
        onOpenChange={setScenarioManagerOpen}
      />
    </>
  );
}

