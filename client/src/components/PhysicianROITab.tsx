import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Percent, Building2 } from "lucide-react";
import { useMemo, useState } from "react";

export function PhysicianROITab() {
  const { inputs, projections } = useDashboard();
  const [selectedMultiple, setSelectedMultiple] = useState(2);
  
  // Get Month 12 data from real projections
  const month12 = projections.projection[11]; // Month 18 (index 11 of 12-month projection)
  
  // Calculate physician metrics
  const metrics = useMemo(() => {
    const serviceFee = inputs.foundingToggle ? 37 : 40;
    const equityStake = inputs.foundingToggle ? 10 : 5;
    const investment = inputs.foundingToggle ? 600000 : 750000;
    
    // Physician income breakdown
    const specialtyRetained = month12.revenue.specialty * (1 - serviceFee / 100);
    const equityIncome = month12.profit * (equityStake / 100);
    const monthlyIncome = specialtyRetained + equityIncome;
    const annualizedIncome = monthlyIncome * 12;
    const roi = (annualizedIncome / investment) * 100;
    
    // MSO Valuation
    const msoAnnualProfit = month12.profit * 12;
    const msoValuation = msoAnnualProfit * selectedMultiple;
    const equityStakeValue = msoValuation * (equityStake / 100);
    
    return {
      serviceFee,
      equityStake,
      investment,
      specialtyRetained,
      equityIncome,
      monthlyIncome,
      annualizedIncome,
      roi,
      msoAnnualProfit,
      msoValuation,
      equityStakeValue,
    };
  }, [inputs.foundingToggle, month12, selectedMultiple]);
  
  // Income breakdown for donut chart
  const incomeBreakdown = [
    { name: 'Specialty Retained', value: metrics.specialtyRetained, color: '#3b82f6' },
    { name: 'MSO Equity Income', value: metrics.equityIncome, color: '#10b981' },
  ];
  
  // Revenue diversity - physician's profit share from each MSO revenue stream
  const revenueDiversity = useMemo(() => {
    // Calculate physician's share of each revenue stream
    // Specialty: physician keeps (1 - serviceFee)
    // Other streams: physician gets equityStake% of profit
    
    const serviceFee = inputs.foundingToggle ? 37 : 40;
    const equityStake = inputs.foundingToggle ? 10 : 5;
    
    // Physician's direct specialty revenue
    const specialtyPhysicianShare = month12.revenue.specialty * (1 - serviceFee / 100);
    
    // For other revenue streams, physician gets equity share of the profit
    // Simplified: assume same margin across all streams for equity calculation
    const profitMargin = month12.profit / month12.revenue.total;
    
    const primaryPhysicianShare = month12.revenue.primary * profitMargin * (equityStake / 100);
    const diagnosticsPhysicianShare = (month12.revenue.echo + month12.revenue.ct + month12.revenue.labs) * profitMargin * (equityStake / 100);
    const corporatePhysicianShare = month12.revenue.corporate * profitMargin * (equityStake / 100);
    
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
  }, [inputs.foundingToggle, month12]);
  
  // Valuation multiples
  const valuationScenarios = [
    { multiple: 2, label: '2X Earnings', description: 'Conservative', color: '#ef4444' },
    { multiple: 3, label: '3X Earnings', description: 'Standard MSO', color: '#f59e0b' },
    { multiple: 4, label: '4X Earnings', description: 'Healthcare Avg', color: '#eab308' },
    { multiple: 5, label: '5X Earnings', description: 'Integrated Platform', color: '#10b981' },
    { multiple: 6, label: '6X Earnings', description: 'Premium', color: '#3b82f6' },
  ];
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Physician ROI Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          {inputs.foundingToggle ? 'Founding Physician' : 'Non-Founding Physician'} financial analysis and return on investment
        </p>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              ${metrics.monthlyIncome.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Specialty + Equity</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Annualized ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.roi.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Annual / ${(metrics.investment / 1000).toFixed(0)}K Investment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Percent className="h-4 w-4" />
              MSO Equity Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.equityIncome.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">{metrics.equityStake}% of Net Profit</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Equity Stake Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${(metrics.equityStakeValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-gray-500 mt-1">At {selectedMultiple}X earnings</p>
          </CardContent>
        </Card>
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
                  <td className="py-3 px-4 text-right">${metrics.investment.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">Equity Stake</td>
                  <td className="py-3 px-4 text-right">{metrics.equityStake}%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium text-gray-700">MSO Service Fee</td>
                  <td className="py-3 px-4 text-right">{metrics.serviceFee}%</td>
                </tr>
                <tr className="border-b bg-blue-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Specialty Revenue Retained</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600">
                    ${metrics.specialtyRetained.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b bg-green-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Equity Income from MSO</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    ${metrics.equityIncome.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b bg-teal-50">
                  <td className="py-3 px-4 font-semibold text-gray-900">Monthly Income (Month 12)</td>
                  <td className="py-3 px-4 text-right font-bold text-teal-600 text-lg">
                    ${metrics.monthlyIncome.toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-semibold text-gray-900">Annualized Income</td>
                  <td className="py-3 px-4 text-right font-bold text-lg">
                    ${metrics.annualizedIncome.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-blue-100">
                  <td className="py-3 px-4 font-bold text-gray-900">Annualized ROI</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700 text-xl">
                    {metrics.roi.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Income Breakdown Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut Chart - Income Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Physician Income Breakdown</CardTitle>
            <CardDescription>Monthly income by source (Month 12)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-teal-600">
                ${metrics.monthlyIncome.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Monthly Income</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: $${(entry.value / 1000).toFixed(0)}K`}
                >
                  {incomeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Specialty Retained ({100 - metrics.serviceFee}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">MSO Equity ({metrics.equityStake}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bar Chart - Revenue Diversity */}
        <Card>
          <CardHeader>
            <CardTitle>Income Diversity by Revenue Stream</CardTitle>
            <CardDescription>Physician's profit share from each MSO revenue source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueDiversity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis label={{ value: 'Physician Profit ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'physicianProfit') return [`$${value.toLocaleString()}`, 'Physician Profit'];
                    if (name === 'msoRevenue') return [`$${value.toLocaleString()}`, 'MSO Revenue'];
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="msoRevenue" fill="#94a3b8" name="MSO Revenue" />
                <Bar dataKey="physicianProfit" fill="#14b8a6" name="Physician Profit" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Specialty:</strong> Physician retains {100 - metrics.serviceFee}% directly</p>
              <p><strong>Other streams:</strong> Physician receives {metrics.equityStake}% equity share of MSO profit</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Equity Valuation Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Stake Valuation Scenarios</CardTitle>
          <CardDescription>
            Compare different earnings multiples to see how your {metrics.equityStake}% equity stake value changes
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
          
          <div className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">MSO Annual Profit</div>
              <div className="text-2xl font-bold text-gray-900">
                ${(metrics.msoAnnualProfit / 1000000).toFixed(2)}M
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">MSO Valuation ({selectedMultiple}X)</div>
              <div className="text-3xl font-bold text-blue-600">
                ${(metrics.msoValuation / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ${(metrics.msoAnnualProfit / 1000000).toFixed(2)}M × {selectedMultiple}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Your Equity Stake Value</div>
              <div className="text-3xl font-bold text-purple-600">
                ${(metrics.equityStakeValue / 1000).toFixed(0)}K
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.equityStake}% of MSO Valuation
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 px-4">Multiple</th>
                  <th className="text-left py-2 px-4">Description</th>
                  <th className="text-right py-2 px-4">MSO Valuation</th>
                  <th className="text-right py-2 px-4">Your Equity Value ({metrics.equityStake}%)</th>
                </tr>
              </thead>
              <tbody>
                {valuationScenarios.map((scenario) => (
                  <tr 
                    key={scenario.multiple}
                    className={`border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMultiple === scenario.multiple ? 'bg-teal-50 font-bold' : ''
                    }`}
                    onClick={() => setSelectedMultiple(scenario.multiple)}
                  >
                    <td className="py-3 px-4">{scenario.label}</td>
                    <td className="py-3 px-4 text-gray-600">{scenario.description}</td>
                    <td className="py-3 px-4 text-right">
                      ${((metrics.msoAnnualProfit * scenario.multiple) / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-right font-bold" style={{ color: scenario.color }}>
                      ${((metrics.msoAnnualProfit * scenario.multiple * metrics.equityStake / 100) / 1000).toFixed(0)}K
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

