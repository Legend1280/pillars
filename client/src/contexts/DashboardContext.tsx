import { DashboardInputs, defaultInputs, DerivedVariables, calculateDerivedVariables, scenarioPresets } from "@/lib/data";
import { createContext, ReactNode, useContext, useState, useEffect, useRef } from "react";

interface DashboardContextType {
  inputs: DashboardInputs;
  updateInputs: (updates: Partial<DashboardInputs>) => void;
  resetInputs: () => void;
  derivedVariables: DerivedVariables;
  activeSection: string;
  setActiveSection: (section: string) => void;
  expandedSections: Record<string, boolean>;
  setExpandedSections: (sections: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  navigateToSection: (sectionId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<DashboardInputs>(defaultInputs);
  const [activeSection, setActiveSection] = useState("inputs");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("ramp");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [derivedVariables, setDerivedVariables] = useState<DerivedVariables>(calculateDerivedVariables(defaultInputs));
  
  // Navigate to a section and auto-expand it
  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: true
    }));
  };

  const previousScenarioMode = useRef(inputs.scenarioMode);

  // Recalculate derived variables when inputs change
  useEffect(() => {
    setDerivedVariables(calculateDerivedVariables(inputs));
  }, [inputs]);

  // Apply scenario preset when scenario mode changes
  useEffect(() => {
    if (inputs.scenarioMode !== previousScenarioMode.current) {
      previousScenarioMode.current = inputs.scenarioMode;
      const preset = scenarioPresets[inputs.scenarioMode];
      if (preset) {
        setInputs((prev) => ({
          ...prev,
          ...preset,
          scenarioMode: inputs.scenarioMode, // Preserve the scenario mode
        }));
      }
    }
  }, [inputs.scenarioMode]);

  const updateInputs = (updates: Partial<DashboardInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const resetInputs = () => {
    setInputs(defaultInputs);
  };

  return (
    <DashboardContext.Provider
      value={{
        inputs,
        updateInputs,
        resetInputs,
        derivedVariables,
        activeSection,
        setActiveSection,
        expandedSections,
        setExpandedSections,
        navigateToSection,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}

