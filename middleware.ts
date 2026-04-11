import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const auth = request.headers.get('authorization')

  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD

  if (!username || !password) {
    return new NextResponse('Admin auth is not configured', { status: 500 })
  }

  if (!auth) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  const [scheme, encoded] = auth.split(' ')

  if (scheme !== 'Basic' || !encoded) {
    return new NextResponse('Invalid authentication', { status: 401 })
  }

  const decoded = atob(encoded)
  const [user, pass] = decoded.split(':')

  if (user === username && pass === password) {
    return NextResponse.next()
  }

  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}