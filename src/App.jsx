import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import HeaderB2C from './components/b2c/HeaderB2C'
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

function AppContent() {
  const location = useLocation();
  // B2C is now the default homepage
  // B2B routes: /b2b, /dashboard, /login, /forgot-password, /new-request, /request/*, /my-requests, /settings, /contact, /about
  const b2bRoutes = ['/b2b', '/dashboard', '/login', '/forgot-password', '/new-request', '/my-requests', '/settings', '/contact', '/about'];
  const isB2BRoute = b2bRoutes.some(route => location.pathname === route) || 
                     location.pathname.startsWith('/request/');
  const isB2C = !isB2BRoute;

  return (
    <div className="App">
      {isB2C ? <HeaderB2C /> : <Header />}
      <Routes>
        {/* B2C Routes - Now the default homepage */}
        <Route path="/" element={<B2CHome />} />
        <Route path="/b2c" element={<B2CHome />} />
        <Route path="/booking" element={<B2CBooking />} />
        <Route path="/b2c/booking" element={<B2CBooking />} />
        <Route path="/cleaning-booking" element={<B2CCleaningBooking />} />
        <Route path="/b2c/cleaning-booking" element={<B2CCleaningBooking />} />
        <Route path="/checkout" element={<B2CCheckout />} />
        <Route path="/b2c/checkout" element={<B2CCheckout />} />
        
        {/* B2B Routes - Moved to /b2b path */}
        <Route path="/b2b" element={
          <>
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
      {!isB2C && <Footer />}
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
