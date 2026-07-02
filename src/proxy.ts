import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { ADMIN_ROL } from '@/lib/auth-admin'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('session')?.value

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const payload = await decrypt(session)
    if (!payload || payload.rol !== ADMIN_ROL) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
