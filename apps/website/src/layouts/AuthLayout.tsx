import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid place-items-center bg-secondary-50">
      <main id="main" className="w-full max-w-md p-4">
        <Outlet />
      </main>
    </div>
  );
}

