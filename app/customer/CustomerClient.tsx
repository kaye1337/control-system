'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createAppointment, updateAppointmentStatus } from '../actions';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';

export default function CustomerClient({ customerId, initialAppointments, initialWaiters }: any) {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedWaiter, setSelectedWaiter] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<{start: Date, end: Date} | null>(null);

  const handleDateSelect = (selectInfo: any) => {
    setBookingTime({ start: selectInfo.start, end: selectInfo.end });
    // Open modal or form
  };

  const handleBook = async (e: any) => {
    e.preventDefault();
    if (!bookingTime) return;
    const formData = new FormData(e.target);
    const message = formData.get('message') as string;
    const waiterId = formData.get('waiterId') as string;

    await createAppointment(customerId, waiterId || undefined, bookingTime.start, bookingTime.end, message);
    setBookingTime(null);
    alert(t('customer.requestSent'));
    router.refresh();
    setActiveTab('requests');
  };

  const handleCancel = async (id: string) => {
    if (confirm(t('customer.confirmWithdraw'))) {
      await updateAppointmentStatus(id, 'CANCELLED');
      router.refresh();
    }
  };

  const events = initialWaiters.flatMap((w: any) => 
    w.schedules.map((s: any) => ({
      title: `${w.user.name} (Shift)`,
      start: s.startTime,
      end: s.endTime,
      backgroundColor: 'gray',
      display: 'background'
    }))
  );

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('customer.title')}</h1>
        <div className="flex items-center gap-4">
          <div className="space-x-4">
            <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 rounded ${activeTab === 'browse' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}>{t('customer.tabBrowse')}</button>
            <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 rounded ${activeTab === 'requests' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'}`}>{t('customer.tabRequests')}</button>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold">{t('customer.waitersStatus')}</h2>
            {initialWaiters.map((w: any) => (
              <div key={w.id} className={`p-4 rounded border ${w.status === 'IDLE' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="font-bold">{w.user.name}</p>
                <p className={`text-sm ${w.status === 'IDLE' ? 'text-green-600' : 'text-red-600'}`}>
                  {w.status === 'IDLE' ? t('customer.freeIdle') : t('customer.busy')}
                </p>
                {w.status === 'IDLE' && (
                  <button 
                    onClick={() => { setSelectedWaiter(w.user.id); alert(t('customer.selectAlert')); }}
                    className="mt-2 w-full bg-green-600 text-white text-xs py-1 rounded"
                  >
                    {t('customer.select')}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
             <h2 className="text-xl font-semibold mb-4">{t('customer.scheduleTitle')}</h2>
             <p className="text-sm text-gray-500 mb-2">{t('customer.scheduleHint')}</p>
             <div className="h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                selectable={true}
                select={handleDateSelect}
                events={events}
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {bookingTime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">{t('customer.modalTitle')}</h3>
            <form onSubmit={handleBook}>
              <div className="mb-4">
                <label className="block text-sm font-medium">{t('customer.time')}</label>
                <p>{bookingTime.start.toLocaleString()} - {bookingTime.end.toLocaleTimeString()}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">{t('customer.waiter')}</label>
                <select name="waiterId" defaultValue={selectedWaiter} className="w-full border rounded p-2">
                  <option value="">{t('customer.anyFree')}</option>
                  {initialWaiters.map((w: any) => (
                    <option key={w.user.id} value={w.user.id}>{w.user.name} ({w.status})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">{t('customer.message')}</label>
                <textarea name="message" required className="w-full border rounded p-2" placeholder={t('customer.messagePlaceholder')}></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setBookingTime(null)} className="px-4 py-2 text-gray-600">{t('customer.cancel')}</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">{t('customer.submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('customer.tabRequests')}</h2>
          <div className="space-y-4">
            {initialAppointments.map((app: any) => (
              <div key={app.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <p className="font-bold">{new Date(app.startTime).toLocaleString()}</p>
                  <p>{t('customer.waiter')}: {app.waiter?.name || t('customer.pendingAssignment')}</p>
                  <p className="text-sm text-gray-500">{app.message}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2
                    ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {t(`common.status.${app.status}`)}
                  </span>
                  {app.status === 'PENDING' && (
                    <button onClick={() => handleCancel(app.id)} className="block text-red-600 text-sm hover:underline">{t('customer.withdraw')}</button>
                  )}
                </div>
              </div>
            ))}
            {initialAppointments.length === 0 && <p className="text-gray-500">{t('customer.noRequests')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
