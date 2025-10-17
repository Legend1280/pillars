import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  description: string;
}

export function PlaceholderSection({ title, description }: PlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-muted-foreground">
            <Construction className="h-6 w-6" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {description}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            This section is currently under development. The framework and data structure are in place,
            and detailed inputs, calculations, and visualizations will be added in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

