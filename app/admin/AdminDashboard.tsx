'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPendingUsers, approveUser, rejectUser, logoutUser, updateBackgroundImage, getAllUsers, updateUser, deleteUser } from '../actions';
import Link from 'next/link';

export default function AdminDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBg, setUploadingBg] = useState(false);
  
  // Edit State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ username: '', password: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [pendingRes, activeRes] = await Promise.all([
      getPendingUsers(),
      getAllUsers()
    ]);

    if (pendingRes.success) setPendingUsers(pendingRes.users || []);
    if (activeRes.success) setActiveUsers(activeRes.users || []);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    await approveUser(userId);
    loadData();
  };

  const handleReject = async (userId: string) => {
    if (confirm('确定要拒绝该用户吗？')) {
      await rejectUser(userId);
      loadData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('确定要删除该用户吗？此操作不可恢复，将删除该用户的所有数据。')) {
      const res = await deleteUser(userId);
      if (res.success) {
        alert('用户已删除');
        loadData();
      } else {
        alert(res.message);
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ username: user.username, password: '' });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const res = await updateUser(editingUser.id, {
        username: editForm.username,
        password: editForm.password || undefined
    });

    if (res.success) {
        alert('用户信息已更新');
        setEditingUser(null);
        loadData();
    } else {
        alert(res.message);
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
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">管理员控制台</h1>
          <div className="flex gap-4">
            <Link href="/albums" className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded shadow-sm">
                进入相册库
            </Link>
            <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
            >
                退出登录
            </button>
          </div>
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

        {/* Pending Applications */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">待审核申请</h2>
            {pendingUsers.length > 0 && <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">{pendingUsers.length}</span>}
          </div>
          
          {loading ? (
            <div className="p-6 text-center text-gray-500">加载中...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">暂无待审核用户</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pendingUsers.map(u => (
                <li key={u.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{u.name}</h3>
                    <p className="text-gray-500">@{u.username}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow-sm transition"
                    >
                      批准
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
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

        {/* User Management */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">成员管理</h2>
            </div>
            
            {activeUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">暂无正式成员</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4">姓名</th>
                                <th className="p-4">账号/手机号</th>
                                <th className="p-4">注册时间</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activeUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{u.name}</td>
                                    <td className="p-4 text-gray-600">{u.username}</td>
                                    <td className="p-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                            onClick={() => handleEditUser(u)}
                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                        >
                                            编辑
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            删除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4">编辑用户: {editingUser.name}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">账号/手机号</label>
                        <input 
                            type="text" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={editForm.username}
                            onChange={e => setEditForm({...editForm, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">新密码 (留空则不修改)</label>
                        <input 
                            type="password" 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="输入新密码..."
                            value={editForm.password}
                            onChange={e => setEditForm({...editForm, password: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        onClick={() => setEditingUser(null)}
                        className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleUpdateUser}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow-sm"
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
