import { Button } from "@/components/ui/button";
import { ExportImportDialog } from "@/components/ExportImportDialog";
import { ScenarioManager } from "@/components/ScenarioManager";
import { useDashboard } from "@/contexts/DashboardContext";
import { exportConfigToExcel } from "@/lib/configDrivenExcelExport";
import { headerTabs } from "@/lib/data";
import { Download, FileSpreadsheet, FileJson, FileText, Code, Upload, Save, FolderOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { exportBusinessPlanPDF } from "@/lib/pdfExport";
import { downloadConfig, uploadConfig } from "@/lib/configManager";
import { dashboardConfig } from "@/lib/dashboardConfig";
import { SCENARIO_PRESETS, getZeroedInputs } from "@/lib/scenarioPresets";
import { saveScenario, loadScenario } from "@/lib/scenariosApi";
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
            {/* Scenario Buttons - Left side */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Scenarios:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant={inputs.scenarioMode === 'null' ? 'default' : 'outline'}
                  size="sm"
                  className={inputs.scenarioMode === 'null' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={async () => {
                    const scenarioKey = 'lean';
                    try {
                      const saved = await loadScenario(scenarioKey);
                      if (saved) {
                        updateInputs({ ...saved, scenarioMode: 'null' });
                        toast.success('Loaded Lean (saved)');
                      } else {
                        const preset = SCENARIO_PRESETS[scenarioKey];
                        updateInputs({ ...preset, scenarioMode: 'null' });
                        toast.success('Loaded Lean (preset)');
                      }
                    } catch (error) {
                      const preset = SCENARIO_PRESETS[scenarioKey];
                      updateInputs({ ...preset, scenarioMode: 'null' });
                      toast.error('Failed to load saved scenario, using preset');
                    }
                  }}
                >
                  Lean
                </Button>
                <Button
                  variant={inputs.scenarioMode === 'conservative' ? 'default' : 'outline'}
                  size="sm"
                  className={inputs.scenarioMode === 'conservative' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={async () => {
                    const scenarioKey = 'conservative';
                    try {
                      const saved = await loadScenario(scenarioKey);
                      if (saved) {
                        updateInputs({ ...saved, scenarioMode: 'conservative' });
                        toast.success('Loaded Conservative (saved)');
                      } else {
                        const preset = SCENARIO_PRESETS[scenarioKey];
                        updateInputs({ ...preset, scenarioMode: 'conservative' });
                        toast.success('Loaded Conservative (preset)');
                      }
                    } catch (error) {
                      const preset = SCENARIO_PRESETS[scenarioKey];
                      updateInputs({ ...preset, scenarioMode: 'conservative' });
                      toast.error('Failed to load saved scenario, using preset');
                    }
                  }}
                >
                  Conservative
                </Button>
                <Button
                  variant={inputs.scenarioMode === 'moderate' ? 'default' : 'outline'}
                  size="sm"
                  className={inputs.scenarioMode === 'moderate' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                  onClick={async () => {
                    const scenarioKey = 'moderate';
                    try {
                      const saved = await loadScenario(scenarioKey);
                      if (saved) {
                        updateInputs({ ...saved, scenarioMode: 'moderate' });
                        toast.success('Loaded Moderate (saved)');
                      } else {
                        const preset = SCENARIO_PRESETS[scenarioKey];
                        updateInputs({ ...preset, scenarioMode: 'moderate' });
                        toast.success('Loaded Moderate (preset)');
                      }
                    } catch (error) {
                      const preset = SCENARIO_PRESETS[scenarioKey];
                      updateInputs({ ...preset, scenarioMode: 'moderate' });
                      toast.error('Failed to load saved scenario, using preset');
                    }
                  }}
                >
                  Moderate
                </Button>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const zeroed = getZeroedInputs();
                    updateInputs(zeroed);
                    toast.success('Reset to zero');
                  }}
                  title="Reset all inputs to zero"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Zero
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const scenarioKey = inputs.scenarioMode === 'null' ? 'lean' : inputs.scenarioMode;
                    const scenarioName = scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1);
                    try {
                      await saveScenario(scenarioKey, inputs);
                      toast.success(`Saved to ${scenarioName}`);
                    } catch (error) {
                      toast.error(`Failed to save ${scenarioName}`);
                    }
                  }}
                  title="Save current inputs to selected scenario"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const scenarioKey = inputs.scenarioMode === 'null' ? 'lean' : inputs.scenarioMode;
                    const scenarioName = scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1);
                    try {
                      const saved = await loadScenario(scenarioKey);
                      if (saved) {
                        updateInputs(saved);
                        toast.success(`Reset to saved ${scenarioName}`);
                      } else {
                        const preset = SCENARIO_PRESETS[scenarioKey];
                        updateInputs(preset);
                        toast.success(`Reset to ${scenarioName} preset`);
                      }
                    } catch (error) {
                      const preset = SCENARIO_PRESETS[scenarioKey];
                      updateInputs(preset);
                      toast.error('Failed to load saved scenario, using preset');
                    }
                  }}
                  title="Reset to saved scenario or preset"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            
            {/* Header buttons - Right side */}
            <div className="flex items-center gap-2">
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

