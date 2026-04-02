import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy loading pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Global page loader
const PageLoader = () => (
  <div className="flex min-h-[70vh] items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
  </div>
);

const App: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-zinc-100 selection:bg-primary-500/30">
      <Navbar />
      
      <main className="flex-1 flex flex-col justify-center">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes (anybody can access) */}
            <Route path="/" element={<Home />} />
            
            {/* Public-only routes (only unauthenticated users) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected routes (only authenticated users) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
