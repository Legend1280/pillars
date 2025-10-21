interface UnitEconomicsCardProps {
  revenuePerMember: number;
  ltv: number;
  cac: number;
  paybackMonths: number;
  ltvCacRatio: number;
  grossMargin: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function UnitEconomicsCard({
  revenuePerMember,
  ltv,
  cac,
  paybackMonths,
  ltvCacRatio,
  grossMargin
}: UnitEconomicsCardProps) {
  const isHealthy = ltvCacRatio >= 3;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Unit Economics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-600 mb-1">Lifetime Value (LTV)</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(ltv)}
          </p>
        </div>
        
        <div className="p-3 bg-orange-50 rounded">
          <p className="text-xs text-gray-600 mb-1">Customer Acq. Cost (CAC)</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(cac)}
          </p>
        </div>
        
        <div className="p-3 bg-green-50 rounded">
          <p className="text-xs text-gray-600 mb-1">LTV:CAC Ratio</p>
          <p className={`text-2xl font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
            {ltvCacRatio.toFixed(1)}:1
          </p>
        </div>
        
        <div className="p-3 bg-purple-50 rounded">
          <p className="text-xs text-gray-600 mb-1">Payback Period</p>
          <p className="text-2xl font-bold text-purple-600">
            {paybackMonths.toFixed(1)} mo
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-gray-50 rounded mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Gross Margin</span>
          <span className="text-xl font-bold text-green-600">
            {grossMargin.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Health indicator */}
      <div className={`p-3 rounded ${isHealthy ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <p className={`text-sm font-medium ${isHealthy ? 'text-green-800' : 'text-yellow-800'}`}>
          {isHealthy 
            ? '✅ Healthy unit economics (LTV:CAC ≥ 3:1)' 
            : '⚠️ Improve CAC efficiency (target LTV:CAC ≥ 3:1)'}
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p><strong>Revenue/Member:</strong> {formatCurrency(revenuePerMember)}/mo</p>
        <p className="mt-1"><strong>Formula:</strong> LTV = Monthly Revenue × Avg. Lifetime (months)</p>
        <p className="mt-1 italic text-gray-400">*LTV assumes conservative 35% annual churn for prudent projections</p>
        <p className="mt-1"><strong>CAC:</strong> Total Marketing Spend ÷ New Members Acquired</p>
      </div>
    </div>
  );
}

