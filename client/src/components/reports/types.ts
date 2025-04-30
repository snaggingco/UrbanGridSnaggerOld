// Report Template Types

export type ReportElementType = 
  | 'header'
  | 'title'
  | 'text'
  | 'divider'
  | 'image'
  | 'defect-list'
  | 'table'
  | 'chart'
  | 'signature'
  | 'logo'
  | 'client-info'
  | 'project-info'
  | 'inspection-summary'
  | 'page-break'
  | 'location-section'
  | 'image-gallery';

export interface ReportElement {
  id: string;
  type: ReportElementType;
  title?: string;
  content?: string;
  imageUrl?: string;
  options?: Record<string, any>;
  // For sorting and layout
  sortOrder?: number;
  columnSpan?: number; // 1-12 grid system
  visible?: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  elements: ReportElement[];
  collapsed?: boolean;
  visible?: boolean;
  sortOrder: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  sections: ReportSection[];
  settings: ReportSettings;
}

export interface ReportSettings {
  branding: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
    companyInfo?: string;
    showPageNumbers?: boolean;
    showDateOnEveryPage?: boolean;
  };
  layout: {
    pageSize?: 'A4' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    headerHeight?: number;
    footerHeight?: number;
  };
  content: {
    fontFamily?: string;
    fontSize?: number;
    defectsPerPage?: number;
    imagesPerDefect?: number;
    includeRemedialActions?: boolean;
    includeCostEstimates?: boolean;
    includeLocationMap?: boolean;
    groupByLocation?: boolean;
    showSeverityIndicators?: boolean;
  };
}

// Drag and drop action types
export type DragEndEvent = {
  active: {
    id: string;
    data?: {
      current?: {
        type: ReportElementType;
        [key: string]: any;
      }
    }
  };
  over: {
    id: string;
  } | null;
};

export type DropPosition = 'before' | 'after' | 'inside';

// Function Types
export type UpdateSectionHandler = (sectionId: string, updates: Partial<ReportSection>) => void;
export type UpdateElementHandler = (sectionId: string, elementId: string, updates: Partial<ReportElement>) => void;
export type DeleteElementHandler = (sectionId: string, elementId: string) => void;
export type AddElementHandler = (sectionId: string, element: ReportElement) => void;
export type ReorderElementHandler = (sectionId: string, elementIds: string[]) => void;
export type MoveElementHandler = (fromSectionId: string, toSectionId: string, elementId: string) => void;