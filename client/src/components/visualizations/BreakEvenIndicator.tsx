import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface BreakEvenIndicatorProps {
  breakevenMonth: number | null;
  monthsToBreakeven: number | null;
  currentCash: number;
  cashTrend: number[];
  isBreakeven: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function BreakEvenIndicator({
  breakevenMonth,
  monthsToBreakeven,
  currentCash,
  cashTrend,
  isBreakeven
}: BreakEvenIndicatorProps) {
  // Prepare sparkline data
  const sparklineData = cashTrend.map((cash, index) => ({
    month: index,
    cash
  }));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Break-Even Analysis</h3>
      
      {isBreakeven ? (
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-green-600 mb-2">
            Month {breakevenMonth}
          </div>
          <p className="text-gray-600 font-medium">✅ Operating break-even</p>
          <p className="text-xs text-gray-500 mt-1">First month with positive profit</p>
        </div>
      ) : (
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-orange-600 mb-2">
            {monthsToBreakeven !== null ? `${monthsToBreakeven} mo` : 'N/A'}
          </div>
          <p className="text-gray-600 font-medium">⏳ To operating break-even</p>
          <p className="text-xs text-gray-500 mt-1">When monthly profit becomes positive</p>
        </div>
      )}
      
      {/* Sparkline showing cash trend */}
      <div className="mt-4 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Line 
              type="monotone" 
              dataKey="cash" 
              stroke={isBreakeven ? '#10b981' : '#f59e0b'} 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Current Cash Position:</span>
          <span className={`font-bold ${currentCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(currentCash)}
          </span>
        </div>
      </div>
      
      {!isBreakeven && monthsToBreakeven && (
        <div className="mt-3 p-3 bg-orange-50 rounded text-sm text-orange-800">
          <p>📊 Projected to reach positive cash flow in <strong>{monthsToBreakeven} months</strong></p>
        </div>
      )}
    </div>
  );
}

