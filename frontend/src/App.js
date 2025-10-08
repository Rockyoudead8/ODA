import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
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
import Logout from './components/Logout'
function App() {
  return (
    <>
    <BrowserRouter>
    <Logout/>
    <Header/>
    <Routes>
   <Route path='/' element={<LoginPage/>}/>
   <Route path='/Signup' element={<SignupPage/>}/>
   <Route path='/Check' element={<Check/>}/>
   <Route path='/Admin' element={<Admin/>}/>
   <Route path='/Hero' element={<Hero/>}/>
   <Route path='/Explore' element={<Explore/>}/>
   <Route path='/Specific/:id' element={<Specific/>}/>
    </Routes>
    <Footer/>
    </BrowserRouter>
    </>
  )
}

export default App