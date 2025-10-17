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
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2"
                >
                  {activeTab === tab.id && "✓"}
                  {tab.title}
                </Button>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => exportPrimitivesToExcel(inputs)}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export to Excel
              </Button>
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

