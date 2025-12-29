'use client';

import { useState, useEffect } from 'react';
import { createDiaryEntry, uploadBatchPhotos, getAlbums } from '../actions';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: { id: string; username: string; role: string };
  initialType?: 'text' | 'media'; // Kept for compatibility but unused logic-wise
}

export default function UploadModal({ isOpen, onClose, onSuccess, user }: UploadModalProps) {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [existingAlbums, setExistingAlbums] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setContent('');
      setSelectedFiles([]);
      setAlbumName('');
      
      // Fetch existing album names
      getAlbums().then(res => {
        if (res.success && res.albums) {
          setExistingAlbums(res.albums.map((a: any) => a.name));
        }
      });
    }
  }, [isOpen]);

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
    
    setSelectedFiles(prev => [...prev, ...compressedFiles]);
    e.target.value = ''; // Reset input
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;

    // Validation: If files are selected, Album is mandatory
    if (selectedFiles.length > 0 && !albumName.trim()) {
        alert('上传照片时必须选择或输入一个相册名称');
        return;
    }

    setUploading(true);

    let res;
    if (selectedFiles.length > 0) {
        // Case 1: Upload Photos (with optional text) -> Use uploadBatchPhotos
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        formData.append('albumName', albumName);
        if (content.trim()) {
            formData.append('content', content);
        }
        
        res = await uploadBatchPhotos(formData);
    } else {
        // Case 2: Text Only -> Use createDiaryEntry
        res = await createDiaryEntry(user.id, content, []);
    }

    setUploading(false);
    
    if (res.success) {
        onSuccess();
    } else {
        alert(res.message || '发布失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">写日记 / 传照片</h3>
        
        <div className="space-y-4">
            {/* 1. Text Content */}
            <div>
                <textarea 
                    className="w-full border p-3 rounded-lg h-32 resize-none focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="分享你的故事..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>

            {/* 2. File Upload & Preview */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                        添加照片/视频 
                    </label>
                    <span className="text-xs text-gray-400">
                        {selectedFiles.length} 个文件
                    </span>
                </div>
                
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
                    hover:file:bg-rose-100 mb-2"
                />

                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                        {selectedFiles.map((f, i) => (
                            <div key={i} className="relative group w-20 h-20">
                                {f.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover rounded border" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded border text-xs">Video</div>
                                )}
                                <button 
                                    onClick={() => removeFile(i)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Album Selection (Visible/Required if files present) */}
            {selectedFiles.length > 0 && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        归档相册 <span className="text-red-500">*</span>
                    </label>
                    <input 
                        list="albums" 
                        type="text"
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-rose-500 outline-none"
                        placeholder="选择或输入相册名称..."
                        value={albumName}
                        onChange={(e) => setAlbumName(e.target.value)}
                    />
                    <datalist id="albums">
                        {existingAlbums.map(name => <option key={name} value={name} />)}
                    </datalist>
                    <p className="text-xs text-gray-400 mt-1">照片将归档到此相册文件夹中</p>
                </div>
            )}
        </div>
    
        <div className="flex justify-end gap-3 mt-6">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
            >
                取消
            </button>
            <button 
                onClick={handleSubmit}
                disabled={uploading || (!content.trim() && selectedFiles.length === 0)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded shadow-sm disabled:opacity-50"
            >
                {uploading ? '处理中...' : '发布'}
            </button>
        </div>
      </div>
    </div>
  );
}
