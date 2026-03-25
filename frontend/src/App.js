import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

import Check from './pages/Check'
import Hero from './pages/Hero'
import Specific from './pages/Specific'
import Admin from './pages/Admin'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import Community from './pages/Community'
import SignupPage from './pages/SignupPage'
import 'leaflet/dist/leaflet.css'
import Explore from './pages/Explore'
import ProtectedRoute from './components/ProtectedRoute'
import ChatPage from './pages/ChatPage'
import ScrollToTop from './components/ScrollToTop'

function AppContent() {
  const location = useLocation();
  const hiddenFooterPaths = ["/Chat", "/Community"];

  return (
    <>
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/Signup' element={<SignupPage />} />
        <Route path='/Hero' element={<Hero />} />

        <Route path='/Check' element={<ProtectedRoute><Check /></ProtectedRoute>} />
        <Route path='/Admin' element={<ProtectedRoute><Admin /></ProtectedRoute>} />

        <Route path='/Community' element={
          <ProtectedRoute><Community /></ProtectedRoute>
        } />

        <Route path='/Chat' element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        } />

        <Route path='/Specific/:id' element={
          <ProtectedRoute><Specific /></ProtectedRoute>
        } />
      </Routes>

      {!hiddenFooterPaths.includes(location.pathname) && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;