'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDiaryEntries, createDiaryEntry, addComment, logoutUser, uploadFile, deleteDiaryEntry } from '../actions';

import GalleryGrid from './GalleryGrid';

interface DiaryFeedProps {
  user: { id: string; username: string; role: string };
}

export default function DiaryFeed({ user }: DiaryFeedProps) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'gallery'>('gallery');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<'text' | 'media'>('text');


  // New Entry State
  const [newContent, setNewContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [uploading, setUploading] = useState(false);

  // Helper function to compress image
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Limit width to 1200px
        const scaleSize = MAX_WIDTH / img.width;
        
        // If image is smaller than max width, don't resize
        if (scaleSize >= 1) {
             resolve(file);
             return;
        }

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(file); // Fallback
            return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new File object
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8); // 80% quality
      };
      img.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    let file = e.target.files[0];
    
    // Compress if it is an image
    if (file.type.startsWith('image/')) {
        try {
            file = await compressImage(file);
        } catch (error) {
            console.error('Compression failed, using original file', error);
        }
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await uploadFile(formData);
    
    if (res.success && res.url) {
      setMediaUrl(res.url);
      setMediaType(res.type as 'IMAGE' | 'VIDEO');
    } else {
      alert(res.message || '上传失败');
    }
    setUploading(false);
    e.target.value = '';
  };

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

  const handleCreate = async () => {
    // Allow post if content is present OR media is present
    if (!newContent.trim() && !mediaUrl) return;

    setUploading(true);
    const media = mediaUrl ? [{ url: mediaUrl, type: mediaType }] : [];
    const res = await createDiaryEntry(user.id, newContent, media);
    setUploading(false);
    
    if (res.success) {
      setNewContent('');
      setMediaUrl('');
      setShowCreate(false);
      loadEntries();
    } else {
      alert(res.message || '发布日记失败');
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-rose-600 font-serif">日记列表</h1>
            <div className="flex gap-4">
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
                退出登录
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-2 px-1 text-sm font-medium transition ${
                activeTab === 'feed' 
                  ? 'text-rose-600 border-b-2 border-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              日记列表
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-2 px-1 text-sm font-medium transition ${
                activeTab === 'gallery' 
                  ? 'text-rose-600 border-b-2 border-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              照片墙
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4">
        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">{createType === 'media' ? '上传照片/视频' : '写新日记'}</h3>
              
              <textarea 
                className="w-full border p-3 rounded-lg mb-4 h-32 resize-none focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder={createType === 'media' ? "给这张照片写点描述..." : "分享你的故事..."}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
              
              {(createType === 'media' || mediaUrl) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">选择文件</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-rose-50 file:text-rose-700
                      hover:file:bg-rose-100"
                  />
                  {uploading && <span className="text-sm text-gray-500">上传中...</span>}
                </div>
              </div>
              )}

              {mediaUrl && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">预览:</p>
                  {mediaType === 'IMAGE' ? (
                    <img src={mediaUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  ) : (
                    <video src={mediaUrl} controls className="w-full h-40 object-cover rounded-lg" />
                  )}
                </div>
              )}
            
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={uploading}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded shadow-sm disabled:opacity-50"
                >
                  发布
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feed or Gallery */}
                {activeTab === 'gallery' ? (
                  <GalleryGrid user={user} />
                ) : (
          <div className="flex flex-col gap-6">
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
