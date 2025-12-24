'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { loginUser, registerUser } from './actions';

export default function HomeClient() {
  const { t } = useLanguage();
  const router = useRouter();
  
  type ViewState = 'intro' | 'roleSelect' | 'loginForm' | 'registerForm';
  const [view, setView] = useState<ViewState>('intro');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'ADMIN' | null>(null);
  
  // Form States
  const [name, setName] = useState(''); // for register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setMsg('');
    try {
      let res;
      if (view === 'registerForm') {
        res = await registerUser(username, password, name);
        if (res.success) {
          setMsg(t('auth.pending'));
          setLoading(false);
          return;
        }
      } else {
        res = await loginUser(username, password);
      }

      if (res.success && res.user) {
        if (res.user.role === 'ADMIN') {
           router.push(`/admin`);
        } else {
           router.push(`/diary`);
        }
      } else {
        setMsg(res.message || t('auth.failed'));
      }
    } catch (e) {
      console.error('Login/Register Exception:', e);
      setMsg('System Error: ' + (e instanceof Error ? e.message : JSON.stringify(e)));
    }
    setLoading(false);
  };

  // Render Helpers
  const renderIntro = () => (
    <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      <div className="p-8 bg-gradient-to-r from-pink-400 to-rose-500 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.introTitle')}</h2>
        <p className="text-lg opacity-90">{t('home.introText')}</p>
      </div>
      <div className="p-8 flex justify-center gap-6 bg-gray-50">
        <button 
          onClick={() => setView('roleSelect')}
          className="px-8 py-3 bg-rose-500 text-white text-lg rounded-lg shadow hover:bg-rose-600 transition"
        >
          {t('home.login')}
        </button>
        <button 
          onClick={() => setView('registerForm')}
          className="px-8 py-3 bg-white text-rose-500 border-2 border-rose-500 text-lg rounded-lg shadow hover:bg-rose-50 transition"
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
          onClick={() => { setSelectedRole('MEMBER'); setView('loginForm'); }}
          className="p-4 border-2 border-rose-100 rounded-lg hover:border-rose-500 hover:bg-rose-50 transition flex items-center justify-center text-lg font-semibold text-rose-800"
        >
          {t('auth.roleMember')}
        </button>
        <button 
          onClick={() => { setSelectedRole('ADMIN'); setView('loginForm'); }}
          className="p-4 border-2 border-gray-100 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition flex items-center justify-center text-lg font-semibold text-gray-800"
        >
          {t('auth.roleAdmin')}
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
        {selectedRole === 'MEMBER' && t('auth.roleMember')}
        {selectedRole === 'ADMIN' && t('auth.roleAdmin')}
      </h3>

      {msg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center text-sm">{msg}</div>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.username')}</label>
          <input 
            type="text" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-rose-500 outline-none"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.password')}</label>
          <input 
            type="password" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-rose-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600 disabled:opacity-50 mt-2"
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
      
      {msg && <div className={`mb-4 p-3 rounded text-center text-sm ${msg === t('auth.pending') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.name')}</label>
          <input 
            type="text" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-rose-500 outline-none"
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
            className="w-full border rounded p-2 focus:ring-2 focus:ring-rose-500 outline-none"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">{t('auth.password')}</label>
          <input 
            type="password" 
            className="w-full border rounded p-2 focus:ring-2 focus:ring-rose-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600 disabled:opacity-50 mt-2"
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-rose-50">
      <h1 className="text-4xl font-bold mb-8 text-rose-900 font-serif">{t('home.title')}</h1>
      
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
