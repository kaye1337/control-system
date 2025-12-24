'use client';

import { Suspense } from 'react';
import AdminDashboard from './AdminDashboard';

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
