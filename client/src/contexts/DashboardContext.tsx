import { DashboardInputs, defaultInputs } from "@/lib/data";
import { createContext, ReactNode, useContext, useState } from "react";

interface DashboardContextType {
  inputs: DashboardInputs;
  updateInputs: (updates: Partial<DashboardInputs>) => void;
  resetInputs: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<DashboardInputs>(defaultInputs);
  const [activeSection, setActiveSection] = useState("inputs");
  const [activeTab, setActiveTab] = useState("12-month");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        activeSection,
        setActiveSection,
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

