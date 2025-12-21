'use client';

import { useState } from 'react';
import { updateWaiterStatus } from '../actions';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function WaiterClient({ waiterId, initialStatus, workLogs }: any) {
  const router = useRouter();
  const { t } = useLanguage();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = status === 'IDLE' ? 'BUSY' : 'IDLE';
    await updateWaiterStatus(waiterId, newStatus); // Using profile ID logic from action might need adjustment if passing user ID, but action expects profile ID. Assuming waiterId is profile ID.
    setStatus(newStatus);
    setLoading(false);
    router.refresh();
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center relative">
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 text-sm text-red-500 hover:text-red-700 font-medium"
        >
          {t('auth.logout')}
        </button>
        <h1 className="text-3xl font-bold mb-2 text-gray-800">{t('waiter.title')}</h1>
        <p className="text-gray-500 mb-8">{t('waiter.welcome')}</p>

        <div className="mb-8">
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">{t('waiter.currentStatus')}</p>
          <div className={`text-4xl font-black ${status === 'BUSY' ? 'text-red-500' : 'text-green-500'}`}>
            {t(`common.status.${status}`)}
          </div>
        </div>

        <button
          onClick={toggleStatus}
          disabled={loading}
          className={`w-full py-4 rounded-lg text-xl font-bold text-white transition transform hover:scale-105
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            ${status === 'IDLE' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'}
            shadow-lg`}
        >
          {loading ? t('waiter.updating') : (status === 'IDLE' ? t('waiter.setBusy') : t('waiter.setFree'))}
        </button>

        <div className="mt-8 text-left border-t pt-6">
          <h3 className="font-semibold text-gray-600 mb-3">{t('waiter.logs')}</h3>
          <div className="space-y-2 text-sm text-gray-500">
            {workLogs.slice(0, 3).map((log: any) => (
              <div key={log.id} className="flex justify-between">
                <span>{t('waiter.shiftStart')}</span>
                <span>{new Date(log.startTime).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
