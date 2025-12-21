import prisma from '@/lib/prisma';
import WaiterClient from './WaiterClient';

export default async function WaiterPage({ searchParams }: { searchParams: { id: string } }) {
  const waiterUserId = searchParams.id;
  if (!waiterUserId) return <div>Invalid Waiter ID</div>;

  const waiterProfile = await prisma.waiterProfile.findUnique({
    where: { userId: waiterUserId },
    include: { user: true, workLogs: true }
  });

  if (!waiterProfile) return <div>Waiter Profile Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <WaiterClient waiterProfile={waiterProfile} />
    </div>
  );
}
