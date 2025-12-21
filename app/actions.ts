'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// --- Auth / User Management ---

// 1. Send Verification Code (Mock)
export async function sendVerificationCode(phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await prisma.verificationCode.create({
    data: { phone, code, expiresAt }
  });

  console.log(`[SMS MOCK] Code for ${phone}: ${code}`);
  return { success: true, message: 'Code sent (check console)' };
}

// 2. Register Customer
export async function registerCustomer(username: string, password: string, name: string) {
  try {
    // Validate username length
    if (username.length < 3 || username.length > 10) {
      return { success: false, message: 'Username must be between 3 and 10 characters' };
    }

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { success: false, message: 'Username already taken' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: 'CUSTOMER'
      }
    });

    return { success: true, user };
  } catch (error) {
    console.error('Registration Error:', error);
    return { success: false, message: 'System Error: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

// 3. Login Customer
export async function loginCustomer(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password) {
    return { success: false, message: 'Invalid credentials' };
  }

  // Check if user is actually a customer
  if (user.role !== 'CUSTOMER') {
     return { success: false, message: 'Not a customer account' };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { success: false, message: 'Invalid credentials' };
  }

  return { success: true, user };
}

// 4. Login Staff (Boss/Waiter)
export async function loginStaff(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password) {
    return { success: false, message: 'Invalid credentials' };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { success: false, message: 'Invalid credentials' };
  }

  return { success: true, user };
}

// 5. Create Waiter (Boss Only)
export async function createWaiter(bossId: string, username: string, password: string, name: string) {
  // Verify boss
  const boss = await prisma.user.findUnique({ where: { id: bossId } });
  if (!boss || boss.role !== 'BOSS') {
    return { success: false, message: 'Unauthorized' };
  }

  // Check username
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { success: false, message: 'Username taken' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      role: 'WAITER'
    }
  });

  await prisma.waiterProfile.create({
    data: { userId: user.id, status: 'IDLE' }
  });

  revalidatePath('/boss');
  return { success: true, user };
}

// --- Data Fetching ---

export async function getUserByRole(role: string) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      include: { waiterProfile: true }
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function ensureSeed() {
  const count = await prisma.user.count();
  if (count === 0) {
    const hashedPassword = await bcrypt.hash('boss123', 10);
    
    // Create Default Boss
    await prisma.user.create({ 
      data: { 
        name: 'Big Boss', 
        role: 'BOSS',
        username: 'boss',
        password: hashedPassword
      } 
    });

    console.log('Seeded default boss: boss / boss123');
  }
}

// --- Waiter Actions ---
export async function updateWaiterStatus(waiterProfileId: string, status: string) {
  await prisma.waiterProfile.update({
    where: { id: waiterProfileId },
    data: { status }
  });
  revalidatePath('/');
}

export async function getWaiters() {
  return await prisma.waiterProfile.findMany({
    include: { user: true, schedules: true }
  });
}

// --- Appointment Actions ---
export async function createAppointment(customerId: string, waiterId: string | undefined, startTime: Date, endTime: Date, message: string) {
  await prisma.appointment.create({
    data: {
      customerId,
      waiterId,
      startTime,
      endTime,
      message,
      status: 'PENDING'
    }
  });
  revalidatePath('/');
}

export async function updateAppointmentStatus(id: string, status: string) {
  await prisma.appointment.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/');
}

export async function getAppointments(role: string, userId: string) {
  if (role === 'BOSS') {
    return await prisma.appointment.findMany({
      include: { customer: true, waiter: true },
      orderBy: { createdAt: 'desc' }
    });
  } else if (role === 'CUSTOMER') {
    return await prisma.appointment.findMany({
      where: { customerId: userId },
      include: { waiter: true },
      orderBy: { createdAt: 'desc' }
    });
  }
  return [];
}

// --- Schedule Actions ---
export async function createSchedule(waiterProfileId: string, startTime: Date, endTime: Date) {
  await prisma.schedule.create({
    data: {
      waiterProfileId,
      startTime,
      endTime
    }
  });
  revalidatePath('/');
}

export async function getSchedules() {
  return await prisma.schedule.findMany({
    include: { waiterProfile: { include: { user: true } } }
  });
}
