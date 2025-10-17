import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/contexts/DashboardContext";
import { DashboardInputs } from "@/lib/data";
import {
  downloadJSON,
  exportPrimitives,
  getSavedScenarios,
  importPrimitives,
  saveScenarioToLocal,
  deleteScenario,
  SectionedScenarioExport,
} from "@/lib/exportImport";
import { convertSectionedToInputs } from "@/lib/exportImport";
import { Download, Upload, Save, Trash2, FileJson } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportDialog({ open, onOpenChange }: ExportImportDialogProps) {
  const { inputs, updateInputs } = useDashboard();
  const [scenarioName, setScenarioName] = useState("My Scenario");
  const [savedScenarios, setSavedScenarios] = useState<SectionedScenarioExport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSavedScenarios(getSavedScenarios());
    }
  }, [open]);

  const handleExport = () => {
    const scenario = exportPrimitives(inputs, scenarioName);
    const filename = `pillars_${scenarioName.replace(/\s+/g, "_")}_${Date.now()}.json`;
    downloadJSON(scenario, filename);
    toast.success("Scenario exported successfully!");
  };

  const handleSave = () => {
    saveScenarioToLocal(inputs, scenarioName);
    setSavedScenarios(getSavedScenarios());
    toast.success("Scenario saved locally!");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedInputs = await importPrimitives(file);
      updateInputs(importedInputs);
      toast.success(`Scenario imported successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  };

  const handleLoadScenario = (scenario: SectionedScenarioExport) => {
    // Import function already handles conversion
    const file = new File([JSON.stringify(scenario)], 'temp.json');
    importPrimitives(file).then((loadedInputs) => {
      updateInputs(loadedInputs);
      setScenarioName(scenario.scenario_id);
      toast.success(`Loaded: ${scenario.scenario_id}`);
      onOpenChange(false);
    });
  };

  const handleDeleteScenario = (timestamp: string) => {
    deleteScenario(timestamp);
    setSavedScenarios(getSavedScenarios());
    toast.success("Scenario deleted");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Scenarios</DialogTitle>
          <DialogDescription>
            Export, import, or load saved primitive configurations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Scenario Name</Label>
              <Input
                id="scenario-name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="e.g., Conservative Q1 2025"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExport} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Export to JSON
              </Button>
              <Button onClick={handleSave} variant="outline" className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                Save Locally
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-md">
              <p><strong>Export to JSON:</strong> Downloads a file you can edit and re-import</p>
              <p><strong>Save Locally:</strong> Stores in browser for quick access</p>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Select a JSON file to import primitives
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-md">
              <p><strong>Import replaces all current values</strong></p>
              <p>Make sure to save your current scenario first if needed</p>
            </div>
          </TabsContent>

          {/* Saved Scenarios Tab */}
          <TabsContent value="saved" className="space-y-4">
            {savedScenarios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No saved scenarios yet</p>
                <p className="text-xs mt-2">Use the Export tab to save scenarios</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedScenarios.map((scenario) => (
                  <div
                    key={scenario.timestamp}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{scenario.scenario_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scenario.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadScenario(scenario)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteScenario(scenario.timestamp)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

