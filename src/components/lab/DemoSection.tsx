import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusItemProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatusItem({ label, value, className }: StatusItemProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

interface StatusPanelProps {
  items: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
  }>;
  className?: string;
}

export function StatusPanel({ items, className }: StatusPanelProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-xl", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</span>
          <span className={cn(
            "text-lg font-bold",
            item.highlight ? "text-primary" : "text-foreground"
          )}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface PathNodeProps {
  value: string;
  label: string;
  isStart?: boolean;
  isCurrent?: boolean;
}

export function PathNode({ value, label, isStart, isCurrent }: PathNodeProps) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 min-w-[60px] transition-all",
      isStart && "border-secondary bg-secondary/10",
      isCurrent && "border-primary bg-primary/10 shadow-md",
      !isStart && !isCurrent && "border-border bg-card"
    )}>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

interface PathVisualizationProps {
  path: Array<{ value: string; label: string }>;
  currentIndex?: number;
}

export function PathVisualization({ path, currentIndex = path.length - 1 }: PathVisualizationProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap p-4 bg-muted/30 rounded-xl">
      {path.map((node, index) => (
        <div key={index} className="flex items-center gap-2">
          <PathNode
            value={node.value}
            label={node.label}
            isStart={index === 0}
            isCurrent={index === currentIndex}
          />
          {index < path.length - 1 && (
            <span className="text-primary text-xl">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface LogEntryProps {
  time: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export function LogEntry({ time, message, type = 'info' }: LogEntryProps) {
  const typeStyles = {
    info: 'text-muted-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  };
  
  return (
    <div className="flex gap-3 py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{time}</span>
      <span className={cn("text-sm", typeStyles[type])}>{message}</span>
    </div>
  );
}

interface LogDisplayProps {
  logs: Array<{
    time: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
  }>;
  title?: string;
  maxHeight?: string;
}

export function LogDisplay({ logs, title = "Algorithm Log", maxHeight = "200px" }: LogDisplayProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-2 bg-muted/50 border-b border-border">
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>
      <div className="p-4 overflow-y-auto" style={{ maxHeight }}>
        {logs.map((log, index) => (
          <LogEntry key={index} {...log} />
        ))}
      </div>
    </div>
  );
}

interface DataTableProps {
  headers: string[];
  rows: (string | number)[][];
  highlightCells?: Array<{ row: number; col: number; type: 'primary' | 'secondary' | 'warning' }>;
}

export function DataTable({ headers, rows, highlightCells = [] }: DataTableProps) {
  const getCellStyle = (rowIndex: number, colIndex: number) => {
    const highlight = highlightCells.find(h => h.row === rowIndex && h.col === colIndex);
    if (!highlight) return '';
    
    const styles = {
      primary: 'bg-primary/20 text-primary font-bold',
      secondary: 'bg-secondary/20 text-secondary font-bold',
      warning: 'bg-warning/20 text-warning font-bold',
    };
    return styles[highlight.type];
  };
  
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 font-semibold text-left">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/50 last:border-0">
              {row.map((cell, colIndex) => (
                <td 
                  key={colIndex} 
                  className={cn("px-4 py-3", getCellStyle(rowIndex, colIndex))}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface TableNotesProps {
  notes: Array<{ color: string; label: string }>;
}

export function TableNotes({ notes }: TableNotesProps) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {notes.map((note, index) => (
        <span key={index} className="flex items-center gap-2 text-sm">
          <span className="text-lg">{note.color}</span>
          <span className="text-muted-foreground">{note.label}</span>
        </span>
      ))}
    </div>
  );
}
