import { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

export function AdminProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false)

    const toggleAdmin = () => {
        setIsAdmin(prev => !prev)
    }

    return (
        <AdminContext.Provider value={{ isAdmin, toggleAdmin }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdmin() {
    return useContext(AdminContext)
}