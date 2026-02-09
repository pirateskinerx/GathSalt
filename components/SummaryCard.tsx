
import React, { useState, useRef } from 'react';
import { SocialInsight, SocialPlatform } from '../types';
import { performDeepDive, chatAboutInsight, speakText } from '../geminiService';
import gsap from 'gsap';

interface SummaryCardProps {
  insight: SocialInsight;
  onDelete: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ insight, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<{ analysis: string; sources: any[] } | null>(null);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDeepDive = async () => {
    if (deepDiveData) {
      setShowDeepDive(!showDeepDive);
      return;
    }
    setIsDeepDiving(true);
    try {
      const data = await performDeepDive(insight);
      setDeepDiveData(data);
      setShowDeepDive(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeepDiving(false);
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakText(insight.summary);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    try {
      const aiResponse = await chatAboutInsight(insight, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse || "Analysis failure." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatting(false);
    }
  };

  // Rendering variations based on Platform
  const isIG = insight.platform === SocialPlatform.INSTAGRAM;
  const isX = insight.platform === SocialPlatform.X;
  const isFB = insight.platform === SocialPlatform.FACEBOOK;
  const isMedia = insight.platform === SocialPlatform.MEDIA;

  // IG Visual Styling: Image focus, caption summary
  if (isIG) {
    return (
      <div ref={cardRef} className="group glass-panel border border-white/5 flex flex-col hover:border-sage/30 transition-all duration-700">
        <div className="aspect-square w-full bg-[#0d0f0d] overflow-hidden relative">
          {insight.mediaData ? (
            <img src={insight.mediaData} alt="IG Visual" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-white/5 italic font-black text-6xl rotate-[-10deg] uppercase">Visual_Node</div>
          )}
          <div className="absolute top-6 left-6 flex gap-4">
             <span className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 italic flex items-center gap-2">
               <i className="fab fa-instagram"></i> IG.Visuals
             </span>
          </div>
        </div>
        <div className="p-10 space-y-6">
           <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-sage">Insight_Captured</h4>
                <button onClick={handleSpeak} className={`text-sage hover:text-white transition-colors ${isSpeaking ? 'animate-pulse' : ''}`}>
                  <i className={`fas ${isSpeaking ? 'fa-spinner fa-spin' : 'fa-volume-up'} text-[10px]`}></i>
                </button>
              </div>
              <button onClick={onDelete} className="text-white/20 hover:text-red-500"><i className="fas fa-trash-alt text-xs"></i></button>
           </div>
           <p className="text-xl italic font-light leading-relaxed text-white/80">
             {insight.summary}
           </p>
           <div className="flex flex-wrap gap-4 opacity-40">
              {insight.keyTakeaways.slice(0, 3).map((t, i) => (
                <span key={i} className="text-[10px] font-mono lowercase">#{t.replace(/\s+/g, '')}</span>
              ))}
           </div>
           <button onClick={() => setIsExpanded(!isExpanded)} className="w-full border border-white/5 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
             {isExpanded ? 'Hide_Intelligence' : 'View_Intelligence_Node'}
           </button>
        </div>
        {isExpanded && (
          <div className="p-10 bg-white/[0.02] border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
             <p className="text-sm text-white/50 leading-loose uppercase tracking-wider">{insight.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  // MEDIA KIT / Warehouse styling: Clean list/asset view
  if (isMedia) {
    return (
      <div ref={cardRef} className="group flex flex-col md:flex-row gap-8 bg-white/[0.01] border border-white/5 p-8 hover:bg-white/[0.03] transition-all">
        <div className="w-full md:w-48 h-48 bg-[#0d0f0d] flex-shrink-0 border border-white/5 relative overflow-hidden">
          {insight.mediaData ? (
            <img src={insight.mediaData} alt="Asset" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
          ) : (
             <div className="w-full h-full flex items-center justify-center"><i className="fas fa-file-invoice text-white/10 text-3xl"></i></div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-sage/80 text-black text-[8px] font-black uppercase flex items-center gap-2">
            <i className="fas fa-box-open"></i> Asset.ID_{insight.id}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between py-2">
           <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[9px] font-mono text-sage/40 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-sync"></i> Metadata_Capture_Sync: {new Date(insight.timestamp).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-4">
                  <button onClick={handleSpeak} className="text-sage/40 hover:text-sage transition-all"><i className={`fas ${isSpeaking ? 'fa-spinner fa-spin' : 'fa-volume-up'} text-[10px]`}></i></button>
                  <button onClick={onDelete} className="text-white/10 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
                </div>
              </div>
              <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-sage transition-colors">{insight.summary}</h4>
              <p className="text-sm text-white/40 uppercase tracking-widest leading-relaxed line-clamp-2">{insight.explanation}</p>
           </div>
           <div className="flex gap-10 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all">Expansion_Module</button>
              <button onClick={() => setChatOpen(!chatOpen)} className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all">Comm_Link</button>
           </div>
        </div>
        {isExpanded && (
          <div className="w-full md:absolute md:top-full md:left-0 md:w-full z-20 bg-[#0c0d0c] border border-white/5 p-10 animate-in fade-in duration-500 mt-4 md:mt-0 shadow-2xl">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                   <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-sage italic">Core_Findings:</h5>
                   <ul className="space-y-4">
                      {insight.keyTakeaways.map((t, i) => (
                        <li key={i} className="text-xs text-white/60 border-l border-sage/20 pl-4">{t}</li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Default / X / FB styling (Legacy sharp aesthetic)
  return (
    <div 
      ref={cardRef}
      className="group relative bg-white/[0.01] border-l-2 border-white/5 pl-12 py-12 pr-12 hover:bg-white/[0.02] hover:border-sage transition-all duration-1000"
    >
      <div className="flex flex-col gap-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex items-center gap-10">
             <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black tracking-[0.5em] text-white/20 uppercase flex items-center gap-2">
                 <i className={`${isX ? 'fab fa-x-twitter' : isFB ? 'facebook' : 'fas fa-globe'}`}></i> Capture_Origin
               </span>
               <span className="text-[12px] font-black text-sage tracking-[0.2em] uppercase italic">{insight.platform}</span>
             </div>
             <div className="w-px h-8 bg-white/5"></div>
             <div className="flex flex-col gap-1">
               <span className="text-[9px] font-black tracking-[0.5em] text-white/20 uppercase">Vibe_Detection</span>
               <span className={`text-[12px] font-black tracking-[0.2em] uppercase italic ${insight.sentiment === 'positive' ? 'text-lime' : insight.sentiment === 'negative' ? 'text-red-500' : 'text-sage/60'}`}>
                 // {insight.sentiment}
               </span>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleSpeak} className="text-sage/20 hover:text-sage transition-all"><i className={`fas ${isSpeaking ? 'fa-spinner fa-spin' : 'fa-volume-up'} text-xs`}></i></button>
            <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest">ID_{insight.id}</span>
            <button 
              onClick={onDelete} 
              className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="gathsalt-italic text-5xl md:text-7xl leading-[0.85] tracking-tighter group-hover:text-sage transition-colors duration-700 italic flex items-center gap-6">
            {isX && <i className="fab fa-x-twitter text-4xl opacity-10"></i>}
            {insight.summary}
          </h4>
          <p className={`text-white/40 text-2xl font-light leading-relaxed max-w-5xl ${isExpanded ? '' : 'line-clamp-2'}`}>
            {insight.explanation}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-14 pt-12 border-t border-white/5">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-black tracking-[0.4em] uppercase hover:text-sage transition-all relative overflow-hidden group/btn"
          >
            <span className="relative z-10">{isExpanded ? 'Collapse_Intel' : 'Expand_Intelligence'}</span>
            <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-sage transform translate-y-3 group-hover/btn:translate-y-0 transition-transform duration-500"></div>
          </button>
          
          <button 
            onClick={handleDeepDive}
            disabled={isDeepDiving}
            className={`text-[11px] font-black tracking-[0.4em] uppercase flex items-center gap-4 transition-all ${showDeepDive ? 'text-sage' : 'text-white/30 hover:text-white'}`}
          >
            {isDeepDiving ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-fingerprint"></i>}
            Forensic_Deep_Dive
          </button>

          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className={`text-[11px] font-black tracking-[0.4em] uppercase transition-all ${chatOpen ? 'text-sage' : 'text-white/30 hover:text-white'}`}
          >
            Collaborative_Link
          </button>

          <a 
            href={insight.sourceUrl} 
            target="_blank" 
            className="ml-auto text-[11px] font-black tracking-[0.4em] text-white/10 hover:text-white uppercase transition-colors"
          >
            View_Origin [↗]
          </a>
        </div>

        {isExpanded && !showDeepDive && (
          <div className="animate-in fade-in slide-in-from-top-6 duration-700 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-10">
              <h5 className="text-[11px] font-black text-sage uppercase tracking-[0.5em] italic">Strategic_Reconstructions:</h5>
              <div className="space-y-8">
                {insight.keyTakeaways.map((t, i) => (
                  <div key={i} className="flex gap-8 items-baseline group/item">
                    <span className="font-mono text-[10px] text-white/10 group-hover/item:text-sage transition-colors italic">0{i+1}_NODE</span>
                    <p className="text-white/70 font-light text-base md:text-lg tracking-wide leading-relaxed border-l-2 border-white/5 pl-8 group-hover/item:border-sage transition-all duration-500">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showDeepDive && deepDiveData && (
          <div className="bg-sage/[0.01] border border-sage/10 p-16 animate-in zoom-in-95 duration-700 space-y-16 backdrop-blur-sm">
            <div className="flex items-center gap-5">
              <div className="w-2.5 h-2.5 bg-sage animate-pulse rotate-45"></div>
              <span className="text-[11px] font-black tracking-[0.6em] text-sage uppercase italic">Strategic_Forensics_Report</span>
            </div>
            <div className="text-white/80 text-xl md:text-2xl font-light leading-relaxed max-w-5xl whitespace-pre-wrap border-l-4 border-sage/10 pl-16 font-sans italic">
              {deepDiveData.analysis}
            </div>
            {deepDiveData.sources.length > 0 && (
              <div className="flex flex-wrap gap-10 pt-16 border-t border-white/5">
                {deepDiveData.sources.map((s: any, i: number) => (
                  s.web?.uri && (
                    <a key={i} href={s.web.uri} target="_blank" className="text-[10px] font-black tracking-[0.5em] text-white/20 hover:text-sage uppercase transition-colors">
                      [{s.web.title || 'ARCHIVE_REF'}]
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {chatOpen && (
          <div className="bg-[#0c0d0c] border border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-1000 backdrop-blur-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <span className="text-[11px] font-black tracking-[0.5em] text-sage uppercase italic tracking-[0.5em]">Secure_Node_Dialogue</span>
              <button onClick={() => setChatOpen(false)} className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors duration-300"><i className="fas fa-times text-sm"></i></button>
            </div>
            <div className="p-16 space-y-12 max-h-[600px] overflow-y-auto font-light">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] text-lg p-10 rounded-none italic ${msg.role === 'user' ? 'bg-sage text-black font-black uppercase tracking-tight' : 'bg-white/5 text-white/70 border border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatting && <div className="text-sage text-[11px] font-black tracking-[0.6em] animate-pulse uppercase italic">Syncing...</div>}
            </div>
            <form onSubmit={handleChat} className="p-10 border-t border-white/5 flex gap-8 bg-white/[0.005]">
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder="PROMPT NODE ARCHIVE..." 
                className="flex-1 bg-transparent border-none py-8 px-6 text-xl outline-none focus:ring-0 text-white placeholder-white/5 font-mono uppercase tracking-tighter italic"
              />
              <button type="submit" disabled={isChatting} className="bg-white text-black px-16 py-5 font-black uppercase tracking-[0.4em] text-[12px] hover:bg-sage hover:text-white transition-all duration-500 disabled:opacity-5">
                Execute
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
