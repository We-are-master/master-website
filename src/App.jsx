import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Analytics } from '@vercel/analytics/react'

import HeaderFixfy from './components/fixfy/Header'
import FooterFixfy from './components/fixfy/Footer'
import HeaderB2B from './components/HeaderB2B'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import ExternalRedirect from './components/fixfy/ExternalRedirect'
import { SecurityHeaders } from './middleware/SecurityHeaders'

// Marketing pages
import Home from './pages/Home'
import Platform from './pages/Platform'
import ForFMs from './pages/ForFMs'
import ForOwners from './pages/ForOwners'
import ForTrades from './pages/ForTrades'
import Customers from './pages/Customers'
import Trust from './pages/Trust'
import Resources from './pages/Resources'
import About from './pages/About'
import Contact from './pages/Contact'
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
 *   marketing — rendered inside the Fixfy shell (navy background, Fixfy nav + footer)
 *   portal    — authenticated B2B portal (existing HeaderB2B + Footer)
 *   bare      — no chrome (partner application screens, etc.)
 */
const PORTAL_ROUTES = ['/dashboard', '/new-request', '/my-requests', '/settings']
const BARE_ROUTES   = ['/partner-apply', '/partner-apply/success', '/login', '/forgot-password']

function chromeFor(pathname) {
  if (pathname.startsWith('/request/')) return 'portal'
  if (PORTAL_ROUTES.includes(pathname)) return 'portal'
  if (BARE_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return 'bare'
  return 'marketing'
}

function AppContent() {
  const location = useLocation()
  const chrome = chromeFor(location.pathname)

  return (
    <div className={`App ${chrome === 'marketing' ? 'fx-shell' : ''}`}>
      <ScrollToTop />
      <SecurityHeaders />

      {chrome === 'marketing' && <HeaderFixfy />}
      {chrome === 'portal'    && <HeaderB2B />}

      <Routes>
        {/* Marketing */}
        <Route path="/"           element={<Home />} />
        <Route path="/platform"   element={<Platform />} />
        <Route path="/for-fms"    element={<ForFMs />} />
        <Route path="/for-owners" element={<ForOwners />} />
        <Route path="/for-trades" element={<ForTrades />} />
        <Route path="/customers"  element={<Customers />} />
        <Route path="/trust"      element={<Trust />} />
        <Route path="/resources"  element={<Resources />} />
        <Route path="/about"      element={<About />} />
        <Route path="/contact"    element={<Contact />} />
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
        <Route path="/booking"          element={<Navigate to="/" replace />} />
        <Route path="/cleaning-booking" element={<Navigate to="/" replace />} />
        <Route path="/carpentry-booking" element={<Navigate to="/" replace />} />
        <Route path="/painting-booking"  element={<Navigate to="/" replace />} />
        <Route path="/handyman-booking"  element={<Navigate to="/" replace />} />
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

      {chrome === 'marketing' && <FooterFixfy />}
      {chrome === 'portal'    && <Footer />}

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
