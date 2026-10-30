import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import './AppLayout.css';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <MobileNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

