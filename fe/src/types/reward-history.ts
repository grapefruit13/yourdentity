export type HistoryType = "earn" | "use" | "expire";

export interface HistoryEntry {
  id: string;
  title: string;
  amount: number;
  type: HistoryType;
  label: string;
  description?: string;
}

export interface HistorySection {
  date: string;
  items: HistoryEntry[];
}
