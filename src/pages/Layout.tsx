import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-[240px] p-5 flex-1 bg-white min-h-screen">
        <Outlet />
      </main>
    </div>
  )
} 