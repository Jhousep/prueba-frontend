import React, { useState, } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { API_URL } from "../auth/constants.jsx";
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignInAlt, FaLayerGroup } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';


function DefaultTemplate({ children }) {
  const auth = useAuth()
  const goTo = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  function goTOInvoices() {
    goTo("/products")
  }

  async function handleSignOut() {
    try {
      const response = await fetch(`${API_URL}/signout`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getRefreshToken()}`
        }
      })

      if (response.ok) {
        auth.signOut()
      }
    }
    catch (error) {
      console.log("Se ha presentado un error:", error)
    }
  }

  return (
    <>
      <ToastContainer />
      <button
        onClick={toggleSidebar}
        className={`inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600`}
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      {/* Overlay para cubrir la pantalla */}
      {isSidebarOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Menú lateral */}
      <aside
        id="default-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isSidebarOpen ? '' : '-translate-x-full'
          } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full overflow-y-auto bg-neutral-900">
          <ul className="h-full space-y-2 font-medium flex flex-col justify-between py-10">
            <li className='flex justify-center items-center text-lg pt-1 pb-16'>


              <span className="text-white font-bold cursor-default">AIM EDGE APSS</span>
            </li>
            <li className="flex-grow">
              <a
                className="flex items-center group"
              >

                <button onClick={goTOInvoices} type='button' className="mx-3 mt-3 px-2 py-3 text-left cursor-pointer text-white rounded-lg bg-neutral-600 hover:bg-neutral-700  w-full flex items-center"><FaLayerGroup className='ml-5 mr-3' />Invoices</button>
              </a>
            </li>
            <li>
              <a
                className="flex items-center"
              >

                <button type='button' onClick={((handleSignOut))} className="mx-3 px-2 py-3 text-left w-full text-white rounded-lg bg-neutral-600 hover:bg-neutral-700 flex items-center"><FaSignInAlt className='ml-5 mr-3' />Log Out</button>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      <div className="sm:ml-64 bg-gray-100 cursor-default">
        <div className="py-4 p-10 border-b border-t bg-white border-gray-200 dark:border-gray-700">
          <div className='flex justify-between items-center'>
            <div className='text-2xl font-bold'>Invoices</div>


            <div className="px-4 py-3 flex flex-col items-center" role="none">
              <p className='flex items-center'><FaUser className='mr-2 text-neutral-800' /> {auth.getUser()?.name || ""} </p>

              <p className={`text-sm font-medium my-1 px-4 rounded-md text-white truncate ${auth.getUser().role === 1 ? "bg-orange-400" : "bg-green-400"}`} role="none">
                {auth.getUser().role === 1 ? "Admin" : "User"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 py-4 p-10 border-t bg-white border-gray-200 rounded-lg dark:border-gray-700">
          {/* Contenido principal */}
          <div>
            {children}
          </div>
        </div>
      </div>

    </>
  );
}

export default DefaultTemplate;
