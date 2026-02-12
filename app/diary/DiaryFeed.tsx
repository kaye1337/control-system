'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDiaryEntries, createDiaryEntry, addComment, logoutUser, uploadFile, deleteDiaryEntry, uploadBatchPhotos, getAlbums, getAlbum, deleteMedia } from '../actions';

import AlbumTree from '../components/AlbumTree';
import UploadModal from '../components/UploadModal';
import FolderSidebar from '../components/FolderSidebar';
import Link from 'next/link';

interface DiaryFeedProps {
  user: { id: string; username: string; role: string };
  bgUrl: string;
}

export default function DiaryFeed({ user, bgUrl }: DiaryFeedProps) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'gallery'>('gallery');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // Sidebar State
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedAlbumData, setSelectedAlbumData] = useState<any>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (selectedAlbumId) {
      loadAlbumData(selectedAlbumId);
    } else {
      setSelectedAlbumData(null);
    }
  }, [selectedAlbumId]);

  const loadEntries = async () => {
    setLoading(true);
    const data = await getDiaryEntries();
    if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const loadAlbumData = async (id: string) => {
    const res = await getAlbum(id);
    if (res.success) {
      setSelectedAlbumData(res.album);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreate(false);
    loadEntries();
    // Also refresh album data if needed
    if (selectedAlbumId) loadAlbumData(selectedAlbumId);
    // Refresh sidebar if new album created? (handled in sidebar internally)
    alert('发布成功！');
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('确定要删除这条日记吗？')) return;
    
    const res = await deleteDiaryEntry(entryId, user.id);
    if (res.success) {
      loadEntries();
    } else {
      alert(res.message || '删除失败');
    }
  };

  const handleComment = async (entryId: string, content: string) => {
    if (!content.trim()) return;
    const res = await addComment(entryId, user.id, content);
    if (!res.success) {
      alert(res.message || '添加评论失败');
    }
    loadEntries();
  };

  const handleDeleteMedia = async (e: React.MouseEvent, mediaId: string) => {
    e.preventDefault();
    if (!confirm('确定要删除这张照片吗？')) return;
    
    const res = await deleteMedia(mediaId);
    if (res.success) {
      if (selectedAlbumId) loadAlbumData(selectedAlbumId);
      loadEntries();
    } else {
      alert(res.message || '删除失败');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }}>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-0" />

      {/* Header - Desktop & Mobile */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            {/* Title */}
            <h1 className="text-lg md:text-xl font-bold text-rose-600 font-serif tracking-tight">
               Family Album
            </h1>

            {/* Desktop Actions */}
            <div className="hidden md:flex gap-4 items-center">
               {user.role === 'ADMIN' && (
                 <Link 
                   href="/admin"
                   className="text-stone-600 font-semibold hover:text-rose-600 px-3 py-1 transition flex items-center gap-1"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                   </svg>
                   管理控制台
                 </Link>
               )}
               <button 
                onClick={() => setShowCreate(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition transform hover:scale-105"
              >
                + 发布日记/照片
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                退出
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
                 <button onClick={() => setShowCreate(true)} className="text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-full">
                    + 发布
                 </button>
                 <button onClick={handleLogout} className="text-gray-400 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                 </button>
            </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6 relative z-10">
        
        {/* Sidebar (Desktop Only) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
           <FolderSidebar 
             user={user}
             selectedAlbumId={selectedAlbumId}
             onSelectAlbum={(id) => {
               setSelectedAlbumId(id);
               setActiveTab('gallery'); // Switch to gallery when selecting folder
             }}
           />
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200/50 bg-white/50 backdrop-blur-sm mb-6 rounded-t-lg">
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition ${
                    activeTab === 'gallery' 
                      ? 'text-rose-600 border-b-2 border-rose-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  相册视图
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition ${
                    activeTab === 'feed' 
                      ? 'text-rose-600 border-b-2 border-rose-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  日记时间轴
                </button>
            </div>

            {/* Gallery View */}
            {activeTab === 'gallery' && (
              <div className="animate-fade-in">
                {selectedAlbumId && selectedAlbumData ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-stone-200">
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                           <span className="text-3xl">📂</span> {selectedAlbumData.name}
                        </h2>
                        <span className="text-sm text-gray-500">{selectedAlbumData.media?.length || 0} 张照片</span>
                     </div>
                     
                     {selectedAlbumData.media && selectedAlbumData.media.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {selectedAlbumData.media.map((m: any) => (
                              <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition">
                                 {m.type === 'VIDEO' ? (
                                    <video src={m.url} className="w-full h-full object-cover" controls />
                                 ) : (
                                    <img src={m.url} alt="photo" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                                 )}
                                 {/* User can delete their own photos */}
                                 {(user.role === 'ADMIN' || user.id === m.entry?.authorId) && (
                                    <button 
                                      onClick={(e) => handleDeleteMedia(e, m.id)}
                                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600 z-10"
                                      title="删除照片"
                                    >
                                      ×
                                    </button>
                                 )}
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-20 text-gray-400">
                           此文件夹为空
                        </div>
                     )}
                  </div>
                ) : (
                  // Default View: Album Tree
                  <AlbumTree />
                )}
              </div>
            )}

            {/* Feed View */}
            {activeTab === 'feed' && (
               <div className="space-y-8 max-w-2xl mx-auto">
                 {loading ? (
                    <div className="text-center py-10 text-gray-500">加载中...</div>
                 ) : (
                    entries.map(entry => (
                       <div key={entry.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition">
                          {/* Entry Header */}
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <div className="font-bold text-stone-800 text-lg">{entry.author.name}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString()}
                                </div>
                             </div>
                             {(user.role === 'ADMIN' || user.id === entry.authorId) && (
                                <button 
                                  onClick={() => handleDelete(entry.id)}
                                  className="text-gray-300 hover:text-red-500 transition p-2"
                                  title="删除"
                                >
                                  ×
                                </button>
                             )}
                          </div>
                          
                          {/* Content */}
                          <p className="text-stone-700 whitespace-pre-wrap leading-relaxed mb-4 font-serif">
                             {entry.content}
                          </p>

                          {/* Media Grid */}
                          {entry.media && entry.media.length > 0 && (
                             <div className={`grid gap-2 mb-4 ${
                                entry.media.length === 1 ? 'grid-cols-1' : 
                                entry.media.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                             }`}>
                                {entry.media.map((m: any) => (
                                   <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                      {m.type === 'VIDEO' ? (
                                         <video src={m.url} className="w-full h-full object-cover" controls />
                                      ) : (
                                         <img src={m.url} alt="media" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                                      )}
                                   </div>
                                ))}
                             </div>
                          )}

                          {/* Comments Section */}
                          <div className="border-t border-gray-100 pt-3 mt-2">
                             <CommentSection 
                               comments={entry.comments} 
                               onAddComment={(txt) => handleComment(entry.id, txt)}
                             />
                          </div>
                       </div>
                    ))
                 )}
               </div>
            )}
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showCreate} 
        onClose={() => setShowCreate(false)} 
        onSuccess={handleCreateSuccess}
        user={user}
        defaultAlbumId={selectedAlbumId}
      />
    </div>
  );
}

function CommentSection({ comments, onAddComment }: { comments: any[], onAddComment: (t: string) => void }) {
  const [txt, setTxt] = useState('');

  return (
    <div>
      <div className="flex flex-col gap-2 mb-3">
        {comments.map(c => (
          <div key={c.id} className="text-sm">
            <span className="font-bold text-gray-700">{c.author.name}: </span>
            <span className="text-gray-600">{c.content}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none"
          placeholder="写评论..."
          value={txt}
          onChange={e => setTxt(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && txt.trim()) {
              onAddComment(txt);
              setTxt('');
            }
          }}
        />
      </div>
    </div>
  );
}