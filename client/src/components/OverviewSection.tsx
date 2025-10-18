import { useDashboard } from "@/contexts/DashboardContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RampLaunchTab } from "@/components/RampLaunchTab";
import { ProjectionTab } from "@/components/ProjectionTab";
import { PLSummaryTab } from "@/components/PLSummaryTab";

export function OverviewSection() {
  const { activeTab, setActiveTab } = useDashboard();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ramp">Ramp & Launch</TabsTrigger>
          <TabsTrigger value="projection">12-Month Projection</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="pl">P&L Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="ramp" className="mt-6">
          <RampLaunchTab />
        </TabsContent>

        <TabsContent value="projection" className="mt-6">
          <ProjectionTab />
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <h3 className="text-xl font-semibold mb-2">Risk Analysis Coming Soon</h3>
            <p>Monte Carlo simulation and sensitivity analysis will be available in the next update.</p>
          </div>
        </TabsContent>

        <TabsContent value="pl" className="mt-6">
          <PLSummaryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

