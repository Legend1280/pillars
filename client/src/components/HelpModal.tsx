import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { ReactNode } from "react";

interface HelpModalProps {
  title: string;
  children: ReactNode;
  videoUrl?: string;
}

export function HelpModal({ title, children, videoUrl }: HelpModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Learn more about this section and how to use it effectively.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {videoUrl && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Video walkthrough coming soon</p>
            </div>
          )}
          <div className="prose prose-sm max-w-none">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

