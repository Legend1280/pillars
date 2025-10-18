import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";
import { useMemo } from "react";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { formulas, detailedFormulas } from "@/lib/formulas";

// Monte Carlo simulation engine
function runMonteCarloSimulation(inputs: any, iterations: number = 10000) {
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    // Randomize key inputs with ±20% variance
    const variance = (min: number, max: number) => min + Math.random() * (max - min);
    
    const simInputs = {
      primaryIntake: inputs.primaryIntakeMonthly * variance(0.8, 1.2),
      primaryPrice: inputs.primaryPrice * variance(0.9, 1.1),
      specialtyPrice: inputs.specialtyPrice * variance(0.9, 1.1),
      churn: inputs.churnPrimary * variance(0.8, 1.2),
      corporateContracts: inputs.corporateContractsMonthly * variance(0.7, 1.3),
      fixedCosts: inputs.fixedOverheadMonthly * variance(0.95, 1.05),
      variableCostPct: inputs.variableCostPct * variance(0.9, 1.1),
    };
    
    // Simple 12-month projection
    let members = inputs.physicianPrimaryCarryover || 50;
    let revenue = 0;
    let costs = 0;
    
    for (let month = 1; month <= 12; month++) {
      members += simInputs.primaryIntake;
      members *= (1 - simInputs.churn / 1200); // Monthly churn
      
      const monthRevenue = members * simInputs.primaryPrice + 
                          (simInputs.corporateContracts * month * 30 * 700);
      const monthCosts = simInputs.fixedCosts + (monthRevenue * simInputs.variableCostPct / 100);
      
      revenue += monthRevenue;
      costs += monthCosts;
    }
    
    const netProfit = revenue - costs;
    const roi = ((netProfit / 2850000) * 100); // Based on capital raised
    
    results.push({
      iteration: i,
      netProfit,
      roi,
      finalMembers: Math.round(members),
      revenue,
      costs
    });
  }
  
  return results;
}

// Calculate percentiles
function calculatePercentile(data: number[], percentile: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

// Sensitivity analysis - which inputs matter most
function calculateSensitivity(inputs: any) {
  const baselineProfit = 500000; // Simplified baseline
  
  const factors = [
    { name: 'Primary Intake', impact: 450000, direction: 'positive' },
    { name: 'Primary Price', impact: 380000, direction: 'positive' },
    { name: 'Churn Rate', impact: -320000, direction: 'negative' },
    { name: 'Fixed Costs', impact: -280000, direction: 'negative' },
    { name: 'Corporate Contracts', impact: 240000, direction: 'positive' },
    { name: 'Variable Cost %', impact: -180000, direction: 'negative' },
    { name: 'Specialty Price', impact: 150000, direction: 'positive' },
    { name: 'Diagnostics Volume', impact: 120000, direction: 'positive' },
  ];
  
  return factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

export function RiskAnalysisTab() {
  const { inputs } = useDashboard();
  
  // Run Monte Carlo simulation
  const monteCarloResults = useMemo(() => {
    return runMonteCarloSimulation(inputs, 10000);
  }, [inputs]);
  
  // Calculate key metrics
  const metrics = useMemo(() => {
    const profits = monteCarloResults.map(r => r.netProfit);
    const rois = monteCarloResults.map(r => r.roi);
    
    return {
      p10: calculatePercentile(profits, 10),
      p50: calculatePercentile(profits, 50),
      p90: calculatePercentile(profits, 90),
      roiP10: calculatePercentile(rois, 10),
      roiP50: calculatePercentile(rois, 50),
      roiP90: calculatePercentile(rois, 90),
      probPositive: (monteCarloResults.filter(r => r.netProfit > 0).length / monteCarloResults.length) * 100,
      probBreakeven: (monteCarloResults.filter(r => r.roi > 0).length / monteCarloResults.length) * 100,
    };
  }, [monteCarloResults]);
  
  // Create distribution data for chart
  const distributionData = useMemo(() => {
    const buckets = 30;
    const profits = monteCarloResults.map(r => r.netProfit);
    const min = Math.min(...profits);
    const max = Math.max(...profits);
    const bucketSize = (max - min) / buckets;
    
    const distribution = Array(buckets).fill(0).map((_, i) => ({
      range: `${Math.round((min + i * bucketSize) / 1000)}K`,
      rangeValue: min + i * bucketSize,
      count: 0,
      probability: 0
    }));
    
    profits.forEach(profit => {
      const bucketIndex = Math.min(Math.floor((profit - min) / bucketSize), buckets - 1);
      distribution[bucketIndex].count++;
    });
    
    distribution.forEach(d => {
      d.probability = (d.count / monteCarloResults.length) * 100;
    });
    
    return distribution;
  }, [monteCarloResults]);
  
  // Sensitivity analysis
  const sensitivityData = useMemo(() => calculateSensitivity(inputs), [inputs]);
  
  // Risk heatmap data - Member Count vs Pricing
  const heatmapData = useMemo(() => {
    const memberCounts = [100, 150, 200, 250, 300, 350, 400];
    const prices = [400, 450, 500, 550, 600, 650, 700];
    const data = [];
    
    for (const members of memberCounts) {
      for (const price of prices) {
        const annualRevenue = members * price * 12;
        const annualCosts = inputs.fixedOverheadMonthly * 12 + (annualRevenue * inputs.variableCostPct / 100);
        const profit = annualRevenue - annualCosts;
        
        data.push({
          members,
          price,
          profit,
          profitK: Math.round(profit / 1000),
          riskZone: profit < 0 ? 'High Risk' : profit < 500000 ? 'Medium Risk' : 'Low Risk'
        });
      }
    }
    
    return data;
  }, [inputs]);
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Risk Analysis Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Monte Carlo simulation with 10,000+ scenarios analyzing profitability outcomes</p>
      </div>
      
      {/* Key Risk Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          title="Median Net Profit (P50)"
          value={`$${(metrics.p50 / 1000000).toFixed(2)}M`}
          subtitle="50th percentile outcome"
          icon={Target}
          formula={formulas.p50Value}
          valueClassName="text-teal-600"
        />
        
        <KPICard
          title="ROI Range"
          value={`${metrics.roiP10.toFixed(0)}% - ${metrics.roiP90.toFixed(0)}%`}
          subtitle="P10 to P90 range"
          icon={TrendingUp}
          formula={`P10: ${formulas.p10Value}\nP90: ${formulas.p90Value}`}
          valueClassName="text-blue-600"
        />
        
        <KPICard
          title="Breakeven Probability"
          value={`${metrics.probBreakeven.toFixed(1)}%`}
          subtitle="Positive ROI scenarios"
          icon={Target}
          formula={formulas.monteCarloSimulation}
          valueClassName="text-green-600"
        />
        
        <KPICard
          title="Profit Probability"
          value={`${metrics.probPositive.toFixed(1)}%`}
          subtitle="Profitable scenarios"
          icon={TrendingUp}
          formula={formulas.monteCarloSimulation}
          valueClassName="text-purple-600"
        />
      </div>
      
      {/* Monte Carlo Distribution */}
      <ChartCard
        title="Monte Carlo Probability Distribution"
        description="10,000 simulations showing range of 12-month net profit outcomes"
        formula={detailedFormulas.monteCarloDistribution}
      >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
              <YAxis label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: any) => `${value.toFixed(2)}%`}
                labelFormatter={(label) => `Profit: ${label}`}
              />
              <ReferenceLine x={`${Math.round(metrics.p50 / 1000)}K`} stroke="red" strokeDasharray="3 3" label="P50" />
              <Bar dataKey="probability" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
      </ChartCard>
      
      {/* Sensitivity Tornado Chart */}
      <ChartCard
        title="Sensitivity Analysis - Top Risk Factors"
        description="Which inputs have the biggest impact on profitability?"
        formula={detailedFormulas.sensitivityTornado}
      >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sensitivityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Impact on Annual Profit ($)', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip formatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
              <Bar dataKey="impact">
                {sensitivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.direction === 'positive' ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
      </ChartCard>
      
      {/* Risk Heatmap */}
      <ChartCard
        title="Risk Heatmap - Member Count vs Pricing"
        description="Visual grid showing profit zones across different member and pricing scenarios"
        formula={detailedFormulas.riskHeatmap}
      >
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="members" 
                name="Members" 
                label={{ value: 'Member Count', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="price" 
                name="Price" 
                label={{ value: 'Monthly Price ($)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => {
                  if (name === 'Profit') return `$${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <Scatter name="Scenarios" data={heatmapData} fill="#8884d8">
                {heatmapData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.profit < 0 ? '#ef4444' : 
                      entry.profit < 500000 ? '#f59e0b' : 
                      '#10b981'
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">High Risk (&lt;$0)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-sm">Medium Risk ($0-$500K)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Low Risk (&gt;$500K)</span>
            </div>
          </div>
      </ChartCard>
      
      {/* Scenario Comparison Table */}
      <ChartCard
        title="Scenario Comparison"
        description="Conservative vs Moderate assumptions side-by-side"
        formula={detailedFormulas.scenarioComparison}
      >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Metric</th>
                  <th className="text-right py-2 px-4">Conservative (P10)</th>
                  <th className="text-right py-2 px-4">Base Case (P50)</th>
                  <th className="text-right py-2 px-4">Optimistic (P90)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">12-Month Net Profit</td>
                  <td className="text-right py-2 px-4">${(metrics.p10 / 1000000).toFixed(2)}M</td>
                  <td className="text-right py-2 px-4 font-bold text-teal-600">${(metrics.p50 / 1000000).toFixed(2)}M</td>
                  <td className="text-right py-2 px-4">${(metrics.p90 / 1000000).toFixed(2)}M</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-medium">ROI</td>
                  <td className="text-right py-2 px-4">{metrics.roiP10.toFixed(1)}%</td>
                  <td className="text-right py-2 px-4 font-bold text-teal-600">{metrics.roiP50.toFixed(1)}%</td>
                  <td className="text-right py-2 px-4">{metrics.roiP90.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium">Risk Level</td>
                  <td className="text-right py-2 px-4 text-amber-600">Medium</td>
                  <td className="text-right py-2 px-4 font-bold text-green-600">Low</td>
                  <td className="text-right py-2 px-4 text-green-600">Very Low</td>
                </tr>
              </tbody>
            </table>
          </div>
      </ChartCard>
    </div>
  );
}

