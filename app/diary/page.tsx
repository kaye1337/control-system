import { Suspense } from 'react';
import DiaryFeed from './DiaryFeed';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DiaryPage() {
  const user = await getSession();
  if (!user) {
    redirect('/');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiaryFeed user={user} />
    </Suspense>
  );
}
