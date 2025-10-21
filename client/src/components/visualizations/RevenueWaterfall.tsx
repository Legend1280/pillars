import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

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
  
  // Create waterfall data showing cumulative growth from M0
  const startingRevenue = monthlyRevenue[0];
  
  const data = monthlyRevenue.map((rev, i) => {
    const change = i === 0 ? 0 : rev - monthlyRevenue[i - 1];
    const cumulativeGrowth = rev - startingRevenue;
    const isPositive = change >= 0;
    
    return {
      month: `M${months[i].month}`,
      monthNumber: months[i].month,
      change: Math.abs(change),
      cumulative: rev,
      cumulativeGrowth: cumulativeGrowth,
      base: startingRevenue,
      stackedGrowth: cumulativeGrowth,
      isPositive,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue Waterfall</h3>
      <p className="text-sm text-gray-600 mb-4">Cumulative revenue growth from M0 baseline</p>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'base') return ['Starting Revenue', formatCurrency(value)];
              if (name === 'stackedGrowth') return ['Growth', formatCurrency(value)];
              return formatCurrency(value);
            }}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px'
            }}
            cursor={false}
            animationDuration={0}
          />
          {/* Base revenue (M0) */}
          <Bar dataKey="base" stackId="a" fill="#94a3b8" />
          {/* Cumulative growth stacked on top */}
          <Bar dataKey="stackedGrowth" stackId="a" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-gray-600">Starting Revenue (M0)</p>
          <p className="font-semibold text-gray-900">{formatCurrency(startingRevenue)}</p>
        </div>
        <div>
          <p className="text-gray-600">Final Revenue (M{months[months.length - 1].month})</p>
          <p className="font-semibold text-green-600">{formatCurrency(monthlyRevenue[monthlyRevenue.length - 1])}</p>
        </div>
        <div>
          <p className="text-gray-600">Total Growth</p>
          <p className="font-semibold text-green-600">
            {formatCurrency(monthlyRevenue[monthlyRevenue.length - 1] - startingRevenue)}
            <span className="text-gray-500 ml-1">
              ({((monthlyRevenue[monthlyRevenue.length - 1] / startingRevenue - 1) * 100).toFixed(0)}%)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

