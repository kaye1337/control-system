import { getAlbum, getBackgroundImage } from '../../actions';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }

  const res = await getAlbum(params.id);
  
  if (!res.success || !res.album) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">相册未找到</h1>
                <Link href="/albums" className="text-rose-600 hover:underline">返回相册库</Link>
            </div>
        </div>
    );
  }

  const { album } = res;
  const bgUrl = await getBackgroundImage();

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }}>
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-100/50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/albums" className="text-gray-500 hover:text-rose-600 flex items-center gap-1 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        返回相册库
                    </Link>
                    <div className="h-6 w-px bg-gray-300 mx-2" />
                    <h1 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                        📂 {album.name}
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {album.media.length} items
                        </span>
                    </h1>
                </div>
            </div>
        </header>

        {/* Gallery Grid */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
            {album.media.length === 0 ? (
                <div className="text-center py-20 text-gray-500 italic">
                    相册里还没有照片...
                </div>
            ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {album.media.map((item) => (
                        <div key={item.id} className="break-inside-avoid bg-white p-2 rounded-lg shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                            {item.type === 'VIDEO' ? (
                                <video src={item.url} controls className="w-full rounded-md" />
                            ) : (
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <img src={item.url} alt="Gallery item" className="w-full rounded-md hover:opacity-95 transition-opacity" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
      </div>
    </div>
  );
}