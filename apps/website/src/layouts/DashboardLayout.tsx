import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1" role="main" id="main">
        <div className="mx-auto max-w-6xl p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

