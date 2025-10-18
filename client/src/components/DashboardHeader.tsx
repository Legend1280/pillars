import { Button } from "@/components/ui/button";
import { ExportImportDialog } from "@/components/ExportImportDialog";
import { useDashboard } from "@/contexts/DashboardContext";
import { exportConfigToExcel } from "@/lib/configDrivenExcelExport";
import { headerTabs } from "@/lib/data";
import { Download, FileSpreadsheet, FileJson } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function DashboardHeader() {
  const { activeTab, setActiveTab, inputs, updateInputs } = useDashboard();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  return (
    <>
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-end flex-wrap gap-4">
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

