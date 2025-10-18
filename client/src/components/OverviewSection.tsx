import { useDashboard } from "@/contexts/DashboardContext";
import { RampLaunchTab } from "@/components/RampLaunchTab";
import { ProjectionTab } from "@/components/ProjectionTab";
import { PLSummaryTab } from "@/components/PLSummaryTab";

export function OverviewSection() {
  const { activeTab, setActiveTab } = useDashboard();

  const tabs = [
    { id: 'ramp', label: 'Ramp & Launch', component: <RampLaunchTab /> },
    { id: 'projection', label: '12-Month Projection', component: <ProjectionTab /> },
    { id: 'risk', label: 'Risk Analysis', component: (
      <div className="text-center py-12 text-muted-foreground">
        <h3 className="text-xl font-semibold mb-2">Risk Analysis Coming Soon</h3>
        <p>Monte Carlo simulation and sensitivity analysis will be available in the next update.</p>
      </div>
    )},
    { id: 'pl', label: 'P&L Summary', component: <PLSummaryTab /> },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  console.log('OverviewSection render', { activeTab, hasActiveTabData: !!activeTabData });

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              console.log('Tab clicked:', tab.id);
              setActiveTab(tab.id);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-teal-600 text-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTabData ? activeTabData.component : <div>No active tab</div>}
      </div>
    </div>
  );
}

