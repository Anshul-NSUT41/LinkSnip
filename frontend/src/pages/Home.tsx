import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Copy, Check, ExternalLink, QrCode, ArrowRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error('Please enter a valid URL with http:// or https://');
      return;
    }

    setIsLoading(true);
    setShortenedUrl(null);
    setShowQR(false);
    
    try {
      const res = await api.post('/url/shorten', { originalUrl: url });
      setShortenedUrl(res.data.url);
      setUrl('');
      toast.success('URL shortened successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to shorten URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shortenedUrl) return;
    navigator.clipboard.writeText(shortenedUrl.shortUrl);
    setIsCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
        
        <div className="text-center max-w-4xl mx-auto mb-10 animate-slide-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Make every <span className="text-gradient">link</span> count.
          </h1>
          <p className="text-xl sm:text-2xl text-muted max-w-2xl mx-auto">
            A powerful, flexible, and fast URL shortener designed for modern creators, businesses, and developers.
          </p>
        </div>

        {/* Shortener Box */}
        <div className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="card shadow-2xl shadow-primary-900/10 border-white/10 bg-surface/80 p-2 sm:p-4 rounded-2xl relative">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-2 sm:gap-4 relative z-10">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="Paste your long link here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-14 sm:h-16 px-6 py-4 bg-background border border-border text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-zinc-500"
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !url}
                className="btn btn-primary h-14 sm:h-16 px-8 text-lg font-semibold rounded-xl shrink-0 gap-2 transition-transform active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Scissors size={20} />
                    <span>Snip It!</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Card */}
          {shortenedUrl && (
            <div className="mt-8 animate-slide-up origin-top">
              <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-primary-500/30 bg-primary-950/20 shadow-xl shadow-primary-900/20">
                <div className="flex-1 w-full overflow-hidden">
                  <p className="text-sm text-zinc-400 mb-1truncate pr-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    Original destination: <span className="text-zinc-300 ml-1">{shortenedUrl.originalUrl}</span>
                  </p>
                  <a 
                    href={shortenedUrl.shortUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-2xl sm:text-3xl font-bold text-white hover:text-primary-300 transition-colors flex items-center gap-2"
                  >
                    {shortenedUrl.shortUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink size={20} className="text-zinc-500 hover:text-primary-400" />
                  </a>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="btn btn-secondary h-12 px-4 shadow-sm"
                    title="Toggle QR Code"
                  >
                    <QrCode size={18} className="mr-2" />
                    QR Code
                  </button>
                  <button 
                    onClick={handleCopy}
                    className={`btn h-12 px-6 shadow-sm ${isCopied ? 'bg-green-600 text-white border-transparent' : 'btn-primary'}`}
                  >
                    {isCopied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code Panel */}
              {showQR && (
                <div className="mt-4 p-6 glass-panel flex flex-col items-center animate-fade-in border-white/5">
                  <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                    <QRCodeSVG 
                      value={shortenedUrl.shortUrl} 
                      size={200}
                      level="Q"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-sm text-zinc-400 text-center max-w-xs">
                    Scan this QR code with your phone's camera to visit the link directly.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auth nudge for guests */}
        {!isAuthenticated && !shortenedUrl && (
          <div className="mt-8 text-center text-zinc-400 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <p className="text-sm flex items-center justify-center gap-2">
              Want custom aliases and analytics? 
              <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300 flex items-center">
                Create a free account <ArrowRight size={14} className="ml-1" />
              </Link>
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-surface border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why choose LinkSnip?</h2>
            <p className="text-muted max-w-2xl mx-auto">More than just a URL shortener. We provide the tools you need to manage your links effectively.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card bg-background rounded-2xl p-8 hover:border-primary-500/50 transition-colors group">
              <div className="w-14 h-14 bg-primary-950 text-primary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-900 transition-all">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Detailed Analytics</h3>
              <p className="text-muted leading-relaxed">
                Track clicks, geographical location, device types, and referrers to understand your audience better.
              </p>
            </div>

            <div className="card bg-background rounded-2xl p-8 hover:border-primary-500/50 transition-colors group">
              <div className="w-14 h-14 bg-primary-950 text-primary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-900 transition-all">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
              <p className="text-muted leading-relaxed">
                Protect your links with passwords, set expiration dates, and enjoy 99.9% uptime for all your redirects.
              </p>
            </div>

            <div className="card bg-background rounded-2xl p-8 hover:border-primary-500/50 transition-colors group">
              <div className="w-14 h-14 bg-primary-950 text-primary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-900 transition-all">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-muted leading-relaxed">
                Optimized redirect engine ensures your visitors get to their destination instantly without delays.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
