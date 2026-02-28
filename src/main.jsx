import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AdminProvider } from './components/admin/AdminContext' // 👈 IMPORTANTE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminProvider>   {/* 👈 ENVOLVEMOS TODA LA APP */}
      <App />
    </AdminProvider>
  </React.StrictMode>,
)