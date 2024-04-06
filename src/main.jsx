import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // estilos del tailwind
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from './routes/Login.jsx';
import Products from './routes/Products.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AuthProvider from './auth/AuthProvider.jsx';
import 'react-toastify/dist/ReactToastify.css';

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [{
      path: "/products",
      element: <Products />
    }]
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={Router} />
    </AuthProvider>
  </React.StrictMode>,
)
