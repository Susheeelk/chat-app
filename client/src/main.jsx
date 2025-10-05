

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import process from "process"

window.process = process;
window.global = window;

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import { FriendProvider } from './context/FriendContext.jsx'

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <FriendProvider>
          <App />
        </FriendProvider>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>

)
