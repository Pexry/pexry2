// pexry/src/app/(app)/(Home)/test/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import React from 'react';

// Create a separate client component for the content that uses useQuery
function TestContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['hello'],
    queryFn: () => Promise.resolve('Hello from React Query!'),
  });

  return (
    <div>
      <h1>Test React Query</h1>
      {isLoading ? <p>Loading...</p> : <p>{data}</p>}
    </div>
  );
}

export default function TestPage() {
  return <TestContent />;
}


