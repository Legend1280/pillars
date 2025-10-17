import { Button } from "@/components/ui/button";
import { ExportImportDialog } from "@/components/ExportImportDialog";
import { useDashboard } from "@/contexts/DashboardContext";
import { exportPrimitivesToExcel } from "@/lib/excelExport";
import { headerTabs } from "@/lib/data";
import { Download, FileSpreadsheet, FileJson } from "lucide-react";
import { useState } from "react";

export function DashboardHeader() {
  const { activeTab, setActiveTab, inputs, updateInputs } = useDashboard();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <>
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {headerTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-500 text-white shadow-md hover:bg-teal-600'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {activeTab === tab.id && <span className="mr-1.5">✓</span>}
                  {tab.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setExportDialogOpen(true)}
              >
                <FileJson className="h-4 w-4" />
                Manage Scenarios
              </Button>
              <button
                onClick={() => exportPrimitivesToExcel(inputs)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                Export to Excel
              </button>
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Download className="h-4 w-4" />
                Export to PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ExportImportDialog 
        open={exportDialogOpen} 
        onOpenChange={setExportDialogOpen} 
      />
    </>
  );
}

