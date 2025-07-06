"use client";

import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number;
  itemsPerRow: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
}

export const VirtualGrid = memo(function VirtualGrid<T>({
  items,
  itemHeight,
  itemsPerRow,
  containerHeight,
  renderItem,
  className,
  gap = 16,
  overscan = 5,
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;
  
  const visibleRows = Math.ceil(containerHeight / rowHeight);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(totalRows - 1, startRow + visibleRows + overscan * 2);
  
  const visibleItems = useMemo(() => {
    const start = startRow * itemsPerRow;
    const end = Math.min(items.length, (endRow + 1) * itemsPerRow);
    return items.slice(start, end).map((item, index) => ({
      item,
      originalIndex: start + index,
      row: Math.floor((start + index) / itemsPerRow),
      col: (start + index) % itemsPerRow,
    }));
  }, [items, startRow, endRow, itemsPerRow]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return (
    <div 
      className={cn("relative overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, originalIndex, row, col }) => (
          <div
            key={originalIndex}
            style={{
              position: 'absolute',
              top: row * rowHeight,
              left: col * (100 / itemsPerRow) + '%',
              width: `calc(${100 / itemsPerRow}% - ${gap * (itemsPerRow - 1) / itemsPerRow}px)`,
              height: itemHeight,
            }}
          >
            {renderItem(item, originalIndex)}
          </div>
        ))}
      </div>
    </div>
  );
});

export default VirtualGrid;
