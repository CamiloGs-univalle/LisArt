import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AdminProvider } from './components/admin/AdminContext' // 👈 IMPORTANTE
import { SettingsProvider } from './contexts/SettingsContext'
import { CartProvider } from './contexts/CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminProvider>   {/* 👈 ENVOLVEMOS TODA LA APP */}
      <SettingsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </SettingsProvider>
    </AdminProvider>
  </React.StrictMode>,
)