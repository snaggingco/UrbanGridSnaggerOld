import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface SummaryTooltipProps {
  label: string;
  description: string;
  calculation?: string;
  importance?: string;
  children: React.ReactNode;
}

export default function SummaryTooltip({
  label,
  description,
  calculation,
  importance,
  children
}: SummaryTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center cursor-help">
            {children}
            <InfoIcon className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-xs p-4 space-y-2">
          <div>
            <h4 className="font-semibold text-sm">{label}</h4>
            <p className="text-xs">{description}</p>
          </div>
          {calculation && (
            <div>
              <h5 className="font-medium text-xs text-muted-foreground">Calculation</h5>
              <p className="text-xs">{calculation}</p>
            </div>
          )}
          {importance && (
            <div>
              <h5 className="font-medium text-xs text-muted-foreground">Why It Matters</h5>
              <p className="text-xs">{importance}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}