'use client';

import { useState, useEffect } from 'react';
import { getAlbums } from '../actions';

interface Media {
  id: string;
  url: string;
  type: string;
}

interface Album {
  id: string;
  name: string;
  media: Media[];
}

export default function AlbumTree() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const res = await getAlbums();
    if (res.success && res.albums) {
      setAlbums(res.albums);
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">正在生长...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="relative border-l-4 border-amber-700/60 ml-4 md:ml-10 space-y-12 py-4">
        {/* Main Trunk Decoration */}
        <div className="absolute -left-[14px] -top-2 w-6 h-6 rounded-full bg-green-600 border-4 border-amber-800 z-10" />
        
        {albums.map((album, index) => (
          <div key={album.id} className="relative pl-8 md:pl-12 group">
            {/* Branch Connector */}
            <div className="absolute left-0 top-6 w-8 md:w-12 h-1 bg-amber-700/60 rounded-r-full transform -translate-y-1/2 origin-left transition-all duration-300 group-hover:w-10 md:group-hover:w-14 group-hover:bg-amber-600" />
            
            {/* Branch Knot */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-amber-800 border-2 border-amber-600 z-10" />

            {/* Album (Branch) Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-stone-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📂</span> {album.name}
              </h3>
              
              {/* Leaves (Photos) */}
              <div className="flex flex-wrap gap-2">
                {album.media.length > 0 ? (
                  album.media.map((item) => (
                    <div key={item.id} className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-white shadow-sm transform hover:scale-110 hover:z-10 transition-transform hover:rotate-2 origin-bottom">
                      {item.type === 'VIDEO' ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} alt="Leaf" className="w-full h-full object-cover" />
                      )}
                      {/* Leaf Stem Decoration */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-green-600/80" />
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">空空如也...</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {albums.length === 0 && (
          <div className="pl-12 text-gray-500 italic">还没有长出树枝 (暂无相册)</div>
        )}
        
        {/* Bottom Root Decoration */}
        <div className="absolute -left-[14px] -bottom-2 w-6 h-6 rounded-full bg-amber-800 border-4 border-amber-900 z-10" />
      </div>
    </div>
  );
}
