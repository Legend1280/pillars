import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RevenueWaterfallProps {
  months: Array<{
    month: number;
    revenue: { total: number };
  }>;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
}

export function RevenueWaterfall({ months }: RevenueWaterfallProps) {
  const monthlyRevenue = months.map(m => m.revenue.total);
  
  const data = monthlyRevenue.map((rev, i) => {
    const change = i === 0 ? rev : rev - monthlyRevenue[i - 1];
    const isPositive = change >= 0;
    
    return {
      month: `M${i}`,
      change: Math.abs(change),
      cumulative: rev,
      isPositive,
      // For stacking effect
      base: i === 0 ? 0 : Math.min(rev, monthlyRevenue[i - 1]),
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Waterfall</h3>
      <p className="text-sm text-gray-600 mb-4">Month-over-month revenue growth</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'change') return formatCurrency(value);
              return formatCurrency(value);
            }}
            labelFormatter={(label) => `Month ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px'
            }}
            cursor={false}
            animationDuration={0}
          />
          <Bar dataKey="change" stackId="a">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isPositive ? '#10b981' : '#ef4444'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Total Revenue (M17):</strong> {formatCurrency(monthlyRevenue[monthlyRevenue.length - 1])}</p>
      </div>
    </div>
  );
}

