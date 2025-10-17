import { DashboardInputs, defaultInputs } from "@/lib/data";
import { createContext, ReactNode, useContext, useState } from "react";

interface DashboardContextType {
  inputs: DashboardInputs;
  updateInputs: (updates: Partial<DashboardInputs>) => void;
  resetInputs: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  activeProjection: string;
  setActiveProjection: (projection: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<DashboardInputs>(defaultInputs);
  const [activeSection, setActiveSection] = useState("inputs");
  const [activeProjection, setActiveProjection] = useState("12-month");

  const updateInputs = (updates: Partial<DashboardInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updates,
      foundingPhysician: {
        ...prev.foundingPhysician,
        ...(updates.foundingPhysician || {}),
      },
      monthlyGrowth: {
        ...prev.monthlyGrowth,
        ...(updates.monthlyGrowth || {}),
      },
      primaryCare: {
        ...prev.primaryCare,
        ...(updates.primaryCare || {}),
      },
      specialtyCare: {
        ...prev.specialtyCare,
        ...(updates.specialtyCare || {}),
      },
      diagnostics: {
        ...prev.diagnostics,
        ...(updates.diagnostics || {}),
      },
      corporate: {
        ...prev.corporate,
        ...(updates.corporate || {}),
      },
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
        activeProjection,
        setActiveProjection,
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

