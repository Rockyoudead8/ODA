import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Check from './pages/Check'
import Hero from './pages/Hero'
import Specific from './pages/Specific'
import Admin from './pages/Admin'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import 'leaflet/dist/leaflet.css';
import Explore from './pages/Explore'
import ProtectedRoute from './components/ProtectedRoute'
function App() {
  return (
    <>
      <BrowserRouter>

        <Header />
        <Routes>
          {/* public route */}
          <Route path='/' element={<LoginPage />} />
          <Route path='/Signup' element={<SignupPage />} />
          {/* public routes */}
          <Route path='/Check' element={<ProtectedRoute>
            <Check />
          </ProtectedRoute>} />
          <Route path='/Admin' element={<ProtectedRoute>
            <Admin />
          </ProtectedRoute>} />
          <Route path='/Hero' element={<Hero />} />
          <Route path='/Explore' element={<ProtectedRoute>
            <Explore />
          </ProtectedRoute>} />
          <Route path='/Specific/:id' element={<ProtectedRoute>
            <Specific />
          </ProtectedRoute>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App