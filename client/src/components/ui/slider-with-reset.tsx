import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderWithResetProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function SliderWithReset({
  value,
  onValueChange,
  defaultValue,
  min,
  max,
  step,
  className,
}: SliderWithResetProps) {
  const handleDoubleClick = () => {
    onValueChange([defaultValue]);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn("cursor-pointer", className)}
      title="Double-click to reset to default"
    >
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

