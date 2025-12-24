import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;

  // Verify session
  let user = null;
  if (session) {
    try {
      user = await decrypt(session);
    } catch (e) {
      // invalid session
    }
  }

  // Protect Admin Routes
  if (path.startsWith('/admin')) {
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect Diary Routes
  if (path.startsWith('/diary')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // If user is logged in and visits login page, redirect to dashboard
  if (path === '/' && user) {
     if (user.role === 'ADMIN') {
         return NextResponse.redirect(new URL('/admin', request.url));
     } else {
         return NextResponse.redirect(new URL('/diary', request.url));
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
