interface ProfitGaugeProps {
  profitMargin: number; // Percentage (e.g., 15.2 for 15.2%)
}

export function ProfitGauge({ profitMargin }: ProfitGaugeProps) {
  // Clamp profit margin to gauge range (-50% to +50%)
  const clampedMargin = Math.max(-50, Math.min(50, profitMargin));
  
  // Calculate needle angle (180° = -50%, 0° = +50%)
  // Gauge goes from left (180°) to right (0°)
  const angle = 180 - ((clampedMargin + 50) / 100) * 180;
  
  // Determine zone color
  let zoneColor = '#ef4444'; // Red (loss)
  let zoneText = 'Loss';
  
  if (profitMargin >= 15) {
    zoneColor = '#10b981'; // Green (healthy)
    zoneText = 'Healthy';
  } else if (profitMargin >= 0) {
    zoneColor = '#f59e0b'; // Yellow (low margin)
    zoneText = 'Low Margin';
  }
  
  // SVG gauge parameters
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const needleLength = 80;
  
  // Calculate needle endpoint
  const needleAngle = (angle - 90) * (Math.PI / 180); // Convert to radians, adjust for SVG coordinate system
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);
  
  // Create arc paths for colored zones
  const createArc = (startAngle: number, endAngle: number) => {
    const start = (startAngle - 90) * (Math.PI / 180);
    const end = (endAngle - 90) * (Math.PI / 180);
    const x1 = centerX + radius * Math.cos(start);
    const y1 = centerY + radius * Math.sin(start);
    const x2 = centerX + radius * Math.cos(end);
    const y2 = centerY + radius * Math.sin(end);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Profit Margin Gauge</h3>
      <p className="text-sm text-gray-600 mb-4">Month 12 profit margin</p>
      
      <div className="flex flex-col items-center">
        <svg width="300" height="200" viewBox="0 0 300 200">
          {/* Red zone (-50% to 0%) - Left side */}
          <path
            d={createArc(180, 90)}
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Yellow zone (0% to 15%) - Middle */}
          <path
            d={createArc(90, 63)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Green zone (15% to 50%) - Right side */}
          <path
            d={createArc(63, 0)}
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Tick marks */}
          <line x1={centerX - radius} y1={centerY} x2={centerX - radius + 15} y2={centerY} stroke="#6b7280" strokeWidth="2" />
          <text x={centerX - radius - 25} y={centerY + 5} fontSize="12" fill="#6b7280">-50%</text>
          
          <line x1={centerX} y1={centerY - radius} x2={centerX} y2={centerY - radius + 15} stroke="#6b7280" strokeWidth="2" />
          <text x={centerX - 10} y={centerY - radius - 10} fontSize="12" fill="#6b7280">0%</text>
          
          <line x1={centerX + radius} y1={centerY} x2={centerX + radius - 15} y2={centerY} stroke="#6b7280" strokeWidth="2" />
          <text x={centerX + radius + 5} y={centerY + 5} fontSize="12" fill="#6b7280">+50%</text>
          
          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Center dot */}
          <circle cx={centerX} cy={centerY} r="8" fill="#1f2937" />
        </svg>
        
        {/* Value display */}
        <div className="text-center mt-4">
          <div className={`text-5xl font-bold mb-2`} style={{ color: zoneColor }}>
            {profitMargin.toFixed(1)}%
          </div>
          <div className={`text-sm font-medium px-4 py-2 rounded-full inline-block`} style={{ backgroundColor: `${zoneColor}20`, color: zoneColor }}>
            {zoneText}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p><strong>Target:</strong> ≥15% for healthy margins</p>
      </div>
    </div>
  );
}

