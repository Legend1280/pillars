// This is the replacement code for the Validation tab section in MasterDebugTab.tsx
// Replace lines 335-445 (the entire CardContent section) with this:

<CardContent>
  <div className="space-y-4">
    {randomCalculations.map((node, idx) => {
      const isExpanded = expandedValidations.has(idx);
      return (
        <div key={`${node.id}-${randomSeed}`} className="border rounded-lg overflow-hidden">
          {/* Header - Always Visible */}
          <div 
            className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors bg-white"
            onClick={() => toggleValidation(idx)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-base">{node.label}</div>
                <Badge variant={
                  node.type === 'output' ? 'default' :
                  node.type === 'calculation' ? 'secondary' :
                  'outline'
                }>
                  {node.type}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {node.category} • {node.description}
              </div>
              {node.value !== undefined && !isExpanded && (
                <div className="text-sm font-mono text-gray-900 mt-2">
                  Value: {typeof node.value === 'number' 
                    ? node.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                    : String(node.value)
                  }
                  {node.metadata?.unit && (
                    <span className="text-gray-600 ml-1">
                      {node.metadata.unit === 'dollars' && '$'}
                      {node.metadata.unit === 'percentage' && '%'}
                      {node.metadata.unit === 'count' && ' people'}
                      {node.metadata.unit === 'months' && ' months'}
                    </span>
                  )}
                </div>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            )}
          </div>
          
          {/* Expanded Details */}
          {isExpanded && (
            <div className="px-3 pb-3 pt-0 space-y-3 bg-gray-50 border-t">
              {/* Current Value */}
              {node.value !== undefined && (
                <div className="p-3 bg-white rounded border">
                  <div className="text-xs font-semibold text-gray-600 mb-1">Current Value</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof node.value === 'number' 
                      ? node.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                      : String(node.value)
                    }
                    {node.metadata?.unit && (
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        {node.metadata.unit === 'dollars' && 'dollars'}
                        {node.metadata.unit === 'percentage' && '%'}
                        {node.metadata.unit === 'count' && ' people'}
                        {node.metadata.unit === 'months' && ' months'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Formula */}
              {node.formula && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Formula</div>
                  <div className="text-sm font-mono bg-white p-2 rounded border">
                    {node.formula}
                  </div>
                </div>
              )}

              {/* Code Snippet */}
              {node.codeSnippet && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Code</div>
                  <div className="text-xs font-mono bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                    {node.codeSnippet}
                  </div>
                </div>
              )}

              {/* Metadata Grid */}
              {node.metadata && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {node.metadata.unit && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Unit</div>
                      <div className="text-gray-900 capitalize">{node.metadata.unit}</div>
                    </div>
                  )}
                  
                  {node.metadata.section !== undefined && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Section</div>
                      <div className="text-gray-900">Section {node.metadata.section}</div>
                    </div>
                  )}
                  
                  {node.metadata.layer !== undefined && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500">Layer</div>
                      <div className="text-gray-900">
                        Layer {node.metadata.layer} 
                        {node.metadata.layer === 0 ? ' (Input)' : 
                         node.metadata.layer === 1 ? ' (Derived)' : 
                         node.metadata.layer === 2 ? ' (Calc)' : 
                         ' (Output)'}
                      </div>
                    </div>
                  )}
                  
                  {node.metadata.businessLogic && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Business Logic</div>
                      <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        {node.metadata.businessLogic}
                      </div>
                    </div>
                  )}
                  
                  {node.metadata.expectedRange && (
                    <div className="col-span-2">
                      <div className="text-xs font-semibold text-gray-500">Expected Range</div>
                      <div className="text-sm text-gray-900">
                        {node.metadata.expectedRange.min.toLocaleString()} - {node.metadata.expectedRange.max.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    })}

    {/* Stats Footer */}
    <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t">
      <div>
        Showing 6 of {computedNodes.length} total computed nodes from the ontology
      </div>
      <div className="text-xs text-gray-500">
        Click any calculation to see full details
      </div>
    </div>
  </div>
</CardContent>

