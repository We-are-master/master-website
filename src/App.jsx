import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Analytics } from '@vercel/analytics/react'

import FixfyV2Nav from './components/fixfy-v2/FixfyV2Nav'
import FixfyV2Footer from './components/fixfy-v2/FixfyV2Footer'
import GetInTouchModal from './components/fixfy-v2/GetInTouchModal'
import HeaderB2B from './components/HeaderB2B'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import ExternalRedirect from './components/fixfy/ExternalRedirect'
import { SecurityHeaders } from './middleware/SecurityHeaders'

// B2C — end of tenancy (página principal). Reserva e páginas de serviço sob demanda.
import B2CHome from './b2c/pages/HomePage.jsx'
const B2CService = lazy(() => import('./b2c/pages/ServicePage.jsx'))
const B2CBook = lazy(() => import('./b2c/pages/BookPage.jsx'))
const B2CConfirmed = lazy(() => import('./b2c/pages/ConfirmedPage.jsx'))
const B2CCookies = lazy(() => import('./b2c/pages/CookiesPage.jsx'))
const B2CTerms = lazy(() => import('./b2c/pages/TermsPage.jsx'))
const B2CGuarantee = lazy(() => import('./b2c/pages/GuaranteePage.jsx'))
const B2CPrivacy = lazy(() => import('./b2c/pages/PrivacyPage.jsx'))

// Marketing — Fixfy Design System website v2 (static HTML modules + CSS)
import {
  HomeV2,
  FixfyProV2,
  PlatformV2,
  SolutionRealEstateV2,
  SolutionFranchisesV2,
  SolutionEnterpriseV2,
  SolutionServicePlatformsV2,
  AboutV2,
  ContactV2,
  CareersStubV2,
  SecurityStubV2,
  DpaStubV2,
} from './pages/fixfySiteV2Pages.jsx'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import PartnerApply from './pages/PartnerApply'
import PartnerApplySuccess from './pages/PartnerApplySuccess'

// Portal pages — still hosted here until migration to portal.getfixfy.com is complete
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import RequestDetails from './pages/RequestDetails'
import MyRequests from './pages/MyRequests'
import Settings from './pages/Settings'

const PORTAL_URL = 'https://portal.getfixfy.com'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/**
 * Route buckets:
 *   marketing — Fixfy website v2 shell (nav + footer, data-tone backgrounds)
 *   portal    — authenticated B2B portal (existing HeaderB2B + Footer)
 *   bare      — no chrome (partner application screens, etc.)
 */
const PORTAL_ROUTES = ['/dashboard', '/new-request', '/my-requests', '/settings']
const B2C_ROUTES    = ['/', '/end-of-tenancy-cleaning', '/deep-cleaning', '/after-builders-cleaning', '/painting', '/repairs', '/landlord-certificates', '/book', '/book/confirmed', '/cookies', '/terms', '/privacy', '/guarantee']
const BARE_ROUTES   = ['/partner-apply', '/partner-apply/success', '/login', '/forgot-password']

function chromeFor(pathname) {
  if (B2C_ROUTES.includes(pathname)) return 'b2c'
  if (pathname.startsWith('/request/')) return 'portal'
  if (PORTAL_ROUTES.includes(pathname)) return 'portal'
  if (BARE_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return 'bare'
  return 'marketing'
}

function AppContent() {
  const location = useLocation()
  const chrome = chromeFor(location.pathname)

  return (
    <div className={`App${chrome === 'marketing' ? ' fixfy-site-v2-app' : ''}`}>
      <ScrollToTop />
      <SecurityHeaders />

      {chrome === 'marketing' && <FixfyV2Nav />}
      {chrome === 'portal'    && <HeaderB2B />}

      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#fff' }} />}>
      <Routes>
        {/* B2C — end of tenancy (main area) */}
        <Route path="/" element={<B2CHome />} />
        <Route path="/end-of-tenancy-cleaning" element={<B2CService service="clean" />} />
        <Route path="/deep-cleaning" element={<B2CService service="clean" kind="deep" />} />
        <Route path="/after-builders-cleaning" element={<B2CService service="clean" kind="after" />} />
        <Route path="/painting" element={<B2CService service="paint" />} />
        <Route path="/repairs" element={<B2CService service="fix" />} />
        <Route path="/landlord-certificates" element={<B2CService service="cert" />} />
        <Route path="/book" element={<B2CBook />} />
        <Route path="/book/confirmed" element={<B2CConfirmed />} />
        <Route path="/cookies" element={<B2CCookies />} />

        {/* Marketing — website v2 (B2B home moved from / to /business) */}
        <Route path="/business" element={<HomeV2 />} />
        <Route path="/fixfypro" element={<FixfyProV2 />} />
        <Route path="/platform" element={<PlatformV2 />} />
        <Route path="/solutions/real-estate" element={<SolutionRealEstateV2 />} />
        <Route path="/solutions/franchises" element={<SolutionFranchisesV2 />} />
        <Route path="/solutions/enterprise-operations" element={<SolutionEnterpriseV2 />} />
        <Route path="/solutions/service-platforms" element={<SolutionServicePlatformsV2 />} />
        <Route path="/about" element={<AboutV2 />} />
        <Route path="/contact" element={<ContactV2 />} />
        <Route path="/careers" element={<CareersStubV2 />} />
        <Route path="/privacy" element={<B2CPrivacy />} />
        <Route path="/terms" element={<B2CTerms />} />
        <Route path="/guarantee" element={<B2CGuarantee />} />
        {/* Endereços antigos das páginas legais (rodapé antigo e banner de cookies) */}
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/legal/privacy" element={<Navigate to="/privacy" replace />} />
        <Route path="/legal/terms" element={<Navigate to="/terms" replace />} />
        <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
        <Route path="/cookie-policy" element={<Navigate to="/cookies" replace />} />
        <Route path="/security" element={<SecurityStubV2 />} />
        <Route path="/dpa" element={<DpaStubV2 />} />
        <Route path="/fixfypro/start" element={<ExternalRedirect to="https://partners.getfixfy.com/get-started" />} />
        <Route path="/fixfypro/demo" element={<Navigate to="/contact" replace />} />
        <Route path="/network" element={<ExternalRedirect to="/network/index.html" />} />
        <Route path="/partners" element={<Navigate to="/network" replace />} />
        <Route path="/growth" element={<ExternalRedirect to="/growth/index.html" />} />

        {/* Legacy marketing URLs */}
        <Route path="/for-fms" element={<Navigate to="/solutions/real-estate" replace />} />
        <Route path="/for-owners" element={<Navigate to="/solutions/real-estate" replace />} />
        <Route path="/for-trades" element={<Navigate to="/network" replace />} />
        <Route path="/customers" element={<Navigate to="/contact" replace />} />
        <Route path="/trust" element={<Navigate to="/contact" replace />} />
        <Route path="/resources" element={<Navigate to="/contact" replace />} />
        <Route path="/blog"       element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Partner application (kept, bare chrome) */}
        <Route path="/partner-apply"         element={<PartnerApply />} />
        <Route path="/partner-apply/success" element={<PartnerApplySuccess />} />

        {/* Portal — B2B authenticated (still here until portal.getfixfy.com migration) */}
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/new-request"     element={<NewRequest />} />
        <Route path="/request/:id"     element={<RequestDetails />} />
        <Route path="/my-requests"     element={<MyRequests />} />
        <Route path="/settings"        element={<Settings />} />

        {/* Login moved to portal.getfixfy.com — redirect on the client */}
        <Route path="/login"           element={<ExternalRedirect to={PORTAL_URL} />} />
        <Route path="/forgot-password" element={<ExternalRedirect to={`${PORTAL_URL}/forgot-password`} />} />

        {/* Legacy B2C routes — redirect to home (B2C flow is archived) */}
        <Route path="/b2b"              element={<Navigate to="/" replace />} />
        <Route path="/b2c"              element={<Navigate to="/" replace />} />
        <Route path="/booking"          element={<Navigate to="/book" replace />} />
        <Route path="/cleaning-booking" element={<Navigate to="/end-of-tenancy-cleaning" replace />} />
        <Route path="/carpentry-booking" element={<Navigate to="/" replace />} />
        <Route path="/painting-booking"  element={<Navigate to="/painting" replace />} />
        <Route path="/handyman-booking"  element={<Navigate to="/repairs" replace />} />
        <Route path="/checkout"          element={<Navigate to="/" replace />} />
        <Route path="/checkout-success"  element={<Navigate to="/" replace />} />
        <Route path="/customer-login"    element={<ExternalRedirect to={PORTAL_URL} />} />
        <Route path="/my-orders"         element={<Navigate to="/my-requests" replace />} />
        <Route path="/lp"                element={<Navigate to="/" replace />} />
        <Route path="/request-received"  element={<Navigate to="/contact" replace />} />
        <Route path="/c/:code"           element={<Navigate to="/" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      {chrome === 'marketing' && <FixfyV2Footer />}
      {chrome === 'portal'    && <Footer />}

      {chrome === 'marketing' && <GetInTouchModal />}

      <CookieConsent />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Analytics />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}
