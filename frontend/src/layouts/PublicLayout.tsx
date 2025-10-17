import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1" role="main" id="main">
        <Outlet />
      </div>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-3 py-4 text-sm text-secondary-700">
          © {new Date().getFullYear()} Menschlichkeit Österreich
        </div>
      </footer>
    </div>
  );
}

