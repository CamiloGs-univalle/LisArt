import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/manrope'
import '@fontsource/caveat/600.css'
import '@fontsource/caveat/700.css'
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
