import { DashboardInputs, defaultInputs, DerivedVariables, getDerivedVariables, scenarioPresets } from "@/lib/data";
import { calculateProjections, ProjectionResults } from "@/lib/calculations";
import { createContext, ReactNode, useContext, useState, useEffect, useRef } from "react";
import { loadScenario } from "@/lib/scenariosApi";

interface DashboardContextType {
  inputs: DashboardInputs;
  updateInputs: (updates: Partial<DashboardInputs>) => void;
  resetInputs: () => void;
  derivedVariables: DerivedVariables;
  projections: ProjectionResults;
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
  // All sections closed by default on page load
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("ramp");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [derivedVariables, setDerivedVariables] = useState<DerivedVariables>(getDerivedVariables(defaultInputs));
  const [projections, setProjections] = useState<ProjectionResults>(calculateProjections(defaultInputs));
  
  // Navigate to a section and auto-expand it
  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: true
    }));
  };

  const previousScenarioMode = useRef(inputs.scenarioMode);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load last saved scenario on mount
  useEffect(() => {
    const initializeScenario = async () => {
      const lastScenario = localStorage.getItem('pillars-last-scenario') || 'conservative';
      try {
        const saved = await loadScenario(lastScenario);
        if (saved) {
          console.log('🔄 Loaded saved scenario on mount:', lastScenario);
          setInputs({ ...saved, scenarioMode: lastScenario as any });
        }
      } catch (error) {
        console.error('Failed to load scenario on mount:', error);
      }
      setIsInitialized(true);
    };
    initializeScenario();
  }, []);

  // Recalculate derived variables and projections when inputs change
  useEffect(() => {
    console.log('⚡ DashboardContext: useEffect triggered - inputs changed');
    console.log('📊 Current inputs:', inputs);
    setDerivedVariables(getDerivedVariables(inputs));
    const newProjections = calculateProjections(inputs);
    console.log('📈 New projections KPIs:', {
      totalRevenue12Mo: newProjections.kpis.totalRevenue12Mo,
      totalProfit12Mo: newProjections.kpis.totalProfit12Mo,
      peakMembers: newProjections.kpis.peakMembers
    });
    setProjections(newProjections);
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
    console.log('🔄 updateInputs called with:', updates);
    setInputs((prev) => {
      const newInputs = { ...prev, ...updates };
      console.log('✅ New inputs state:', newInputs);
      return newInputs;
    });
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
        projections,
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

