import { useState } from 'react'
//Navigate -> para una condición o logica
//UserNavigate -> para funciones asincronas
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import { API_URL } from "../auth/constants.jsx";
import { ToastContainer, toast } from 'react-toastify';

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const auth = useAuth()
    const goTo = useNavigate()

    if (auth.isAuthenticated) {
        return <Navigate to="/products" />
    }

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            if (response.ok) {
                const json = (await response.json())

                if (json.accessToken && json.refreshToken) {
                    auth.saveUser(json)
                }
                goTo("/products")
            }
            else if (response.status !== 404) {
                const json = (await response.json())
                toast.error(json.message)
                console.log("Ha ocurrido un problema en la petición")
            }
        } catch (error) {
            console.log("Se ha presentado un error:", error)
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="flex justify-center items-center h-screen">
                <form className="max-w-sm mx-auto mt-3 border-2 border-gray-400 rounded-md px-10 py-5" onSubmit={handleSubmit}>
                    <div className='flex justify-center my-4'>
                        <img width={"400px"} src="/images/logo.png" alt="imagen por defecto" />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="user@email.com" />
                    </div>
                    <div className="mb-5">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                        <input type="password" id="password" placeholder='* * * * * * * *' value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    </div>

                    <div className='flex justify-center w-full'>
                        <button type="submit" className="text-white bg-neutral-900 hover:bg-neutral-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full  px-5 py-2.5 text-center mt-4 mb-7">Log in</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Login