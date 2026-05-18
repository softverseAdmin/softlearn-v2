import { Route } from 'react-router-dom'

import { loadableNamed } from '@/router/loadable'

const LandingPage = loadableNamed(() => import('@/pages/LandingPage'), 'LandingPage')
const LoginPage = loadableNamed(() => import('@/pages/LoginPage'), 'LoginPage')
const SignupPage = loadableNamed(() => import('@/pages/SignupPage'), 'SignupPage')

export function renderPublicRoutes() {
  return (
    <>
      <Route index element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </>
  )
}
