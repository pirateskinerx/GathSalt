
import React, { useState, useEffect, useRef } from 'react';
import { User, SocialInsight, SocialPlatform } from '../types';
import { generateInsight, analyzeMedia } from '../geminiService';
import SummaryCard from './SummaryCard';
import Hero3D from './Hero3D';
import MediaKit from './MediaKit';
import BriefingPanel from './BriefingPanel';
import gsap from 'gsap';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  insights: SocialInsight[];
  addInsight: (insight: SocialInsight) => void;
  removeInsight: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, insights, addInsight, removeInsight }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | SocialPlatform>('all');
  const [showBriefing, setShowBriefing] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  const sideRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(sideRef.current, { x: -100, opacity: 0, duration: 1, ease: 'expo.out' })
      .from(headerRef.current, { y: -50, opacity: 0, duration: 1, ease: 'expo.out' }, "-=0.8");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsProcessing(true);
    try {
      const insight = await generateInsight(inputUrl);
      addInsight(insight);
      setInputUrl('');
      gsap.to(formRef.current, { scale: 1.01, duration: 0.1, yoyo: true, repeat: 1 });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMediaCapture = async (base64: string, mime: string) => {
    setIsProcessing(true);
    try {
      const insight = await analyzeMedia(base64, mime);
      addInsight(insight);
      gsap.fromTo('.insight-node:first-child', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    } catch (error) {
      console.error("Media analysis failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInsights = activeFilter === 'all' 
    ? insights 
    : insights.filter(i => i.platform === activeFilter);

  const isWarehouseMode = activeFilter === SocialPlatform.MEDIA;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080908] text-white relative overflow-hidden font-sans">
      <Hero3D />
      
      {showBriefing && <BriefingPanel onClose={() => setShowBriefing(false)} />}
      
      <aside ref={sideRef} className="w-full md:w-80 glass-panel border-r border-white/5 p-10 flex flex-col gap-12 z-10 relative">
        <div className="flex flex-col gap-2 group">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 ai-gradient rounded-sm"></div>
             <span className="gathsalt-italic text-3xl italic font-black">GATHSALT</span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.5em] text-sage opacity-50 uppercase pl-1">Intell. Processing</span>
        </div>

        <nav className="flex-1 space-y-4">
          <p className="text-[9px] font-bold text-sage/30 uppercase tracking-[0.3em] mb-8">Data Streams</p>
          {[
            { id: 'all', label: 'Nodes.Archive', icon: 'fas fa-layer-group' },
            { id: SocialPlatform.X, label: 'X.Strategic', icon: 'fab fa-x-twitter' },
            { id: SocialPlatform.FACEBOOK, label: 'FB.Node', icon: 'fab fa-facebook' },
            { id: SocialPlatform.INSTAGRAM, label: 'IG.Vibe', icon: 'fab fa-instagram' },
            { id: SocialPlatform.MEDIA, label: 'Media.Kit', icon: 'fas fa-box-open' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveFilter(item.id as any)}
              className={`w-full text-left py-3 border-b border-transparent transition-all duration-500 group flex items-center gap-4 ${activeFilter === item.id ? 'text-sage border-sage/50 pl-4' : 'text-white/20 hover:text-white hover:pl-2'}`}
            >
              <i className={`${item.icon} text-[10px]`}></i>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              {item.id === SocialPlatform.X && <i className="fab fa-x-twitter text-[8px] opacity-20 group-hover:opacity-100 transition-opacity ml-auto"></i>}
            </button>
          ))}
          
          <div className="pt-8">
            <button 
              onClick={() => setShowBriefing(true)}
              className="w-full flex items-center gap-4 py-3 text-[11px] font-black uppercase tracking-widest text-sage/50 hover:text-sage transition-all border-t border-white/5"
            >
              <i className="fas fa-file-invoice text-[10px]"></i>
              <span>Strategic.Briefing</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-none border border-sage/20 grayscale" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-lime border-2 border-[#080908]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black tracking-tight text-white uppercase">{user.name}</p>
              <p className="text-[8px] text-sage/40 uppercase tracking-widest font-mono">Status: Connected</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-[10px] font-black tracking-widest text-white/20 hover:text-red-500 uppercase border border-white/5 py-3 transition-all">
            Terminate Session
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden z-10">
        <header ref={headerRef} className={`p-10 md:p-16 lg:p-24 transition-all duration-700 ${isWarehouseMode ? 'bg-white/[0.02]' : ''}`}>
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex justify-between items-end border-b border-white/5 pb-10">
               <div className="space-y-4">
                  <span className="text-[11px] font-mono text-sage tracking-[0.5em] uppercase opacity-60">
                    {isWarehouseMode ? 'Phase_Alpha: Global_Ingestion' : 'Phase_01: Capture_Engine'}
                  </span>
                  <h2 className="gathsalt-italic text-7xl md:text-9xl leading-none italic">
                    {isWarehouseMode ? 'Warehouse' : 'The Capture'}
                  </h2>
               </div>
            </div>
            
            <form ref={formRef} onSubmit={handleSubmit} className="relative space-y-10">
              {!isWarehouseMode ? (
                <div className="space-y-6">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="ENTER URL..."
                      className="w-full bg-transparent border-b-2 border-white/10 focus:border-sage rounded-none py-10 text-4xl md:text-7xl font-black italic outline-none transition-all text-white placeholder-white/5 uppercase tracking-tighter"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-1.5 bg-sage transition-all duration-700 group-focus-within:w-full"></div>
                  </div>
                </div>
              ) : null}

              <div className={`grid grid-cols-1 ${!isWarehouseMode ? 'lg:grid-cols-2' : ''} gap-10`}>
                <div className="flex flex-col gap-6">
                   <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
                     {isWarehouseMode ? '// CENTRALIZED ASSET SYNCHRONIZATION FROM ANY MOBILE DEVICE' : '// OR SYNC FROM MOBILE VIA MEDIA KIT MODULE'}
                   </p>
                   <MediaKit onCapture={handleMediaCapture} isProcessing={isProcessing} />
                </div>
                
                {!isWarehouseMode && (
                  <div className="flex flex-col justify-end">
                    <button 
                      type="submit"
                      disabled={isProcessing || !inputUrl.trim()}
                      className="group relative overflow-hidden bg-white text-black px-16 py-8 font-black uppercase tracking-[0.3em] text-[13px] hover:text-white transition-colors duration-700 disabled:opacity-5 active:scale-95"
                    >
                      <span className="relative z-10">{isProcessing ? 'SYNCHRONIZING...' : 'EXECUTE CAPTURE'}</span>
                      <div className="absolute inset-0 bg-sage transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </header>

        <section ref={containerRef} className="flex-1 overflow-y-auto p-10 md:p-16 lg:p-24 space-y-16 scroll-smooth bg-[#080908]/50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-10 mb-20">
               <span className="text-[10px] font-black tracking-[0.6em] uppercase whitespace-nowrap text-white/20 italic">
                 {isWarehouseMode ? 'Category Assets // Warehouse' : 'Intelligence Manifest // History'}
               </span>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>

            {filteredInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-56 border border-white/5 bg-white/[0.005]">
                <div className="w-16 h-16 border border-white/10 flex items-center justify-center mb-8">
                   <div className="w-3 h-3 bg-sage animate-pulse rotate-45"></div>
                </div>
                <span className="text-[11px] font-black tracking-[0.5em] uppercase text-white/20 italic">Awaiting Commands</span>
              </div>
            ) : (
              <div className={`grid ${activeFilter === SocialPlatform.INSTAGRAM ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-16`}>
                {filteredInsights.map(insight => (
                  <div key={insight.id} className="insight-node">
                    <SummaryCard 
                      insight={insight} 
                      onDelete={() => removeInsight(insight.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
