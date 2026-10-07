import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/manrope'
import App from './App'
import './index.css'
import { AdminProvider } from './components/admin/AdminContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { CartProvider } from './contexts/CartContext'
import { UIProvider } from './contexts/UIContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminProvider>
      <SettingsProvider>
        <CartProvider>
          <UIProvider>
            <App />
          </UIProvider>
        </CartProvider>
      </SettingsProvider>
    </AdminProvider>
  </React.StrictMode>,
)
