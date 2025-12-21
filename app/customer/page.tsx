import prisma from '@/lib/prisma';
import CustomerClient from './CustomerClient';

export default async function CustomerPage({ searchParams }: { searchParams: { id: string } }) {
  const customerId = searchParams.id;
  if (!customerId) return <div>Invalid Customer ID</div>;

  const myAppointments = await prisma.appointment.findMany({
    where: { customerId },
    include: { waiter: true },
    orderBy: { createdAt: 'desc' }
  });

  const waiters = await prisma.waiterProfile.findMany({
    include: { user: true, schedules: true }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerClient 
        customerId={customerId} 
        initialAppointments={myAppointments} 
        initialWaiters={waiters} 
      />
    </div>
  );
}
