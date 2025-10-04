import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AITestPage from './pages/AITestPage';
import PrivacySettings from './pages/PrivacySettings';
import ProtectedRoute from './components/ProtectedRoute';
import MemberArea from './pages/MemberArea';
import NavBar from './components/NavBar';
import Login from './pages/Login';

// Fallback für fehlende Components
const Home = React.lazy(() =>
  import('./pages/Home').catch(() => ({ default: () => <AITestPage /> }))
);

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main id="main">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted">🤖 KI-System wird geladen...</p>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<AITestPage />} />
            <Route path="/ai-demo" element={<AITestPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/account/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
            <Route path="/member" element={<ProtectedRoute><MemberArea /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}
