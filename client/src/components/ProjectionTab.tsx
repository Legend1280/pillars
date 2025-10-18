import { useDashboard } from "@/contexts/DashboardContext";

export function ProjectionTab() {
  try {
    const { projections } = useDashboard();
    
    console.log('ProjectionTab rendering', {
      hasProjections: !!projections,
      hasProjection: !!projections?.projection,
      projectionLength: projections?.projection?.length,
      hasKpis: !!projections?.kpis
    });
    
    if (!projections || !projections.projection) {
      return (
        <div className="p-8">
          <p className="text-red-500">Error: Projections data not available</p>
        </div>
      );
    }
    
    return (
      <div className="p-8 space-y-6">
        <h2 className="text-2xl font-bold">12-Month Projection (Months 7-18)</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">${Math.round(projections.kpis.totalRevenue12Mo).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Total Profit</p>
            <p className="text-2xl font-bold">${Math.round(projections.kpis.totalProfit12Mo).toLocaleString()}</p>
          </div>
        </div>
        
        <p className="text-gray-600">Projection has {projections.projection.length} months of data</p>
      </div>
    );
  } catch (error) {
    console.error('ProjectionTab error:', error);
    return (
      <div className="p-8">
        <p className="text-red-500">Error rendering projection tab: {String(error)}</p>
      </div>
    );
  }
}

