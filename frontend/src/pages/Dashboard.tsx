import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  BarChart3, ExternalLink, Copy, Trash2, 
  Search, Plus, Calendar, Clock, Link as LinkIcon, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface Analytics {
  totalClicks: number;
  clickTrends: { date: string; clicks: number }[];
  browsers: { name: string; count: number }[];
  operatingSystems: { name: string; count: number }[];
  devices: { name: string; count: number }[];
  referrers: { name: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Analytics modal state
  const [selectedLink, setSelectedLink] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // New URL modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await api.get('/url/user-links?limit=50');
      setLinks(res.data.urls);
    } catch (error) {
      toast.error('Failed to load your links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    setIsCreating(true);
    try {
      await api.post('/url/shorten', { 
        originalUrl: newUrl, 
        customAlias: customAlias || undefined 
      });
      toast.success('Link created successfully');
      setIsCreateModalOpen(false);
      setNewUrl('');
      setCustomAlias('');
      fetchLinks(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create link');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/url/${id}`);
      toast.success('Link deleted');
      setLinks(links.filter(link => link.id !== id));
      if (selectedLink?.id === id) setSelectedLink(null);
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const fetchAnalytics = async (link: any) => {
    setSelectedLink(link);
    setIsAnalyticsLoading(true);
    try {
      const res = await api.get(`/url/analytics/${link.id}`);
      setAnalytics(res.data.analytics);
    } catch (error) {
      toast.error('Failed to load analytics');
      setSelectedLink(null);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const filteredLinks = links.filter(link => 
    link.originalUrl.toLowerCase().includes(search.toLowerCase()) || 
    link.shortUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-[85vh] flex flex-col lg:flex-row gap-8">
      {/* Sidebar / List Area */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Links</h1>
          <p className="text-muted text-sm">Manage and track your shortened URLs</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary w-full py-3 gap-2"
        >
          <Plus size={18} /> Create New Link
        </button>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search links..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 bg-surface/50 border-white/5 focus:bg-surface focus:border-primary-500/50"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3 min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <span className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></span>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center p-8 text-zinc-500 border border-dashed border-border rounded-xl">
              <LinkIcon className="mx-auto mb-3 opacity-50" size={32} />
              <p>{search ? 'No links found matching your search' : 'You haven\'t created any links yet'}</p>
            </div>
          ) : (
            filteredLinks.map(link => (
              <div 
                key={link.id} 
                onClick={() => fetchAnalytics(link)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedLink?.id === link.id 
                    ? 'border-primary-500/50 bg-primary-950/20' 
                    : 'border-border bg-surface hover:border-zinc-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white truncate pr-2">
                    {link.shortUrl.replace(/^https?:\/\//, '')}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                    <BarChart3 size={12} />
                    {link.clickCount}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 truncate mb-3" title={link.originalUrl}>
                  {link.originalUrl}
                </p>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {format(new Date(link.createdAt), 'MMM d, yyyy')}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(link.shortUrl); }}
                      className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Copy"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(link.id); }}
                      className="p-1 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area / Analytics View */}
      <div className="flex-1">
        {selectedLink ? (
          <div className="card h-full p-6 sm:p-8 animate-fade-in flex flex-col border-white/5 bg-surface/30">
            {/* Header */}
            <div className="flex justify-between flex-wrap gap-4 items-start mb-8 pb-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  Analytics Details
                </h2>
                <div className="flex items-center gap-3">
                  <a 
                    href={selectedLink.shortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 font-medium text-lg flex items-center gap-1"
                  >
                    {selectedLink.shortUrl}
                    <ExternalLink size={16} />
                  </a>
                </div>
                <p className="text-zinc-400 text-sm mt-3 flex items-center gap-2 max-w-2xl break-all">
                  <ArrowRight size={14} className="text-zinc-500 shrink-0" />
                  {selectedLink.originalUrl}
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <button 
                  onClick={() => window.open(`/api/url/export/${selectedLink.id}`, '_blank')}
                  className="btn btn-secondary px-3 py-1.5 text-sm"
                >
                  Export CSV
                </button>
                <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                  <Clock size={12} />
                  Created {format(new Date(selectedLink.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>

            {isAnalyticsLoading ? (
               <div className="flex-1 flex items-center justify-center">
                 <span className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></span>
               </div>
            ) : analytics && (
              <div className="flex flex-col flex-1 gap-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-panel p-4 flex flex-col">
                    <span className="text-zinc-400 text-sm font-medium mb-1">Total Clicks</span>
                    <span className="text-3xl font-bold text-white">{analytics.totalClicks}</span>
                  </div>
                  <div className="glass-panel p-4 flex flex-col">
                     <span className="text-zinc-400 text-sm font-medium mb-1">Top Browser</span>
                     <span className="text-xl font-bold text-white capitalize truncate">
                       {analytics.browsers[0]?.name || 'N/A'}
                     </span>
                  </div>
                  <div className="glass-panel p-4 flex flex-col">
                     <span className="text-zinc-400 text-sm font-medium mb-1">Top OS</span>
                     <span className="text-xl font-bold text-white capitalize truncate">
                       {analytics.operatingSystems[0]?.name || 'N/A'}
                     </span>
                  </div>
                  <div className="glass-panel p-4 flex flex-col">
                     <span className="text-zinc-400 text-sm font-medium mb-1">Top Device</span>
                     <span className="text-xl font-bold text-white capitalize truncate">
                       {analytics.devices[0]?.name || 'N/A'}
                     </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* QR Code Section */}
                  <div className="glass-panel p-6 flex flex-col items-center justify-center">
                    <h3 className="w-full text-left font-semibold text-white mb-6">QR Code</h3>
                    <div className="bg-white p-3 rounded-lg">
                      <QRCodeSVG value={selectedLink.shortUrl} size={150} level="M" />
                    </div>
                  </div>

                  {/* Device breakdown */}
                  <div className="glass-panel p-6">
                    <h3 className="font-semibold text-white mb-4">Device Breakdown</h3>
                    <div className="space-y-3">
                      {analytics.devices.length > 0 ? analytics.devices.map((device, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{device.name}</span>
                            <span className="font-medium">{device.count}</span>
                          </div>
                          <div className="w-full bg-surface-hover rounded-full h-2">
                             <div 
                               className="bg-primary-500 h-2 rounded-full" 
                               style={{ width: `${(device.count / analytics.totalClicks) * 100}%` }}
                             ></div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-zinc-500 py-4">No device data yet</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* NOTE: We're omitting chart visualizations here to keep it simple, 
                    but could add react-chartjs-2 line charts here using clickTrends */}
              </div>
            )}
          </div>
        ) : (
          <div className="card h-full flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-border/50 bg-transparent">
            <BarChart3 size={64} className="text-zinc-700 mb-6" />
            <h2 className="text-2xl font-bold text-zinc-300 mb-2">Select a link</h2>
            <p className="text-zinc-500 max-w-md">
              Choose a link from the sidebar to view its detailed analytics, performance metrics, and settings.
            </p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 animate-slide-up bg-surface border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Create New Link</h2>
            
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Destination URL *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://example.com/very/long/path"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Custom Alias (Optional)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-surface-hover text-zinc-400 text-sm">
                    linksnip.com/
                  </span>
                  <input 
                    type="text" 
                    placeholder="my-campaign"
                    value={customAlias}
                    onChange={e => setCustomAlias(e.target.value)}
                    className="input-field rounded-l-none"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Leave empty to auto-generate a random code</p>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-ghost flex-1 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="btn btn-primary flex-1 py-2"
                >
                  {isCreating ? 'Creating...' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
