'use client';

import { Suspense } from 'react';
import DiaryFeed from './DiaryFeed';

export default function DiaryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiaryFeed />
    </Suspense>
  );
}
