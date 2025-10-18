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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/contexts/DashboardContext";
import { defaultInputs } from "@/lib/data";
import { Download, Upload, Save, RotateCcw, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SavedScenario {
  name: string;
  timestamp: number;
  inputs: any;
}

export function ScenarioManager({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { inputs, updateInputs, resetInputs } = useDashboard();
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string>("default");
  const [newScenarioName, setNewScenarioName] = useState("");
  const [showSaveAs, setShowSaveAs] = useState(false);

  // Load scenarios from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pillars-scenarios");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScenarios(parsed);
      } catch (e) {
        console.error("Failed to load scenarios:", e);
      }
    }
    
    // Load last selected scenario
    const lastScenario = localStorage.getItem("pillars-last-scenario");
    if (lastScenario) {
      setCurrentScenario(lastScenario);
    }
  }, []);

  // Save scenarios to localStorage whenever they change
  const saveScenarios = (updatedScenarios: SavedScenario[]) => {
    localStorage.setItem("pillars-scenarios", JSON.stringify(updatedScenarios));
    setScenarios(updatedScenarios);
  };

  // Load a scenario
  const loadScenario = (scenarioName: string) => {
    if (scenarioName === "default") {
      resetInputs();
      setCurrentScenario("default");
      localStorage.setItem("pillars-last-scenario", "default");
      toast.success("Loaded default scenario");
      return;
    }

    const scenario = scenarios.find((s) => s.name === scenarioName);
    if (scenario) {
      updateInputs(scenario.inputs);
      setCurrentScenario(scenarioName);
      localStorage.setItem("pillars-last-scenario", scenarioName);
      toast.success(`Loaded scenario: ${scenarioName}`);
    }
  };

  // Save current inputs to the selected scenario
  const saveCurrentScenario = () => {
    if (currentScenario === "default") {
      toast.error("Cannot overwrite default scenario. Use 'Save As New' instead.");
      return;
    }

    const updatedScenarios = scenarios.map((s) =>
      s.name === currentScenario
        ? { ...s, inputs, timestamp: Date.now() }
        : s
    );
    saveScenarios(updatedScenarios);
    toast.success(`Saved changes to: ${currentScenario}`);
  };

  // Save as new scenario
  const saveAsNew = () => {
    if (!newScenarioName.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }

    if (scenarios.some((s) => s.name === newScenarioName)) {
      toast.error("A scenario with this name already exists");
      return;
    }

    const newScenario: SavedScenario = {
      name: newScenarioName,
      timestamp: Date.now(),
      inputs,
    };

    const updatedScenarios = [...scenarios, newScenario];
    saveScenarios(updatedScenarios);
    setCurrentScenario(newScenarioName);
    localStorage.setItem("pillars-last-scenario", newScenarioName);
    setNewScenarioName("");
    setShowSaveAs(false);
    toast.success(`Created new scenario: ${newScenarioName}`);
  };

  // Delete a scenario
  const deleteScenario = (scenarioName: string) => {
    if (scenarioName === "default") {
      toast.error("Cannot delete default scenario");
      return;
    }

    const updatedScenarios = scenarios.filter((s) => s.name !== scenarioName);
    saveScenarios(updatedScenarios);
    
    if (currentScenario === scenarioName) {
      setCurrentScenario("default");
      localStorage.setItem("pillars-last-scenario", "default");
      resetInputs();
    }
    
    toast.success(`Deleted scenario: ${scenarioName}`);
  };

  // Export scenario to JSON
  const exportScenario = () => {
    const scenario = currentScenario === "default" 
      ? { name: "default", timestamp: Date.now(), inputs: defaultInputs }
      : scenarios.find((s) => s.name === currentScenario);

    if (!scenario) return;

    const dataStr = JSON.stringify(scenario, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pillars_${scenario.name}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Scenario exported");
  };

  // Import scenario from JSON
  const importScenario = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        
        if (!imported.name || !imported.inputs) {
          toast.error("Invalid scenario file");
          return;
        }

        // Check if scenario already exists
        let finalName = imported.name;
        let counter = 1;
        while (scenarios.some((s) => s.name === finalName)) {
          finalName = `${imported.name} (${counter})`;
          counter++;
        }

        const newScenario: SavedScenario = {
          name: finalName,
          timestamp: Date.now(),
          inputs: imported.inputs,
        };

        const updatedScenarios = [...scenarios, newScenario];
        saveScenarios(updatedScenarios);
        setCurrentScenario(finalName);
        localStorage.setItem("pillars-last-scenario", finalName);
        updateInputs(imported.inputs);
        toast.success(`Imported scenario: ${finalName}`);
      } catch (error) {
        toast.error("Failed to import scenario");
        console.error(error);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Scenario Manager</DialogTitle>
          <DialogDescription>
            Select, save, and manage your financial scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scenario Selector */}
          <div className="space-y-2">
            <Label>Current Scenario</Label>
            <Select value={currentScenario} onValueChange={loadScenario}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default (Factory Settings)</SelectItem>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.name} value={scenario.name}>
                    {scenario.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={saveCurrentScenario}
              disabled={currentScenario === "default"}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Scenario
            </Button>

            <Button
              onClick={() => setShowSaveAs(!showSaveAs)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Save As New
            </Button>

            <Button
              onClick={() => {
                resetInputs();
                setCurrentScenario("default");
                localStorage.setItem("pillars-last-scenario", "default");
                toast.success("Reset to default values");
              }}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Defaults
            </Button>

            <Button
              onClick={() => deleteScenario(currentScenario)}
              disabled={currentScenario === "default"}
              variant="destructive"
              className="gap-2"
            >
              Delete Scenario
            </Button>
          </div>

          {/* Save As New Form */}
          {showSaveAs && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <Label>New Scenario Name</Label>
              <Input
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                placeholder="e.g., Conservative Q1 2025"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveAsNew();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button onClick={saveAsNew} size="sm" className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowSaveAs(false);
                    setNewScenarioName("");
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Export/Import */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={exportScenario} variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Export to JSON
            </Button>
            <Button onClick={importScenario} variant="outline" className="flex-1 gap-2">
              <Upload className="h-4 w-4" />
              Import from JSON
            </Button>
          </div>

          {/* Scenario List */}
          {scenarios.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Saved Scenarios ({scenarios.length})</Label>
              <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.name}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <span className="font-medium">{scenario.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(scenario.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

