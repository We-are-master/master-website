import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Analytics } from '@vercel/analytics/react'
import HeaderB2B from './components/HeaderB2B'
import HeaderB2C from './components/b2c/HeaderB2C'
import FooterB2C from './components/b2c/FooterB2C'
import CookieConsent from './components/CookieConsent'
import { SecurityHeaders } from './middleware/SecurityHeaders'
import { SEO } from './components/SEO'
import Hero from './components/Hero'
import Services from './components/Services'
import Features from './components/Features'
import Process from './components/Process'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import Contact from './pages/Contact'
import About from './pages/About'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import RequestDetails from './pages/RequestDetails'
import MyRequests from './pages/MyRequests'
import Settings from './pages/Settings'
import B2CHome from './pages/B2CHome'
import B2CBooking from './pages/B2CBooking'
import B2CCheckout from './pages/B2CCheckout'
import B2CCleaningBooking from './pages/B2CCleaningBooking'
import B2CCarpentryBooking from './pages/B2CCarpentryBooking'
import B2CPaintingBooking from './pages/B2CPaintingBooking'
import B2CHandymanBooking from './pages/B2CHandymanBooking'
import B2CLogin from './pages/B2CLogin'
import B2CMyOrders from './pages/B2CMyOrders'
import CheckoutSuccess from './pages/CheckoutSuccess'
import LP from './pages/LP'
import QuoteRequestNextSteps from './pages/QuoteRequestNextSteps'
import PartnerApply from './pages/PartnerApply'
import PartnerApplySuccess from './pages/PartnerApplySuccess'

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  // B2C is now the default homepage
  // B2B routes: /b2b, /dashboard, /login, /forgot-password, /new-request, /request/*, /my-requests, /settings
  // Note: /about and /contact now use B2C layout (same as home)
  const b2bRoutes = ['/b2b', '/dashboard', '/login', '/forgot-password', '/new-request', '/my-requests', '/settings'];
  const isB2BRoute = b2bRoutes.some(route => location.pathname === route) || 
                     location.pathname.startsWith('/request/');
  const isLP = location.pathname === '/lp';
  const isRequestReceived = location.pathname === '/request-received';
  const isPartnerApply = location.pathname === '/partner-apply' || location.pathname === '/partner-apply/success';
  const isB2C = !isB2BRoute && !isLP && !isRequestReceived && !isPartnerApply;

  return (
    <div className="App">
      <ScrollToTop />
      <SecurityHeaders />
      {!isLP && !isRequestReceived && !isPartnerApply && (isB2C ? <HeaderB2C /> : <HeaderB2B />)}
      <Routes>
        {/* B2C Routes - Rotas principais com layout B2C (HeaderB2C + FooterB2C) */}
        <Route path="/" element={<B2CHome />} />
        <Route path="/b2c" element={<B2CHome />} />
        <Route path="/booking" element={<B2CBooking />} />
        <Route path="/cleaning-booking" element={<B2CCleaningBooking />} />
        <Route path="/carpentry-booking" element={<B2CCarpentryBooking />} />
        <Route path="/painting-booking" element={<B2CPaintingBooking />} />
        <Route path="/handyman-booking" element={<B2CHandymanBooking />} />
        <Route path="/checkout" element={<B2CCheckout />} />
        <Route path="/checkout-success" element={<CheckoutSuccess />} />
        <Route path="/customer-login" element={<B2CLogin />} />
        <Route path="/my-orders" element={<B2CMyOrders />} />
        <Route path="/lp" element={<LP />} />
        <Route path="/request-received" element={<QuoteRequestNextSteps />} />
        <Route path="/partner-apply" element={<PartnerApply />} />
        <Route path="/partner-apply/success" element={<PartnerApplySuccess />} />

        {/* B2B Routes - Moved to /b2b path */}
        <Route path="/b2b" element={
          <>
            <SEO 
              title="B2B Property Maintenance Services - Master Services"
              description="Enterprise property maintenance solutions for businesses. Streamlined operations, technology-driven matching, and exceptional service standards. Trusted by 500+ businesses."
              keywords="B2B property maintenance, business maintenance services, enterprise maintenance solutions, commercial property management"
            />
            <Hero />
            <Services />
            <Features />
            <Process />
            <Testimonials />
            <FAQ />
          </>
        } />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-request" element={<NewRequest />} />
        <Route path="/request/:id" element={<RequestDetails />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {!isLP && !isRequestReceived && !isPartnerApply && (isB2C ? (location.pathname === '/checkout' ? null : <FooterB2C />) : <Footer />)}
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
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
