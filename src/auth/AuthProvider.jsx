import { useContext, createContext, useState, useEffect } from "react";
import { API_URL } from "./constants";

const AuthContext = createContext({
    isAuthenticated: false,
    getRefreshToken: () => { },
    getAccessToken: () => { },
    saveUser: (userData) => { },
    getUser: () => ({} || undefined),
    signOut: () => { },
})

export default function AuthProvider({ children }) {

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [accessToken, setAccessToken] = useState("")
    const [user, setUser] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])


    //Solicitar nuevo AccesToken
    async function requestNewAccesToken(refreshToken) {
        try {
            const response = await fetch(`${API_URL}/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`
                }
            })

            if (response.ok) {
                const json = (await response.json())

                return json.accessToken
            }
            else if (response.status === 401) {
                signOut()
                return
            }
            else {
                throw new Error(response.statusText)
            }
        }
        catch(error) {
            return error
        }
    }

    function signOut()
    {
        setIsAuthenticated(false)
        setAccessToken("")
        setUser(undefined)
        localStorage.removeItem("token")
    }

    //Es un check que permite saber si ya hay una sesión previa
    async function checkAuth() {
        if (accessToken) {
            //el usuario se encuentra autenticado
            const userInfo = await getUserInfo(accessToken)

            if (userInfo) {
                setAccessToken(accessToken)
                localStorage.setItem("token", getRefreshToken())
                setUser(userInfo.user)
                setIsLoading(false)
                return;
            }
        }
        else {

            const token = getRefreshToken()
            if (token) {
                const newAccessToken = await requestNewAccesToken(token)

                if (newAccessToken) {
                    const userInfo = await getUserInfo(newAccessToken)

                    if (userInfo) {
                        setAccessToken(newAccessToken)
                        localStorage.setItem("token", JSON.stringify(token))
                        setIsAuthenticated(true)
                        setUser(userInfo.user)
                        setIsLoading(false)
                        return;
                    }
                }
            }
        }
        setIsLoading(false)
    }
    async function getUserInfo(accessToken) {
        try {
            const response = await fetch(`${API_URL}/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            })

            if (response.ok) {
                const json = await response.json()
                return json.user
            }
            else {
                throw new Error(response.statusText)
            }

        }
        catch (error) {
            console.log("error", error)
            return null
        }
    }

    function getUser() {
        return user
    }
    function getAcessToken() {
        return accessToken;
    }

    function getRefreshToken() {
        const tokenTemp = localStorage.getItem("token")
        if (tokenTemp) {
            const token = JSON.parse(tokenTemp)
            return token
        }
        else {
            return null
        }
    }

    function saveUser(userData) {
        setAccessToken(userData.accessToken)
        setUser(userData.user)
        localStorage.setItem("token", JSON.stringify(userData.refreshToken))
        setIsAuthenticated(true)
    }


    return <AuthContext.Provider value={{ isAuthenticated, getAcessToken, getRefreshToken, saveUser, getUser, signOut }}>
        {isLoading ? <div>Loading ...</div> : children}
    </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
