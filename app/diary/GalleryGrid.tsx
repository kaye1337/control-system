'use client';

import { useState, useEffect } from 'react';
import { getAllMedia, deleteDiaryEntry } from '../actions';

interface GalleryGridProps {
  user?: { id: string; role: string };
}

export default function GalleryGrid({ user }: GalleryGridProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    const res = await getAllMedia();
    if (res.success && res.media) {
      setMedia(res.media);
    }
    setLoading(false);
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    if (!window.confirm('确定要删除这张照片及其对应的日记吗？')) return;
    
    const res = await deleteDiaryEntry(entryId, user.id);
    if (res.success) {
      setSelectedMedia(null);
      loadMedia();
    } else {
      window.alert(res.message || '删除失败');
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="text-center py-10 text-gray-400">加载中...</div>
      ) : media.length === 0 ? (
        <div className="text-center py-10 text-gray-400">暂无照片或视频</div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {media.map((item) => (
            <div 
              key={item.id} 
              className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'IMAGE' ? (
                <img 
                  src={item.url} 
                  alt="Gallery item" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" 
                  loading="lazy"
                />
              ) : (
                <video 
                  src={item.url} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" 
                />
              )}
              
              {/* Overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                 <p className="text-white text-sm font-bold drop-shadow-md translate-y-2 group-hover:translate-y-0 transition duration-300">
                   {item.entry?.author?.name}
                 </p>
                 <p className="text-white/80 text-xs mt-1 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition duration-300 delay-75">
                   {new Date(item.entry?.createdAt).toLocaleDateString()}
                 </p>
              </div>
              
              {item.type === 'VIDEO' && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-screen w-full flex flex-col items-center">
            {selectedMedia.type === 'IMAGE' ? (
              <img 
                src={selectedMedia.url} 
                alt="Full view" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl" 
              />
            )}
            
            <div className="mt-4 text-center text-white">
                       <h3 className="text-lg font-bold">{selectedMedia.entry?.author?.name}</h3>
                       <p className="text-sm text-gray-300">
                         {new Date(selectedMedia.entry?.createdAt).toLocaleString()}
                       </p>
                    </div>

                    {user && (user.role === 'ADMIN' || user.id === selectedMedia.entry?.authorId) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(selectedMedia.entry.id);
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        删除照片及日记
                      </button>
                    )}

                    <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={() => setSelectedMedia(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
