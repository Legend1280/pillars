import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CapitalWaterfallProps {
  capitalRaised: number;
  buildoutCost: number;
  equipmentCost: number;
  startupCosts: number;
  workingCapital: number;
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
  remainingReserve,
  deploymentBreakdown
}: CapitalWaterfallProps) {
  // Prepare waterfall chart data
  const waterfallData = [
    { 
      name: 'Capital Raised', 
      value: capitalRaised, 
      displayValue: capitalRaised,
      type: 'start',
      color: '#10b981' 
    },
    { 
      name: 'Buildout', 
      value: buildoutCost,
      displayValue: capitalRaised - buildoutCost,
      type: 'decrease',
      color: '#ef4444' 
    },
    { 
      name: 'Equipment', 
      value: equipmentCost,
      displayValue: capitalRaised - buildoutCost - equipmentCost,
      type: 'decrease',
      color: '#ef4444' 
    },
    { 
      name: 'Startup', 
      value: startupCosts,
      displayValue: capitalRaised - buildoutCost - equipmentCost - startupCosts,
      type: 'decrease',
      color: '#ef4444' 
    },
    { 
      name: 'Working Capital', 
      value: workingCapital,
      displayValue: remainingReserve,
      type: 'decrease',
      color: '#ef4444' 
    },
    { 
      name: 'Reserve', 
      value: remainingReserve,
      displayValue: remainingReserve,
      type: 'end',
      color: '#3b82f6' 
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Capital Deployment</h3>
      <p className="text-sm text-gray-600 mb-6">Where your {formatCurrency(capitalRaised)} investment goes</p>
      
      {/* Waterfall Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={waterfallData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: '#000' }}
              isAnimationActive={false}
              position={{ y: 0 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {waterfallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
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

