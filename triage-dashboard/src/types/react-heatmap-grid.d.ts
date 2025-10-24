declare module "react-heatmap-grid" {
    import * as React from "react";
  
    export interface HeatMapGridProps {
      data: number[][];
      xLabels?: string[];
      yLabels?: string[];
      xLabelsLocation?: "bottom" | "top";
      xLabelWidth?: number;
      yLabelWidth?: number;
      cellHeight?: string | number;
      cellWidth?: string | number;
      cellStyle?: (x: number, y: number, ratio: number) => React.CSSProperties;
      cellRender?: (x: number, y: number, value: number) => React.ReactNode;
      background?: string;
    }
  
    export const HeatMapGrid: React.FC<HeatMapGridProps>;
  }
  