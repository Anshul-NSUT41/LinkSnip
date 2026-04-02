import React from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4 col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-600 text-white">
                <LinkIcon size={14} />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                LinkSnip
              </span>
            </Link>
            <p className="text-muted text-sm max-w-xs">
              A modern, fast, and feature-rich URL shrinker tailored for serious creators and businesses.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="p-2 rounded-full bg-surface hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors">
                <LinkIcon size={18} />
              </a>
              <a href="#" className="p-2 rounded-full bg-surface hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors">
                <LinkIcon size={18} />
              </a>

            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="flex flex-col gap-2 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Features</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Pricing</Link></li>
              <li><Link to="/" className="hover:text-primary-400 transition-colors">API Validation</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Sign up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="flex flex-col gap-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} LinkSnip. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-4 sm:mt-0">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by Antigravity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
