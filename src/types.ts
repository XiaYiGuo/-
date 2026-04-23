export interface RawBusinessItem {
  department: string;
  itemName: string;
  description?: string;
  // Other raw fields can exist
  [key: string]: any;
}

export interface ProcessedBusinessItem {
  id: string;
  index: number;
  department: string;
  itemName: string;
  description: string;
}

export interface ProblemDetail {
  id: string;
  index: number;
  department: string;
  itemName: string;
  problem: string;
  suggestion: string;
}

export interface ReportData {
  departmentName: string;
  totalItems: number;
  missingDescCount: number;
  duplicateCount: number;
  items: ProcessedBusinessItem[];
  problems: ProblemDetail[];
  date: string;
}

// ========================
// Data Catalog Types
// ========================
export interface DataCatalogItem {
  id: string;
  department: string;
  systemName: string;
  catalogName: string;
  createTime: string;
  isLinkedToSource: boolean;
  sourceSql?: string;
}

export interface DataCatalogReportData {
  departmentName: string;
  totalItems: number;
  missingCatalogCount?: number;
  invalidNameCount: number;
  invalidRuleCount: number;
  missingFieldCount?: number;
  typeErrorCount: number;
  date: string;
  items: {
    id: string;
    index: number;
    systemName: string;
    catalogName: string;
  }[];
  catalogProblems: {
    id: string;
    index: number;
    systemName: string;
    catalogName: string;
    problem: string;
    suggestion: string;
  }[];
  dataItemProblems: {
    id: string;
    index: number;
    catalogName: string;
    dataItem: string;
    problem: string;
    suggestion: string;
  }[];
}
