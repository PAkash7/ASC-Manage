import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { SoundProvider } from './context/SoundContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
// import { registerSW } from 'virtual:pwa-register'

// registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SoundProvider>
      <AppProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </SoundProvider>
  </React.StrictMode>,
)
