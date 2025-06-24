"use client"

import type React from "react"
import { useAuth, signOut } from "@/components/MockSession"
import { useRouter } from "next/router"

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-200 p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="#" className="hover:text-blue-500">
                Home
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="hover:text-blue-500">
                Settings
              </a>
            </li>
            <li className="mb-2">
              <button onClick={handleSignOut} className="hover:text-blue-500">
                Sign Out
              </button>
            </li>
          </ul>
        </nav>
        {user && (
          <div className="mt-4">
            <p>Logged in as: {user?.name}</p>
            <p>Email: {user?.email}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}

export default MainLayout
