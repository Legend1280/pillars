import { Button } from "@/components/ui/button";
import { ExportImportDialog } from "@/components/ExportImportDialog";
import { useDashboard } from "@/contexts/DashboardContext";
import { exportConfigToExcel } from "@/lib/configDrivenExcelExport";
import { headerTabs } from "@/lib/data";
import { Download, FileSpreadsheet, FileJson, Upload, Settings } from "lucide-react";
import { downloadConfig, uploadConfig } from "@/lib/configManager";
import { dashboardConfig } from "@/lib/dashboardConfig";
import { toast } from "sonner";
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
                onClick={() => {
                  exportConfigToExcel(inputs);
                  toast.success('Excel file exported');
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-all flex items-center gap-2"
              >
                Export to Excel
              </button>
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <Download className="h-4 w-4" />
                Export to PDF
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadConfig(dashboardConfig);
                  toast.success('Configuration downloaded');
                }}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Download Config
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const config = await uploadConfig();
                    toast.success('Configuration uploaded successfully');
                    toast.info('Refresh the page to apply changes');
                  } catch (error: any) {
                    toast.error(`Failed to upload config: ${error.message}`);
                  }
                }}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Config
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

