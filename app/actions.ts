'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth';

// --- Auth / User Management ---

// 1. Register Request
export async function registerUser(username: string, password: string, name: string) {
  try {
    if (username.length < 3 || username.length > 20) {
      return { success: false, message: 'Username must be between 3 and 20 characters' };
    }

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
        role: 'MEMBER',
        status: 'PENDING'
      }
    });

    return { success: true, message: 'Registration request sent. Please wait for admin approval.', user };
  } catch (error) {
    console.error('Registration Error (注册错误):', error);
    return { success: false, message: 'System Error: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

// 2. Login
export async function loginUser(username: string, password: string) {
  try {
    console.log(`Attempting login for user (尝试登录用户): ${username}`);
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.log('User not found (用户未找到)');
      return { success: false, message: 'Invalid credentials' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch (密码不匹配)');
      return { success: false, message: 'Invalid credentials' };
    }

    if (user.status !== 'APPROVED') {
      console.log(`User status (用户状态): ${user.status}`);
      return { success: false, message: `Account is ${user.status}. Please contact admin.` };
    }

    // Create session
    const session = await encrypt({ id: user.id, username: user.username, role: user.role });
    cookies().set('session', session, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });

    // Do not return password field
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  } catch (error) {
    console.error('Login Error (登录错误):', error);
    return { success: false, message: 'Login failed: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

export async function logoutUser() {
  cookies().delete('session');
  return { success: true };
}

// 3. Admin: Get Pending Users
export async function getPendingUsers() {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, users };
  } catch (error) {
    console.error('Get Pending Users Error:', error);
    return { success: false, users: [] };
  }
}

export async function approveUser(userId: string) {
  return updateUserStatus(userId, 'APPROVED');
}

export async function rejectUser(userId: string) {
  return updateUserStatus(userId, 'REJECTED');
}

// 4. Admin: Approve/Reject User
export async function updateUserStatus(userId: string, status: 'APPROVED' | 'REJECTED') {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to update status' };
  }
}

// 5. Seed Admin
export async function ensureSeed() {
  const count = await prisma.user.count();
  if (count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({ 
      data: { 
        name: 'Family Admin', 
        role: 'ADMIN',
        status: 'APPROVED',
        username: 'admin',
        password: hashedPassword
      } 
    });

    console.log('Seeded default admin (已创建默认管理员): admin / admin123');
  }
}

// --- Diary Management ---

// 6. Create Entry
export async function createDiaryEntry(authorId: string, content: string, mediaUrls: { url: string, type: 'IMAGE' | 'VIDEO' }[]) {
  try {
    const entry = await prisma.diaryEntry.create({
      data: {
        content,
        authorId,
        media: {
          create: mediaUrls.map(m => ({ url: m.url, type: m.type }))
        }
      }
    });
    revalidatePath('/diary');
    return { success: true, entry };
  } catch (error) {
    console.error('Create Entry Error:', error);
    return { success: false, message: 'Failed to create entry' };
  }
}

// 7. Get Entries
export async function getDiaryEntries() {
  try {
    return await prisma.diaryEntry.findMany({
      include: {
        author: { select: { name: true } },
        media: true,
        comments: { include: { author: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

// 8. Add Comment
export async function addComment(entryId: string, authorId: string, content: string) {
  try {
    await prisma.comment.create({
      data: {
        entryId,
        authorId,
        content
      }
    });
    revalidatePath('/diary');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to add comment' };
  }
}
