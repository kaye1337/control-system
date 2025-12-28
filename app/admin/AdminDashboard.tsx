'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPendingUsers, approveUser, rejectUser, logoutUser, updateBackgroundImage } from '../actions';

export default function AdminDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBg, setUploadingBg] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getPendingUsers();
    if (res.success && res.users) {
      setUsers(res.users);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    await approveUser(userId);
    loadUsers();
  };

  const handleReject = async (userId: string) => {
    if (confirm('确定要拒绝该用户吗？')) {
      await rejectUser(userId);
      loadUsers();
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('确定要更换背景图吗？旧的背景图将被删除。')) return;

    setUploadingBg(true);
    const formData = new FormData();
    formData.append('file', file);

    const res = await updateBackgroundImage(formData);
    if (res.success) {
      alert('背景图更新成功，刷新页面查看效果');
    } else {
      alert('背景图更新失败: ' + res.message);
    }
    setUploadingBg(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">管理员控制台</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          >
            退出登录
          </button>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">系统设置</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-700">全局背景图</h3>
                <p className="text-sm text-gray-500 mt-1">更换登录页和主页的背景图片 (建议尺寸: 1920x1080)</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBgUpload}
                  disabled={uploadingBg}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <button 
                  disabled={uploadingBg}
                  className={`px-4 py-2 rounded text-white transition ${uploadingBg ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {uploadingBg ? '上传中...' : '更换背景'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">待审核申请</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">加载中...</div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">暂无待审核用户</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map(user => (
                <li key={user.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-gray-500">@{user.username}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm transition"
                    >
                      批准
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm transition"
                    >
                      拒绝
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
