import prisma from '@/lib/prisma';
import BossClient from './BossClient';

export default async function BossPage({ searchParams }: { searchParams: { id: string } }) {
  const bossId = searchParams.id;
  if (!bossId) return <div>Invalid Boss ID</div>;

  const appointments = await prisma.appointment.findMany({
    include: { customer: true, waiter: true },
    orderBy: { createdAt: 'desc' }
  });

  const waiters = await prisma.waiterProfile.findMany({
    include: { user: true, schedules: true, workLogs: true }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <BossClient 
        bossId={bossId} 
        initialAppointments={appointments} 
        initialWaiters={waiters} 
      />
    </div>
  );
}
