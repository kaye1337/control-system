'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { getDiaryEntries, createDiaryEntry, addComment, logoutUser, uploadFile } from '../actions';

import GalleryGrid from './GalleryGrid';

interface DiaryFeedProps {
  user: { id: string; username: string; role: string };
}

export default function DiaryFeed({ user }: DiaryFeedProps) {
  const { t } = useLanguage();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'gallery'>('feed');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);


  // New Entry State
  const [newContent, setNewContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const res = await uploadFile(formData);
    
    if (res.success && res.url) {
      setMediaUrl(res.url);
      setMediaType(res.type as 'IMAGE' | 'VIDEO');
    } else {
      alert(t('diary.uploadFailed') || 'Upload failed');
    }
    setUploading(false);
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
    if (!newContent.trim()) return;

    const media = mediaUrl ? [{ url: mediaUrl, type: mediaType }] : [];
    const res = await createDiaryEntry(user.id, newContent, media);
    
    if (res.success) {
      setNewContent('');
      setMediaUrl('');
      setShowCreate(false);
      loadEntries();
    } else {
      alert(res.message || 'Failed to create entry');
    }
  };

  const handleComment = async (entryId: string, content: string) => {
    if (!content.trim()) return;
    await addComment(entryId, user.id, content);
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
            <h1 className="text-xl font-bold text-rose-600 font-serif">{t('diary.title')}</h1>
            <div className="flex gap-4">
               <button 
                onClick={() => setShowCreate(true)}
                className="text-rose-600 font-semibold hover:bg-rose-50 px-3 py-1 rounded"
              >
                + {t('diary.newEntry')}
              </button>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {t('common.logout')}
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
              {t('diary.title')}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-2 px-1 text-sm font-medium transition ${
                activeTab === 'gallery' 
                  ? 'text-rose-600 border-b-2 border-rose-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gallery
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
              <h3 className="text-lg font-bold mb-4">{t('diary.createTitle')}</h3>
              
              <textarea 
                className="w-full border p-3 rounded-lg mb-4 h-32 resize-none focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder={t('diary.placeholder')}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('diary.uploadMedia')}</label>
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
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
              </div>

              {mediaUrl && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
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
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={uploading}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded shadow-sm disabled:opacity-50"
                >
                  {t('diary.post')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feed or Gallery */}
        {activeTab === 'gallery' ? (
          <GalleryGrid />
        ) : (
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading memories...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-10 text-gray-400">{t('diary.noEntries')}</div>
            ) : (
              entries.map(entry => (
                <article key={entry.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                      {entry.author.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{entry.author.name}</h4>
                      <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
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
                      t={t}
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

function CommentSection({ comments, onAddComment, t }: { comments: any[], onAddComment: (t: string) => void, t: any }) {
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
          placeholder={t('diary.commentPlaceholder')}
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
