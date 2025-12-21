'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { updateAppointmentStatus, updateWaiterStatus, createSchedule, createWaiter } from '../actions';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function BossClient({ bossId, initialAppointments, initialWaiters }: any) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('requests');

  // Add Waiter Modal State
  const [showAddWaiter, setShowAddWaiter] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [newWaiterUsername, setNewWaiterUsername] = useState('');
  const [newWaiterPassword, setNewWaiterPassword] = useState('');
  const [addWaiterMsg, setAddWaiterMsg] = useState('');

  // Handlers
  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateAppointmentStatus(id, newStatus);
    router.refresh();
  };

  const handleWaiterStatus = async (id: string, newStatus: string) => {
    await updateWaiterStatus(id, newStatus);
    router.refresh();
  };

  const handleDateSelect = async (selectInfo: any) => {
    const waiterId = prompt(t('boss.promptAssign'));
    if (waiterId) {
      // Find profile id
      const waiter = initialWaiters.find((w: any) => w.user.id === waiterId || w.user.name === waiterId);
      if (waiter) {
        await createSchedule(waiter.id, selectInfo.start, selectInfo.end);
        router.refresh();
      } else {
        alert(t('boss.waiterNotFound'));
      }
    }
  };

  const handleCreateWaiter = async () => {
    if (!newWaiterName || !newWaiterUsername || !newWaiterPassword) {
      setAddWaiterMsg('All fields required');
      return;
    }
    const res = await createWaiter(bossId, newWaiterUsername, newWaiterPassword, newWaiterName);
    if (res.success) {
      setAddWaiterMsg('');
      setShowAddWaiter(false);
      setNewWaiterName('');
      setNewWaiterUsername('');
      setNewWaiterPassword('');
      router.refresh();
    } else {
      setAddWaiterMsg(res.message || 'Error');
    }
  };

  const handleLogout = () => {
    router.push('/');
  };

  // Prepare events for calendar
  const events = initialWaiters.flatMap((w: any) => 
    w.schedules.map((s: any) => ({
      id: s.id,
      title: w.user.name,
      start: s.startTime,
      end: s.endTime,
      backgroundColor: w.status === 'BUSY' ? 'red' : 'green'
    }))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('boss.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="space-x-4">
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              {t('boss.tabRequests')}
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
            >
              {t('boss.tabSchedule')}
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('boss.requestsTitle')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('boss.colCustomer')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('boss.colWaiter')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('boss.colTime')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('boss.colMessage')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('boss.colStatus')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('boss.colActions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initialAppointments.map((app: any) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{app.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.waiter?.name || t('boss.any')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(app.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{app.message}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                          app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {t(`common.status.${app.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatusChange(app.id, 'APPROVED')} className="text-green-600 hover:text-green-900">{t('boss.approve')}</button>
                          <button onClick={() => handleStatusChange(app.id, 'REJECTED')} className="text-red-600 hover:text-red-900">{t('boss.reject')}</button>
                        </>
                      )}
                      <button className="text-blue-600 hover:text-blue-900 ml-2">{t('boss.chat')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('boss.staffTitle')}</h2>
                <button 
                  onClick={() => setShowAddWaiter(true)}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                >
                  {t('boss.addWaiter')}
                </button>
              </div>
              
              <div className="space-y-4">
                {initialWaiters.map((w: any) => (
                  <div key={w.id} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{w.user.name}</p>
                      <p className="text-sm text-gray-500">{t('boss.id')}: {w.user.id}</p>
                      <p className={`text-sm ${w.status === 'BUSY' ? 'text-red-500' : 'text-green-500'}`}>
                        {t('boss.status')}: {t(`common.status.${w.status}`)}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleWaiterStatus(w.id, 'IDLE')} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{t('boss.setIdle')}</button>
                      <button onClick={() => handleWaiterStatus(w.id, 'BUSY')} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">{t('boss.setBusy')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('boss.logsTitle')}</h2>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">{t('boss.logsName')}</th>
                    <th className="text-left">{t('boss.logsStart')}</th>
                  </tr>
                </thead>
                <tbody>
                  {initialWaiters.flatMap((w: any) => w.workLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td>{w.user.name}</td>
                      <td>{new Date(log.startTime).toLocaleString()}</td>
                    </tr>
                  ))).slice(0, 5)} 
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('boss.scheduleTitle')}</h2>
            <div className="h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridDay"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridDay,timeGridWeek'
                }}
                selectable={true}
                select={handleDateSelect}
                events={events}
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Waiter Modal */}
      {showAddWaiter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">{t('boss.modalAddWaiter')}</h3>
            {addWaiterMsg && <p className="text-red-500 text-sm mb-2">{addWaiterMsg}</p>}
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">{t('auth.name')}</label>
                <input 
                  className="w-full border rounded p-2"
                  value={newWaiterName}
                  onChange={e => setNewWaiterName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">{t('auth.username')}</label>
                <input 
                  className="w-full border rounded p-2"
                  value={newWaiterUsername}
                  onChange={e => setNewWaiterUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">{t('auth.password')}</label>
                <input 
                  type="password"
                  className="w-full border rounded p-2"
                  value={newWaiterPassword}
                  onChange={e => setNewWaiterPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button 
                onClick={() => setShowAddWaiter(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                {t('customer.cancel')}
              </button>
              <button 
                onClick={handleCreateWaiter}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('boss.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
