import { getAlbums, getBackgroundImage } from '../actions';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AlbumLibraryClient from './AlbumLibraryClient';

export default async function AlbumLibraryPage() {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }

  const { albums } = await getAlbums();
  const bgUrl = await getBackgroundImage();

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }}>
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-0" />
      
      <AlbumLibraryClient user={session} albums={albums || []} />
    </div>
  );
}