import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface CapitalWaterfallProps {
  capitalRaised: number;
  buildoutCost: number;
  equipmentCost: number;
  startupCosts: number;
  workingCapital: number;
  equityBuyout: number;
  remainingReserve: number;
  deploymentBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CapitalWaterfall({
  capitalRaised,
  buildoutCost,
  equipmentCost,
  startupCosts,
  workingCapital,
  equityBuyout,
  remainingReserve,
  deploymentBreakdown
}: CapitalWaterfallProps) {
  // Create a single data point with all categories as separate keys
  const data = [
    {
      name: 'Capital Deployment',
      'Buildout': buildoutCost,
      'Equipment': equipmentCost,
      'Startup': startupCosts,
      'Working Capital': workingCapital,
      'Equity Buyout': equityBuyout,
      'Reserve': remainingReserve,
    }
  ];

  const COLORS = {
    'Buildout': '#ef4444',
    'Equipment': '#f97316',
    'Startup': '#f59e0b',
    'Working Capital': '#eab308',
    'Equity Buyout': '#8B5CF6',
    'Reserve': '#3b82f6',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Capital Deployment</h3>
      <p className="text-sm text-gray-600 mb-6">Where your {formatCurrency(capitalRaised)} investment goes</p>
      
      {/* Stacked Bar Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip 
              formatter={(value: any, name: string) => [formatCurrency(value), name]}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="Buildout" stackId="a" fill={COLORS['Buildout']} />
            <Bar dataKey="Equipment" stackId="a" fill={COLORS['Equipment']} />
            <Bar dataKey="Startup" stackId="a" fill={COLORS['Startup']} />
            <Bar dataKey="Working Capital" stackId="a" fill={COLORS['Working Capital']} />
            <Bar dataKey="Equity Buyout" stackId="a" fill={COLORS['Equity Buyout']} />
            <Bar dataKey="Reserve" stackId="a" fill={COLORS['Reserve']} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Breakdown Table */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Deployment Breakdown</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-600 font-medium">Category</th>
              <th className="text-right py-2 text-gray-600 font-medium">Amount</th>
              <th className="text-right py-2 text-gray-600 font-medium">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {deploymentBreakdown.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 text-gray-700">{item.category}</td>
                <td className="text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                <td className="text-right text-gray-600">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 font-semibold">
              <td className="py-2 text-gray-900">Remaining Reserve</td>
              <td className="text-right text-blue-600">{formatCurrency(remainingReserve)}</td>
              <td className="text-right text-gray-600">
                {((remainingReserve / capitalRaised) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">
          <strong>Total Capital Raised:</strong> {formatCurrency(capitalRaised)} | 
          <strong className="ml-2">Deployed:</strong> {formatCurrency(capitalRaised - remainingReserve)} | 
          <strong className="ml-2">Reserve:</strong> {formatCurrency(remainingReserve)}
        </p>
      </div>
    </div>
  );
}

