import { Suspense } from 'react';
import AdminDashboard from './AdminDashboard';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard user={user} />
    </Suspense>
  );
}
