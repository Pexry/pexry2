"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface OptimizedDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  enableSorting?: boolean;
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  loadingRows?: number;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

// Regular table row component
function TableRowComponent<T>({ 
  item, 
  index, 
  columns 
}: { 
  item: T; 
  index: number; 
  columns: Column<T>[];
}) {
  return (
    <TableRow className="hover:bg-muted/50">
      {columns.map((column, colIndex) => {
        const value = typeof column.key === 'string' && column.key.includes('.') 
          ? column.key.split('.').reduce((obj: any, key) => obj?.[key], item)
          : (item as any)[column.key];
        
        return (
          <TableCell key={colIndex} className={cn("p-2", column.className)}>
            {column.render ? column.render(value, item, index) : String(value || '')}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export function OptimizedDataTable<T>({
  columns,
  data,
  enableSorting = true,
  className,
  isLoading = false,
  emptyMessage = "No data available",
  loadingRows = 5,
}: OptimizedDataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({ key: '', direction: null });

  const handleSort = useCallback((columnKey: string) => {
    if (!enableSorting) return;
    
    setSortState(prev => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      
      switch (prev.direction) {
        case null:
          return { key: columnKey, direction: 'asc' };
        case 'asc':
          return { key: columnKey, direction: 'desc' };
        case 'desc':
          return { key: '', direction: null };
        default:
          return { key: '', direction: null };
      }
    });
  }, [enableSorting]);

  const sortedData = useMemo(() => {
    if (!enableSorting || !sortState.key || !sortState.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = typeof sortState.key === 'string' && sortState.key.includes('.') 
        ? sortState.key.split('.').reduce((obj: any, key) => obj?.[key], a)
        : (a as any)[sortState.key];
      
      const bValue = typeof sortState.key === 'string' && sortState.key.includes('.') 
        ? sortState.key.split('.').reduce((obj: any, key) => obj?.[key], b)
        : (b as any)[sortState.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortState.direction === 'asc' ? 1 : -1;

      // Handle different types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortState.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortState, enableSorting]);

  if (isLoading) {
    return (
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="p-2">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: loadingRows }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} className="p-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!sortedData.length) {
    return (
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="p-2">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className="p-2">
                {enableSorting && column.sortable !== false ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(String(column.key))}
                    className="h-8 p-2 hover:bg-muted font-medium"
                  >
                    {column.header}
                    {sortState.key === column.key && sortState.direction === 'asc' && (
                      <ArrowUp className="ml-2 h-4 w-4" />
                    )}
                    {sortState.key === column.key && sortState.direction === 'desc' && (
                      <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                    {sortState.key !== column.key && (
                      <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                ) : (
                  <span className="font-medium">{column.header}</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRowComponent 
              key={index} 
              item={item} 
              index={index} 
              columns={columns} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default OptimizedDataTable;
