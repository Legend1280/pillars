import { useDashboard } from "@/contexts/DashboardContext";
import { RampLaunchTab } from "@/components/RampLaunchTab";
import { ProjectionTab } from "@/components/ProjectionTab";
import { CashFlowTab } from "@/components/CashFlowTab";
import { PLSummaryTab } from "@/components/PLSummaryTab";
import { LogicPrimitivesTab } from "@/components/LogicPrimitivesTab";
import { RiskAnalysisTab } from "@/components/RiskAnalysisTab";
import { PhysicianROITab } from "@/components/PhysicianROITab";
import { MasterDebugTab } from "@/components/MasterDebugTab";

export function OverviewSection() {
  const { activeTab, setActiveTab } = useDashboard();

  const tabs = [
    { id: 'ramp', label: 'Ramp & Launch', component: <RampLaunchTab /> },
    { id: 'projection', label: '12-Month Projection', component: <ProjectionTab /> },
    { id: 'cashflow', label: 'Cash Flow & Balance Sheet', component: <CashFlowTab /> },
    { id: 'risk', label: 'Risk Analysis', component: <RiskAnalysisTab /> },
    { id: 'pl', label: 'P&L Summary', component: <PLSummaryTab /> },
    { id: 'physician-roi', label: 'Physician ROI', component: <PhysicianROITab /> },
    { id: 'logic', label: 'Logic & Primitives', component: <LogicPrimitivesTab /> },
    { id: 'master-debug', label: 'Master Debug', component: <MasterDebugTab /> },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  
  console.log('OverviewSection render', { activeTab, hasActiveTabData: !!activeTabData });

  return (
    <div className="space-y-6">
      {/* Tab Buttons - Horizontal scroll on mobile */}
      <div className="flex gap-2 border-b overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              console.log('Tab clicked:', tab.id);
              setActiveTab(tab.id);
            }}
            className={`px-3 md:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
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

