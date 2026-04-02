import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-surface">
        <div className="absolute inset-0 animate-ping rounded-full bg-surface-hover opacity-50"></div>
        <ShieldAlert size={64} className="text-zinc-600" />
        <span className="absolute -bottom-4 right-0 rounded-lg bg-red-500 px-3 py-1 font-mono text-sm font-bold text-white shadow-lg">
          404
        </span>
      </div>
      
      <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Page not found</h1>
      <p className="mb-10 max-w-md text-lg text-muted">
        Looks like you've followed a broken link or entered a URL that doesn't exist on this site.
      </p>
      
      <Link to="/" className="btn btn-primary px-6 py-3 gap-2">
        <ArrowLeft size={18} />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
