import { useEffect } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

type RouteMetadata = {
  path: string
  title: string
  description: string
  canonicalPath?: string
  robots?: string
}

const defaultMetadata = {
  title: 'Softlearn',
  description:
    'Softlearn helps students grow practical job readiness and gives companies a structured hiring and learning workspace.',
  canonicalPath: '/',
  robots: 'index,follow',
}

const routeMetadata: RouteMetadata[] = [
  {
    path: '/',
    title: 'Softlearn',
    description:
      'Softlearn connects learning, job matching, and hiring workflows for students and companies in one platform.',
    canonicalPath: '/',
    robots: 'index,follow',
  },
  {
    path: '/login',
    title: 'Log in',
    description: 'Access your Softlearn workspace to continue learning, review hiring activity, and manage your account.',
    canonicalPath: '/login',
    robots: 'noindex,nofollow',
  },
  {
    path: '/signup',
    title: 'Sign up',
    description: 'Create a Softlearn account to start learning, discover jobs, and collaborate with hiring teams.',
    canonicalPath: '/signup',
    robots: 'noindex,nofollow',
  },
  {
    path: '/forgot-password',
    title: 'Forgot password',
    description: 'Request a password reset email for your Softlearn account.',
    canonicalPath: '/forgot-password',
    robots: 'noindex,nofollow',
  },
  {
    path: '/reset-password',
    title: 'Reset password',
    description: 'Choose a new password for your Softlearn account.',
    canonicalPath: '/reset-password',
    robots: 'noindex,nofollow',
  },
  {
    path: '/unauthorized',
    title: 'Access denied',
    description: 'This Softlearn page is restricted to users with the required account permissions.',
    canonicalPath: '/unauthorized',
    robots: 'noindex,nofollow',
  },
]

function resolveMetadata(pathname: string) {
  const match = routeMetadata.find((route) => matchPath({ path: route.path, end: true }, pathname))
  if (match) {
    return {
      ...match,
      title: `${match.title} | Softlearn`,
    }
  }

  return {
    ...defaultMetadata,
    title: pathname.startsWith('/student') || pathname.startsWith('/company') || pathname.startsWith('/admin')
      ? 'Workspace | Softlearn'
      : 'Softlearn',
    robots:
      pathname.startsWith('/student') || pathname.startsWith('/company') || pathname.startsWith('/admin')
        ? 'noindex,nofollow'
        : defaultMetadata.robots,
    description:
      pathname.startsWith('/student') || pathname.startsWith('/company') || pathname.startsWith('/admin')
        ? 'Softlearn workspace content is only available to authenticated users with the appropriate role.'
        : defaultMetadata.description,
    canonicalPath: pathname,
  }
}

function upsertMetaTag(selector: string, attributes: Record<string, string>, content: string) {
  const existing = document.head.querySelector<HTMLMetaElement>(selector)
  const metaTag = existing ?? document.createElement('meta')

  Object.entries(attributes).forEach(([key, value]) => {
    metaTag.setAttribute(key, value)
  })
  metaTag.setAttribute('content', content)

  if (!existing) {
    document.head.appendChild(metaTag)
  }
}

function upsertCanonicalLink(href: string) {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const canonicalLink = existing ?? document.createElement('link')
  canonicalLink.setAttribute('rel', 'canonical')
  canonicalLink.setAttribute('href', href)

  if (!existing) {
    document.head.appendChild(canonicalLink)
  }
}

export function PageTitle() {
  const location = useLocation()

  useEffect(() => {
    const metadata = resolveMetadata(location.pathname)
    const canonicalUrl = new URL(metadata.canonicalPath ?? location.pathname, window.location.origin).toString()

    document.title = metadata.title
    upsertMetaTag('meta[name="description"]', { name: 'description' }, metadata.description)
    upsertMetaTag('meta[property="og:title"]', { property: 'og:title' }, metadata.title)
    upsertMetaTag('meta[property="og:description"]', { property: 'og:description' }, metadata.description)
    upsertMetaTag('meta[property="og:type"]', { property: 'og:type' }, 'website')
    upsertMetaTag('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
    upsertMetaTag('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image')
    upsertMetaTag('meta[name="robots"]', { name: 'robots' }, metadata.robots ?? defaultMetadata.robots)
    upsertCanonicalLink(canonicalUrl)
  }, [location.pathname])

  return null
}
