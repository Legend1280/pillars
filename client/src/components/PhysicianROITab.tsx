import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Gem,
  Layers,
  Users,
  Heart,
  UserCheck
} from "lucide-react";
import { useMemo, useState } from "react";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { formulas, detailedFormulas } from "@/lib/formulas";
import { BUSINESS_RULES, getMSOFee, getEquityShare } from "@/lib/constants";

export function PhysicianROITab() {
  const { inputs, projections } = useDashboard();
  const { kpis } = projections;
  const [selectedMultiple, setSelectedMultiple] = useState(2);
  
  // Get Month 12 data from real projections
  const month12 = projections.projection[11]; // Month 18 (index 11 of 12-month projection)
  
  // Format helpers
  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatRatio = (value: number) => {
    return `${value.toFixed(1)}:1`;
  };
  
  // Derived values for display (not recalculations)
  const investment = inputs.foundingToggle 
    ? BUSINESS_RULES.FOUNDING_INVESTMENT 
    : BUSINESS_RULES.ADDITIONAL_INVESTMENT;
  
  const serviceFee = getMSOFee(inputs.foundingToggle) * 100;
  const equityStake = getEquityShare(inputs.foundingToggle) * 100;
  
  // Calculate dynamic equity value based on selected multiple
  const annualProfit = month12.profit * 12;
  const msoValuation = annualProfit * selectedMultiple;
  const dynamicEquityValue = msoValuation * (equityStake / 100);
  
  // Income breakdown from centralized KPI calculation (single source of truth)
  const incomeBreakdown = kpis.monthlyIncomeBreakdown;
  
  // Revenue diversity - physician's profit share from each MSO revenue stream
  const revenueDiversity = useMemo(() => {
    // Calculate physician's share of each revenue stream
    // Specialty: physician keeps (1 - serviceFee)
    // Other streams: physician gets equityStake% of profit
    
    const serviceFeeDecimal = serviceFee / 100;
    const equityStakeDecimal = equityStake / 100;
    
    // Physician's direct specialty revenue
    const specialtyPhysicianShare = month12.revenue.specialty * (1 - serviceFeeDecimal);
    
    // For other revenue streams, physician gets equity share of the profit
    // Simplified: assume same margin across all streams for equity calculation
    const profitMargin = month12.profit / month12.revenue.total;
    
    const primaryPhysicianShare = month12.revenue.primary * profitMargin * equityStakeDecimal;
    const diagnosticsPhysicianShare = (month12.revenue.echo + month12.revenue.ct + month12.revenue.labs) * profitMargin * equityStakeDecimal;
    const corporatePhysicianShare = month12.revenue.corporate * profitMargin * equityStakeDecimal;
    
    return [
      { 
        source: 'Specialty Care', 
        msoRevenue: month12.revenue.specialty,
        physicianProfit: specialtyPhysicianShare,
        mechanism: `${100 - serviceFee}% retained`
      },
      { 
        source: 'Primary Care', 
        msoRevenue: month12.revenue.primary,
        physicianProfit: primaryPhysicianShare,
        mechanism: `${equityStake}% equity`
      },
      { 
        source: 'Diagnostics', 
        msoRevenue: month12.revenue.echo + month12.revenue.ct + month12.revenue.labs,
        physicianProfit: diagnosticsPhysicianShare,
        mechanism: `${equityStake}% equity`
      },
      { 
        source: 'Corporate', 
        msoRevenue: month12.revenue.corporate,
        physicianProfit: corporatePhysicianShare,
        mechanism: `${equityStake}% equity`
      },
    ];
  }, [serviceFee, equityStake, month12]);
  
  // Valuation multiples
  const valuationScenarios = [
    { multiple: 2, label: '2X Earnings', description: 'Conservative', color: '#ef4444' },
    { multiple: 3, label: '3X Earnings', description: 'Standard MSO', color: '#f59e0b' },
    { multiple: 4, label: '4X Earnings', description: 'Healthcare Avg', color: '#eab308' },
    { multiple: 5, label: '5X Earnings', description: 'Integrated Platform', color: '#10b981' },
    { multiple: 6, label: '6X Earnings', description: 'Premium', color: '#3b82f6' },
  ];
  
  return (
    <div className="space-y-6 p-0 sm:p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Physician ROI Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          {inputs.foundingToggle ? 'Founding Physician' : 'Non-Founding Physician'} financial analysis and return on investment
        </p>
      </div>
      
      {/* 8-Card KPI System */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Financial Returns */}
        <KPICard
          title="Monthly Income"
          value={formatCurrency(kpis.monthlyIncome)}
          subtitle="Specialty + Equity + Diagnostics"
          icon={DollarSign}
          formula={formulas.physicianMonthlyIncome}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="Annualized ROI"
          value={formatPercent(kpis.annualizedROI)}
          subtitle={`Annual / ${formatCurrency(investment)} Investment`}
          icon={Percent}
          formula={formulas.physicianROI}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="MSO Equity Income"
          value={formatCurrency(kpis.msoEquityIncome)}
          subtitle={`${equityStake}% of Net Profit`}
          icon={TrendingUp}
          formula={formulas.msoEquityIncome}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="Equity Stake Value"
          value={formatCurrency(dynamicEquityValue)}
          subtitle={`At ${selectedMultiple}× earnings multiple`}
          icon={Gem}
          formula={formulas.equityValue}
          valueClassName="text-green-600"
        />
        
        {/* Row 2: Structure & Lifestyle */}
        <KPICard
          title="Independent Revenue Streams"
          value={kpis.independentRevenueStreams.toString()}
          subtitle="Active income sources"
          icon={Layers}
          valueClassName="text-blue-600"
          formula="Count of: Primary, Specialty, Corporate, Echo, CT, Labs (where revenue > $0)"
        />
        
        <KPICard
          title="Specialty Patient Load"
          value={Math.round(kpis.specialtyPatientLoad).toLocaleString()}
          subtitle="≈ ⅕ vs hospital volume"
          icon={Users}
          valueClassName="text-blue-600"
          formula="Active specialty members (hospital baseline: 730 patients/month)"
        />
        
        <KPICard
          title="Quality-of-Life Index"
          value={`+${formatPercent(kpis.qualityOfLifeIndex)}`}
          subtitle="Time recovered from admin"
          icon={Heart}
          valueClassName="text-purple-600"
          formula="QoL = ((Hospital Admin 30% - MSO Admin 10%) / 30%) × 100"
        />
        
        <KPICard
          title="Support-to-Physician Ratio"
          value={formatRatio(kpis.supportToPhysicianRatio)}
          subtitle="Shared staff support"
          icon={UserCheck}
          valueClassName="text-purple-600"
          formula="Support Ratio = (NPs + Admin + Marketing + Diagnostics) / Total Physicians"
        />
      </div>
      
      {/* Physician ROI Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Physician ROI Analysis</CardTitle>
          <CardDescription>Income breakdown (Month 12)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">Physician Type</td>
                  <td className="py-3 px-4 text-right">
                    {inputs.foundingToggle ? 'Founding (1 of ' + (1 + inputs.additionalPhysicians) + ')' : 'Non-Founding'}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">Investment</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(investment)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">Equity Stake</td>
                  <td className="py-3 px-4 text-right">{equityStake}%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">MSO Service Fee</td>
                  <td className="py-3 px-4 text-right">{serviceFee}%</td>
                </tr>
                <tr className="border-b bg-blue-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Specialty Revenue Retained</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600">
                    {formatCurrency(incomeBreakdown.find(s => s.name === 'Specialty Care')?.value || 0)}
                  </td>
                </tr>
                <tr className="border-b bg-green-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Equity Income from MSO</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    {formatCurrency(kpis.msoEquityIncome)}
                  </td>
                </tr>
                <tr className="border-b bg-teal-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">Monthly Income (Month 12)</td>
                  <td className="py-3 px-4 text-right font-bold text-teal-600 text-lg">
                    {formatCurrency(kpis.monthlyIncome)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-900">Annualized Income</td>
                  <td className="py-3 px-4 text-right font-bold text-lg">
                    {formatCurrency(kpis.monthlyIncome * 12)}
                  </td>
                </tr>
                <tr className="bg-blue-100">
                  <td className="py-3 px-4 font-bold text-gray-900">Annualized ROI</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700 text-xl">
                    {formatPercent(kpis.annualizedROI)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Income Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Income Breakdown"
          description="Sources of physician income (Month 12)"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        
        {/* Revenue Diversity */}
        <ChartCard
          title="Revenue Stream Diversity"
          description="Physician profit from each MSO revenue source"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueDiversity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="msoRevenue" fill="#3b82f6" name="MSO Revenue" />
              <Bar dataKey="physicianProfit" fill="#10b981" name="Physician Profit" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      {/* Equity Valuation Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Stake Valuation Scenarios</CardTitle>
          <CardDescription>
            Projected value of {equityStake}% equity stake at different earnings multiples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">Select Earnings Multiple:</div>
            <div className="flex gap-2 flex-wrap">
              {valuationScenarios.map((scenario) => (
                <button
                  key={scenario.multiple}
                  onClick={() => setSelectedMultiple(scenario.multiple)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedMultiple === scenario.multiple
                      ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{scenario.label}</div>
                  <div className="text-xs">{scenario.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">MSO Annual Profit</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(annualProfit)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">MSO Valuation ({selectedMultiple}×)</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(msoValuation)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(annualProfit)} × {selectedMultiple}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Your Equity Stake Value</div>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(dynamicEquityValue)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {equityStake}% of MSO Valuation
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-4">Multiple</th>
                  <th className="text-left py-2 px-4">Description</th>
                  <th className="text-right py-2 px-4">MSO Valuation</th>
                  <th className="text-right py-2 px-4">Your Equity Value ({equityStake}%)</th>
                </tr>
              </thead>
              <tbody>
                {valuationScenarios.map((scenario) => {
                  const scenarioMsoValuation = annualProfit * scenario.multiple;
                  const scenarioEquityValue = scenarioMsoValuation * (equityStake / 100);
                  
                  return (
                    <tr 
                      key={scenario.multiple} 
                      className={`border-b cursor-pointer hover:bg-gray-50 ${
                        selectedMultiple === scenario.multiple ? 'bg-teal-50 font-bold' : ''
                      }`}
                      onClick={() => setSelectedMultiple(scenario.multiple)}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: scenario.color }}>
                        {scenario.label}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{scenario.description}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(scenarioMsoValuation)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold" style={{ color: scenario.color }}>
                        {formatCurrency(scenarioEquityValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Click any row or button to update the valuation. Actual valuation depends on market conditions, growth trajectory, and strategic positioning.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

