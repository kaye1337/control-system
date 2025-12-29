'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth';

// --- Auth / User Management ---

export async function getSystemConfig(key: string) {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });
    return config?.value || null;
  } catch (error) {
    console.error(`Error getting config ${key}:`, error);
    return null;
  }
}

export async function setSystemConfig(key: string, value: string) {
  try {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { success: true };
  } catch (error) {
    console.error(`Error setting config ${key}:`, error);
    return { success: false };
  }
}

export async function updateBackgroundImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, message: '未选择文件' };

    // 1. Upload new image
    const newUrl = await uploadToStorage(file, `bg-${Date.now()}-${file.name}`);

    // 2. Get old image URL
    const oldUrl = await getSystemConfig('background_url');

    // 3. Delete old image if exists
    if (oldUrl) {
      await deleteFromStorage(oldUrl);
    }

    // 4. Update DB
    await setSystemConfig('background_url', newUrl);

    return { success: true, url: newUrl };
  } catch (error) {
    console.error('Update background error:', error);
    return { success: false, message: '更新背景失败' };
  }
}

export async function getAlbums() {
  try {
    const user = await getSession();
    if (!user) return { success: false, message: 'Not authenticated' };

    const albums = await prisma.album.findMany({
      where: { userId: user.id },
      include: {
        media: {
          take: 3, // Get first 3 images as "leaves"
          orderBy: { id: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, albums };
  } catch (error) {
    console.error('Get albums error:', error);
    return { success: false, albums: [] };
  }
}

export async function uploadBatchPhotos(formData: FormData) {
  try {
    const user = await getSession();
    if (!user) return { success: false, message: 'Not authenticated' };

    const files = formData.getAll('files') as File[];
    const albumName = formData.get('albumName') as string;
    
    if (!files || files.length === 0) return { success: false, message: '未选择照片' };
    if (!albumName) return { success: false, message: '请输入相册名称' };

    // 1. Find or Create Album
    let album = await prisma.album.findFirst({
      where: { 
        userId: user.id,
        name: albumName 
      }
    });

    if (!album) {
      album = await prisma.album.create({
        data: {
          name: albumName,
          userId: user.id
        }
      });
    }

    // 2. Upload Files and Create Media Records
    // Create a diary entry to link these uploads (optional but good for timeline)
    const entry = await prisma.diaryEntry.create({
      data: {
        content: `Uploaded ${files.length} photos to album "${albumName}"`,
        authorId: user.id,
        createdAt: new Date(),
      }
    });

    const uploadPromises = files.map(async (file) => {
      const url = await uploadToStorage(file, `album-${album!.id}-${Date.now()}-${file.name}`);
      return prisma.media.create({
        data: {
          url,
          type: file.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
          entryId: entry.id,
          albumId: album!.id
        }
      });
    });

    await Promise.all(uploadPromises);

    return { success: true };
  } catch (error) {
    console.error('Batch upload error:', error);
    return { success: false, message: '上传失败' };
  }
}

export async function getBackgroundImage() {
  const url = await getSystemConfig('background_url');
  // Default fallback if no custom background
  return url || 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop';
}

// 1. User Registration (Apply)
export async function registerUser(username: string, password: string, name: string) {
  try {
    if (username.length < 3 || username.length > 20) {
      return { success: false, message: '用户名必须在3到20个字符之间' };
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { success: false, message: '用户名已被占用' };
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

    return { success: true, message: '注册申请已发送，请等待管理员批准。', user };
  } catch (error) {
    console.error('Registration Error (注册错误):', error);
    return { success: false, message: '系统错误: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

// 2. Login
export async function loginUser(username: string, password: string) {
  try {
    console.log(`Attempting login for user (尝试登录用户): ${username}`);
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.log('User not found (用户未找到)');
      return { success: false, message: '用户名或密码错误' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Password mismatch (密码不匹配)');
      return { success: false, message: '用户名或密码错误' };
    }

    if (user.status !== 'APPROVED') {
      console.log(`User status (用户状态): ${user.status}`);
      return { success: false, message: `账号状态: ${user.status}。请联系管理员。` };
    }

    // Create session
    const session = await encrypt({ id: user.id, username: user.username, role: user.role });
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    cookies().set('session', session, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'lax', 
      path: '/',
      expires: expires
    });

    // Do not return password field
    const { password: _, ...safeUser } = user;
    return { success: true, user: safeUser };
  } catch (error) {
    console.error('Login Error (登录错误):', error);
    return { success: false, message: '登录失败: ' + (error instanceof Error ? error.message : String(error)) };
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
    return { success: false, message: '更新状态失败' };
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
    return { success: false, message: '发布日记失败' };
  }
}

// 7. Get Entries
export async function getDiaryEntries() {
  try {
    return await prisma.diaryEntry.findMany({
      include: {
        author: { select: { id: true, name: true } },
        media: true,
        comments: { include: { author: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

// 8. Delete Entry
export async function deleteDiaryEntry(entryId: string, userId: string) {
  try {
    const entry = await prisma.diaryEntry.findUnique({
      where: { id: entryId },
      include: { media: true }
    });

    if (!entry) return { success: false, message: '日记不存在' };

    // Check permissions: Admin or Author
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';
    const isAuthor = entry.authorId === userId;

    if (!isAdmin && !isAuthor) {
      return { success: false, message: '权限不足' };
    }

    // Delete media from Storage
    for (const m of entry.media) {
      await deleteFromStorage(m.url);
    }

    // Delete entry from DB (Cascades to Media and Comments)
    await prisma.diaryEntry.delete({ where: { id: entryId } });
    
    revalidatePath('/diary');
    return { success: true };
  } catch (error) {
    console.error('Delete Error:', error);
    return { success: false, message: '删除日记失败' };
  }
}

import { uploadToStorage, deleteFromStorage } from '@/lib/storage';

// 9. Upload File to Vercel Blob
export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, message: '未提供文件' };
    }

    const url = await uploadToStorage(file, file.name);
    const type = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';

    return { success: true, url, type };
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, message: '上传失败: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

// 10. Get All Media
export async function getAllMedia() {
  try {
    const media = await prisma.media.findMany({
      include: {
        entry: {
          select: {
            createdAt: true,
            author: { select: { name: true } }
          }
        }
      },
      orderBy: { entry: { createdAt: 'desc' } }
    });
    return { success: true, media };
  } catch (error) {
    return { success: false, media: [] };
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
    return { success: false, message: '添加评论失败' };
  }
}
