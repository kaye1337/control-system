'use client';

import { useState } from 'react';
import Link from 'next/link';
import UploadModal from '../components/UploadModal';
import { useRouter } from 'next/navigation';

interface AlbumLibraryClientProps {
  user: any;
  albums: any[];
}

export default function AlbumLibraryClient({ user, albums }: AlbumLibraryClientProps) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/diary" className="text-gray-500 hover:text-rose-600 flex items-center gap-1 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    返回日记
                </Link>
                <h1 className="text-xl font-bold text-stone-800 font-serif">相册库</h1>
            </div>

            <button 
                onClick={() => setShowUpload(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition transform hover:scale-105"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                上传/新建相册
            </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        {albums.length === 0 ? (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">📂</div>
                <h2 className="text-xl text-stone-600 font-medium mb-2">还没有相册</h2>
                <p className="text-gray-500 mb-6">创建一个新相册，开始记录美好时光吧</p>
                <button 
                    onClick={() => setShowUpload(true)}
                    className="text-rose-600 font-semibold hover:underline"
                >
                    立即创建
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {albums.map((album) => (
                    <Link key={album.id} href={`/albums/${album.id}`} className="group">
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 transform group-hover:-translate-y-1">
                            {/* Cover Image */}
                            <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                                {album.media && album.media.length > 0 ? (
                                    <img 
                                        src={album.media[0].url} 
                                        alt={album.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-stone-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            
                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg text-stone-800 truncate mb-1 group-hover:text-rose-600 transition-colors">
                                    {album.name}
                                </h3>
                                <p className="text-xs text-stone-500">
                                    {new Date(album.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </main>

      <UploadModal 
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => {
            setShowUpload(false);
            router.refresh();
        }}
        user={user}
        initialType="media"
      />
    </div>
  );
}