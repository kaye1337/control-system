import { Suspense } from 'react';
import DiaryFeed from './DiaryFeed';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBackgroundImage } from '../actions';

export default async function DiaryPage() {
  const user = await getSession();
  if (!user) {
    redirect('/');
  }

  const bgUrl = await getBackgroundImage();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiaryFeed user={user} bgUrl={bgUrl} />
    </Suspense>
  );
}
