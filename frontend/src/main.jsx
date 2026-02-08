// src/main.jsx
import "./polyfills";
import React, { StrictMode } from "react";

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

import AuthContextProvider from './context/AuthContextProvider.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthContextProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AuthContextProvider>
    </StrictMode>
);

