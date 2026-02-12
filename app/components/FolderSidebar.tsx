'use client';

import { useState, useEffect } from 'react';
import { getAlbums, createAlbum, deleteAlbum, updateAlbum } from '../actions';

interface Album {
  id: string;
  name: string;
}

interface FolderSidebarProps {
  user: { role: string };
  onSelectAlbum: (albumId: string | null) => void;
  selectedAlbumId: string | null;
}

export default function FolderSidebar({ user, onSelectAlbum, selectedAlbumId }: FolderSidebarProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const isAdmin = user.role === 'ADMIN';

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

  const handleCreate = async () => {
    if (!newAlbumName.trim()) return;
    const res = await createAlbum(newAlbumName);
    if (res.success) {
      setNewAlbumName('');
      setIsCreating(false);
      fetchAlbums();
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个相册吗？其中的照片也会被删除！')) return;
    const res = await deleteAlbum(id);
    if (res.success) {
      if (selectedAlbumId === id) onSelectAlbum(null);
      fetchAlbums();
    } else {
      alert(res.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingAlbum || !editingAlbum.name.trim()) return;
    const res = await updateAlbum(editingAlbum.id, editingAlbum.name);
    if (res.success) {
      setEditingAlbum(null);
      fetchAlbums();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-stone-200 p-4 h-[calc(100vh-100px)] overflow-y-auto sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-stone-700 flex items-center gap-2">
          <span>📂</span> 文件夹
        </h3>
        {isAdmin && (
          <button 
            onClick={() => setIsCreating(true)}
            className="text-xs bg-rose-500 text-white px-2 py-1 rounded hover:bg-rose-600 transition"
          >
            + 新建
          </button>
        )}
      </div>

      {/* Create Input */}
      {isCreating && (
        <div className="mb-3 p-2 bg-stone-50 rounded border border-stone-200">
          <input 
            type="text" 
            autoFocus
            className="w-full text-sm p-1 border rounded mb-2"
            placeholder="相册名称"
            value={newAlbumName}
            onChange={e => setNewAlbumName(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsCreating(false)} className="text-xs text-gray-500">取消</button>
            <button onClick={handleCreate} className="text-xs text-rose-600 font-bold">确定</button>
          </div>
        </div>
      )}

      {/* Album List */}
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onSelectAlbum(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2
              ${selectedAlbumId === null 
                ? 'bg-rose-50 text-rose-700 font-bold' 
                : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <span>🏠</span> 全部照片
          </button>
        </li>
        
        {loading ? (
          <div className="text-xs text-center py-4 text-gray-400">加载中...</div>
        ) : (
          albums.map(album => (
            <li key={album.id} className="group relative">
              {editingAlbum?.id === album.id ? (
                <div className="p-1 flex items-center gap-1">
                  <input 
                    className="w-full text-sm border rounded px-1"
                    value={editingAlbum.name}
                    onChange={e => setEditingAlbum({...editingAlbum, name: e.target.value})}
                  />
                  <button onClick={handleUpdate} className="text-green-600">✓</button>
                  <button onClick={() => setEditingAlbum(null)} className="text-gray-500">✕</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelectAlbum(album.id)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 truncate
                      ${selectedAlbumId === album.id 
                        ? 'bg-rose-50 text-rose-700 font-bold' 
                        : 'text-stone-600 hover:bg-stone-50'}`}
                  >
                    <span>📁</span> 
                    <span className="truncate">{album.name}</span>
                  </button>
                  
                  {isAdmin && (
                    <div className="absolute right-2 hidden group-hover:flex gap-1 bg-white shadow-sm rounded px-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingAlbum(album); }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="重命名"
                      >
                        ✎
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(album.id); }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="删除"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))
        )}
      </ul>
      
      {!isAdmin && albums.length === 0 && !loading && (
        <div className="text-xs text-gray-400 text-center mt-4">暂无文件夹</div>
      )}
    </div>
  );
}