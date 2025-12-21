'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { loginCustomer, registerCustomer, loginStaff } from './actions';

export default function HomeClient() {
  const { t } = useLanguage();
  const router = useRouter();
  
  type ViewState = 'intro' | 'roleSelect' | 'loginForm' | 'registerForm';
  const [view, setView] = useState<ViewState>('intro');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin' | 'waiter' | null>(null);
  
  // Form States
  const [name, setName] = useState(''); // for register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCustomerSubmit = async () => {
    setLoading(true);
    setMsg('');
    try {
      let res;
      // If we are in registerForm view, register. If in loginForm (and role is customer), login.
      if (view === 'registerForm') {
        res = await registerCustomer(username, password, name);
      } else {
        res = await loginCustomer(username, password);
      }

      if (res.success && res.user) {
        router.push(`/customer?id=${res.user.id}`);
      } else {
        setMsg(res.message || 'Error');
      }
    } catch (e) {
      console.error(e);
      setMsg(e instanceof Error ? e.message : 'An unexpected error occurred');
    }
    setLoading(false);
  };

  const handleStaffSubmit = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await loginStaff(username, password);
      if (res.success && res.user) {
        if (selectedRole === 'admin' && res.user.role !== 'BOSS') {
           setMsg('Not authorized as Admin');
           setLoading(false);
           return;
        }
        if (selectedRole === 'waiter' && res.user.role !== 'WAITER') {
           setMsg('Not authorized as Waiter');
           setLoading(false);
           return;
        }

        if (res.user.role === 'BOSS') {
          router.push(`/boss?id=${res.user.id}`);
        } else {
          router.push(`/waiter?id=${res.user.id}`);
        }
      } else {
        setMsg(res.message || 'Error');
      }
    } catch (e) {
      setMsg('Error');
    }
    setLoading(false);
  };

  // Render Helpers
  const renderIntro = () => (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.introTitle')}</h2>
        <p className="text-lg opacity-90">{t('home.introText')}</p>
      </div>
      <div className="p-8 flex justify-center gap-6 bg-gray-50">
        <button 
          onClick={() => setView('roleSelect')}
          className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700 transition"
        >
          {t('home.login')}
        </button>
        <button 
          onClick={() => setView('registerForm')}
          className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 text-lg rounded-lg shadow hover:bg-blue-50 transition"
        >
          {t('home.register')}
        </button>
      </div>
    </div>
  );

  const renderRoleSelect = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-center mb-6">{t('auth.selectRole')}</h3>
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => { setSelectedRole('customer'); setView('loginForm'); }}
          className="p-4 border-2 border-blue-100 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center text-lg font-semibold text-blue-800"
        >
          {t('auth.roleCustomer')}
        </button>
        <button 
          onClick={() => { setSelectedRole('admin'); setView('loginForm'); }}
          className="p-4 border-2 border-purple-100 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition flex items-center justify-center text-lg font-semibold text-purple-800"
        >
          {t('auth.roleAdmin')}
        </button>
        <button 
          onClick={() => { setSelectedRole('waiter'); setView('loginForm'); }}
          className="p-4 border-2 border-green-100 rounded-lg hover:border-green-500 hover:bg-green-50 transition flex items-center justify-center text-lg font-semibold text-green-800"
        >
          {t('auth.roleWaiter')}
        </button>
      </div>
      <button 
        onClick={() => setView('intro')}
        className="mt-6 w-full text-gray-500 hover:text-gray-700 text-sm"
      >
        {t('home.back')}
      </button>
    </div>
  );

  const renderLoginForm = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-center mb-6">
        {selectedRole === 'customer' && t('auth.roleCustomer')}
        {selectedRole === 'admin' && t('auth.roleAdmin')}
        {selectedRole === 'waiter' && t('auth.roleWaiter')}
      </h3>

      {msg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center text-sm">{msg}</div>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.username')}</label>
          <input 
            type="text" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.password')}</label>
          <input 
            type="password" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          onClick={selectedRole === 'customer' ? handleCustomerSubmit : handleStaffSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-2"
        >
          {loading ? '...' : t('auth.login')}
        </button>
      </div>

      <button 
        onClick={() => setView('roleSelect')}
        className="mt-6 w-full text-gray-500 hover:text-gray-700 text-sm"
      >
        {t('home.back')}
      </button>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-center mb-6">{t('auth.register')}</h3>
      
      {msg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center text-sm">{msg}</div>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.name')}</label>
          <input 
            type="text" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            {t('auth.username')} 
            <span className="text-xs text-gray-400 ml-2">({t('auth.usernameHint')})</span>
          </label>
          <input 
            type="text" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.password')}</label>
          <input 
            type="password" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          onClick={handleCustomerSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-2"
        >
          {loading ? '...' : t('auth.register')}
        </button>
      </div>

      <button 
        onClick={() => setView('intro')}
        className="mt-6 w-full text-gray-500 hover:text-gray-700 text-sm"
      >
        {t('home.back')}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">{t('home.title')}</h1>
      
      {view === 'intro' && renderIntro()}
      {view === 'roleSelect' && renderRoleSelect()}
      {view === 'loginForm' && renderLoginForm()}
      {view === 'registerForm' && renderRegisterForm()}
      
      <div className="mt-8 text-gray-400 text-xs">
        <p>{t('home.dbHint')}</p>
      </div>
    </div>
  );
}
