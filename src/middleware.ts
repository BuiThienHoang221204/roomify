import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/constants/enums';

// Simple auth context interface
interface AuthContext {
  user_id: string; // Changed from number to string to support "user_1" format
  phone: string;
  role: UserRole;
}

// Parse auth header (simple implementation)
function getAuthContext(request: NextRequest): AuthContext | null {
  const authHeader = request.headers.get('x-user-id');
  const roleHeader = request.headers.get('x-user-role');
  const phoneHeader = request.headers.get('x-user-phone');

  if (!authHeader || !roleHeader) {
    return null;
  }

  return {
    user_id: authHeader,
    role: roleHeader as UserRole,
    phone: phoneHeader || '',
  };
}

export function isAuthenticated(request: NextRequest): boolean {
  return getAuthContext(request) !== null;
}

export function isAdmin(request: NextRequest): boolean {
  const auth = getAuthContext(request);
  return auth?.role === UserRole.ADMIN;
}

export function isTenant(request: NextRequest): boolean {
  const auth = getAuthContext(request);
  return auth?.role === UserRole.TENANT;
}

// Get current user ID
export function getCurrentUserId(request: NextRequest): string | null {
  const auth = getAuthContext(request);
  return auth?.user_id || null;
}

// Middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/api/users/login', '/api/webhooks', '/api/tables'];
  
  // Special case: Allow POST to /api/users (user creation)
  const isUserCreation = pathname === '/api/users' && request.method === 'POST';

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route)) || isUserCreation;

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (pathname.startsWith('/api/')) {
    const auth = getAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin-only routes
    const adminRoutes = ['/api/rooms', '/api/rentals'];
    const isAdminRoute = adminRoutes.some(
      (route) => pathname.startsWith(route) && request.method !== 'GET'
    );

    if (isAdminRoute && auth.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
