import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnLogin = req.nextUrl.pathname.startsWith('/login')

  // Protect dashboard — redirect to login if not authenticated
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Already logged in — redirect away from login page
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard/personal', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}
