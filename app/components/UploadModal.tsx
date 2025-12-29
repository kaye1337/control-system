'use client';

import { useState, useEffect } from 'react';
import { createDiaryEntry, uploadBatchPhotos, uploadFile, getAlbums } from '../actions';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: { id: string; username: string; role: string };
  initialType?: 'text' | 'media';
}

export default function UploadModal({ isOpen, onClose, onSuccess, user, initialType = 'text' }: UploadModalProps) {
  const [createType, setCreateType] = useState<'text' | 'media'>(initialType);
  const [newContent, setNewContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [uploading, setUploading] = useState(false);
  
  // Batch Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [existingAlbums, setExistingAlbums] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCreateType(initialType);
      // Fetch existing album names
      getAlbums().then(res => {
        if (res.success && res.albums) {
          setExistingAlbums(res.albums.map((a: any) => a.name));
        }
      });
    }
  }, [isOpen, initialType]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const scaleSize = MAX_WIDTH / img.width;
        
        if (scaleSize >= 1) {
             resolve(file);
             return;
        }

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve(file);
            return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Batch Logic
    if (createType === 'media' || e.target.files.length > 1) {
        const files = Array.from(e.target.files);
        const compressedFiles = await Promise.all(files.map(async (file) => {
            if (file.type.startsWith('image/')) {
                try {
                    return await compressImage(file);
                } catch (e) {
                    return file;
                }
            }
            return file;
        }));
        setSelectedFiles(compressedFiles);
        return;
    }

    // Single Logic
    setUploading(true);
    let file = e.target.files[0];
    if (file.type.startsWith('image/')) {
        try {
            file = await compressImage(file);
        } catch (error) {
            console.error('Compression failed', error);
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

  const handleSubmit = async () => {
    // Batch Submit
    if (createType === 'media' && selectedFiles.length > 0) {
        if (!albumName.trim()) {
            alert('请输入相册名称');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        formData.append('albumName', albumName);
        
        const res = await uploadBatchPhotos(formData);
        setUploading(false);
        
        if (res.success) {
            setSelectedFiles([]);
            setAlbumName('');
            onSuccess();
        } else {
            alert(res.message || '上传失败');
        }
        return;
    }

    // Single Submit
    if (!newContent.trim() && !mediaUrl) return;

    setUploading(true);
    const media = mediaUrl ? [{ url: mediaUrl, type: mediaType }] : [];
    const res = await createDiaryEntry(user.id, newContent, media);
    setUploading(false);
    
    if (res.success) {
      setNewContent('');
      setMediaUrl('');
      onSuccess();
    } else {
      alert(res.message || '发布日记失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Tabs for switching modes inside modal if needed, or just title */}
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
                {createType === 'media' ? '批量上传到相册' : '写新日记'}
            </h3>
            <div className="flex gap-2 text-sm">
                <button 
                    onClick={() => setCreateType('media')}
                    className={`px-3 py-1 rounded-full ${createType === 'media' ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    传照片
                </button>
                <button 
                    onClick={() => setCreateType('text')}
                    className={`px-3 py-1 rounded-full ${createType === 'text' ? 'bg-rose-100 text-rose-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    写日记
                </button>
            </div>
        </div>
        
        {createType === 'media' ? (
            // Batch Upload Form
            <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    选择主题相册 <span className="text-red-500">*</span>
                </label>
                <input 
                    list="albums" 
                    type="text"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="输入新相册名称或选择已有相册..."
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                />
                <datalist id="albums">
                    {existingAlbums.map(name => <option key={name} value={name} />)}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">输入新名称将自动创建新文件夹</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择照片</label>
                <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-rose-50 file:text-rose-700
                    hover:file:bg-rose-100"
                />
            </div>

            {selectedFiles.length > 0 && (
                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                    已选择 {selectedFiles.length} 张照片
                    <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFiles.slice(0, 5).map((f, i) => (
                            <span key={i} className="bg-white border px-2 py-1 rounded text-xs truncate max-w-[100px]">{f.name}</span>
                        ))}
                        {selectedFiles.length > 5 && <span>...</span>}
                    </div>
                </div>
            )}
            </div>
        ) : (
            // Text Entry Form
            <>
            <textarea 
            className="w-full border p-3 rounded-lg mb-4 h-32 resize-none focus:ring-2 focus:ring-rose-500 outline-none"
            placeholder="分享你的故事..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            />
            
            {(mediaUrl || uploading) && (
            <div className="mb-4">
                {uploading ? (
                        <div className="text-sm text-gray-500">上传中...</div>
                ) : (
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">预览:</p>
                        {mediaType === 'IMAGE' ? (
                        <img src={mediaUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                        ) : (
                        <video src={mediaUrl} controls className="w-full h-40 object-cover rounded-lg" />
                        )}
                    </div>
                )}
            </div>
            )}

            {!mediaUrl && !uploading && (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">添加图片/视频 (可选)</label>
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                />
            </div>
            )}
            </>
        )}
    
        <div className="flex justify-end gap-3 mt-6">
            <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
            >
            取消
            </button>
            <button 
            onClick={handleSubmit}
            disabled={uploading || (createType === 'media' && (selectedFiles.length === 0 || !albumName))}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded shadow-sm disabled:opacity-50"
            >
            {uploading ? '处理中...' : '发布'}
            </button>
        </div>
      </div>
    </div>
  );
}