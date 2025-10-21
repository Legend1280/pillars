import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CostBreakdownPieProps {
  costs: {
    salaries: number;
    marketing: number;
    overhead: number;
    variable: number;
    equipment: number;
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const COLORS = {
  Salaries: '#3b82f6',
  Marketing: '#10b981',
  Overhead: '#f59e0b',
  Variable: '#8b5cf6',
  Equipment: '#ec4899'
};

export function CostBreakdownPie({ costs }: CostBreakdownPieProps) {
  const data = [
    { name: 'Salaries', value: costs.salaries, color: COLORS.Salaries },
    { name: 'Marketing', value: costs.marketing, color: COLORS.Marketing },
    { name: 'Overhead', value: costs.overhead, color: COLORS.Overhead },
    { name: 'Variable', value: costs.variable, color: COLORS.Variable },
    { name: 'Equipment', value: costs.equipment, color: COLORS.Equipment }
  ].filter(item => item.value > 0); // Only show non-zero categories

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
      <p className="text-sm text-gray-600 mb-4">Operating costs by category (Month 12)</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => {
              const percent = ((entry.payload.value / total) * 100).toFixed(1);
              return `${value} (${percent}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p><strong>Total Monthly Costs:</strong> {formatCurrency(total)}</p>
      </div>
    </div>
  );
}

