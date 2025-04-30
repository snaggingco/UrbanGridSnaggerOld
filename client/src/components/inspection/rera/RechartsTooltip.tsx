import React from "react";
import { Tooltip as RechartsTooltipComponent, TooltipProps } from "recharts";

export const RechartsTooltip: React.FC<TooltipProps<number, string>> = (props) => {
  return <RechartsTooltipComponent {...props} />;
};