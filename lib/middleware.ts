import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const res = NextResponse.next()

  if (host.startsWith('blog.')) {
    res.headers.set('x-site', 'blog')
  } else {
    res.headers.set('x-site', 'main')
  }

  return res
}
