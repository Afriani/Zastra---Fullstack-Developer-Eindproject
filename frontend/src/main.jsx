// src/main.jsx
import "./polyfills";   // <<< MUST be first
import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App";
// ...rest of bootstrap

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);

