import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/DashboardContext";
import { Download } from "lucide-react";

export function DashboardHeader() {
  const { activeProjection, setActiveProjection } = useDashboard();

  const projections = [
    { id: "12-month", label: "12-Month Plan" },
    { id: "ramp", label: "Ramp & Launch" },
    { id: "risk", label: "Risk Analysis" },
  ];

  return (
    <div className="border-b bg-card">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {projections.map((projection) => (
              <Button
                key={projection.id}
                variant={activeProjection === projection.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveProjection(projection.id)}
                className="gap-2"
              >
                {projection.id === activeProjection && "✓"}
                {projection.label}
              </Button>
            ))}
          </div>

          <Button variant="default" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>
    </div>
  );
}

