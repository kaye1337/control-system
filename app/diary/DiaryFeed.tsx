'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDiaryEntries, createDiaryEntry, addComment, logoutUser, uploadFile, deleteDiaryEntry, uploadBatchPhotos, getAlbums } from '../actions';

import AlbumTree from '../components/AlbumTree';
import UploadModal from '../components/UploadModal';
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
  const [createType, setCreateType] = useState<'text' | 'media'>('text');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    const data = await getDiaryEntries();
    if (data) {
      setEntries(data);
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    setShowCreate(false);
    loadEntries();
    if (activeTab === 'gallery') {
       setActiveTab('feed');
       setTimeout(() => setActiveTab('gallery'), 50);
    }
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

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }}>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-0" />

      {/* Header - Desktop & Mobile */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-100/50">
        <div className="max-w-2xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            {/* Title */}
            <h1 className="text-lg md:text-xl font-bold text-rose-600 font-serif tracking-tight">
               Family Album
            </h1>

            {/* Desktop Actions (Hidden on Mobile) */}
            <div className="hidden md:flex gap-4 items-center">
               <Link 
                 href="/albums"
                 className="text-stone-600 font-semibold hover:text-rose-600 px-3 py-1 transition"
               >
                 相册库
               </Link>
               <button 
                onClick={() => { setCreateType('media'); setShowCreate(true); }}
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-full shadow-md flex items-center gap-2 transition transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                上传照片
              </button>
               <button 
                onClick={() => { setCreateType('text'); setShowCreate(true); }}
                className="text-rose-600 font-semibold hover:bg-rose-50 px-3 py-1 rounded"
              >
                + 写日记
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                退出
              </button>
            </div>

            {/* Mobile Actions (Visible on Mobile) */}
            <div className="flex md:hidden items-center gap-3">
                 {/* Mobile Logout (Small Icon) */}
                 <button onClick={handleLogout} className="text-gray-400 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                 </button>
            </div>
        </div>
        
        {/* Mobile Tab Bar (Inside Header for now, or just below) */}
        <div className="flex md:hidden border-t border-gray-100">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-3 text-sm font-medium text-center transition ${
                activeTab === 'gallery' 
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              照片墙
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-3 text-sm font-medium text-center transition ${
                activeTab === 'gallery' 
                  ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              相册树
            </button>
        </div>
      </header>

      {/* Desktop Tabs (Hidden on Mobile) */}
      <div className="hidden md:flex justify-center border-b border-gray-200/50 bg-white/50 backdrop-blur-sm relative z-10">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-3 px-4 text-sm font-medium transition ${
                activeTab === 'gallery' 
                  ? 'text-rose-600 border-b-2 border-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              相册树
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-3 px-4 text-sm font-medium transition ${
                activeTab === 'feed' 
                  ? 'text-rose-600 border-b-2 border-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              日记列表
            </button>
          </div>
      </div>

      {/* Mobile FAB (Floating Action Button) */}
      <div className="fixed right-6 bottom-8 md:hidden z-30 flex flex-col gap-4 items-end">
         {/* Secondary FAB for Text (Only show when create is not showing, or make it a speed dial... simplified for now) */}
         {/* Let's just put two buttons if space permits, or one main button that opens a modal */}
         
         <button 
            onClick={() => { setCreateType('text'); setShowCreate(true); }}
            className="w-12 h-12 bg-white text-rose-500 rounded-full shadow-lg flex items-center justify-center border border-rose-100 active:scale-90 transition"
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
         </button>

         <button 
            onClick={() => { setCreateType('media'); setShowCreate(true); }}
            className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition"
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
         </button>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto md:p-4 relative z-0">
        <UploadModal 
            isOpen={showCreate}
            onClose={() => setShowCreate(false)}
            onSuccess={handleCreateSuccess}
            user={user}
            initialType={createType}
        />

        {activeTab === 'gallery' ? (
          <AlbumTree />
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 p-4 pb-20">
            {loading ? (
              <div className="text-center py-10 text-gray-400">加载中...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-10 text-gray-400">还没有日记，快来写第一篇吧！</div>
            ) : (
              entries.map(entry => (
                <article key={entry.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                          <div className="p-4 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                                {entry.author.name[0]}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{entry.author.name}</h4>
                                <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            
                            {(user.role === 'ADMIN' || user.id === entry.authorId) && (
                              <button 
                                onClick={() => handleDelete(entry.id)}
                                className="text-gray-400 hover:text-red-500 transition"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {entry.content && (
                    <div className="px-4 pb-2 text-gray-700 whitespace-pre-wrap">
                      {entry.content}
                    </div>
                  )}

                  {entry.media && entry.media.map((m: any) => (
                    <div key={m.id} className="w-full bg-black">
                      {m.type === 'IMAGE' ? (
                        <img src={m.url} alt="Post media" className="w-full max-h-96 object-contain" />
                      ) : (
                        <video src={m.url} controls className="w-full max-h-96" />
                      )}
                    </div>
                  ))}

                  <div className="p-4 border-t border-gray-50">
                    <CommentSection 
                      comments={entry.comments} 
                      onAddComment={(txt) => handleComment(entry.id, txt)}
                    />
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </main>
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
