import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainPopup from './components/MainPopup'
import StatsPage from './components/StatsPage'
import SettingsPage from './components/SettingsPage'
import BlockedPage from './components/BlockedPage'
import './App.css'

console.log('📱 App: Componente principal carregado')

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Routes>
          <Route path="/" element={<MainPopup />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/blocked" element={<BlockedPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App