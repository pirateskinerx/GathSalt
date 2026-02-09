
import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { speakText } from '../geminiService';

interface BriefingPanelProps {
  onClose: () => void;
}

const BriefingPanel: React.FC<BriefingPanelProps> = ({ onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(panelRef.current, { x: '100%' }, { x: '0%', duration: 0.8, ease: 'expo.out' })
      .fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.4");
  }, []);

  const handleClose = () => {
    gsap.to(panelRef.current, { x: '100%', duration: 0.6, ease: 'expo.in', onComplete: onClose });
  };

  const handleSpeak = async (text: string, id: string) => {
    setActiveSpeech(id);
    try {
      await speakText(text);
    } catch (e) {
      console.error(e);
    } finally {
      setActiveSpeech(null);
    }
  };

  const intentText = "GATHSALT is a high-performance intelligence hub designed to strip away social media noise and extract raw, actionable insights. By leveraging Gemini 3 Pro, it transforms chaotic feeds from X, Instagram, and Facebook into structured strategic intelligence.";

  return (
    <div ref={panelRef} className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#0a0c0a] border-l border-sage/20 h-full overflow-y-auto p-12 md:p-20 shadow-2xl flex flex-col gap-16">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-sage tracking-[0.6em] uppercase">Intelligence_Manual_v3.1</span>
            <h2 className="gathsalt-italic text-5xl italic font-black">Strategic_Briefing</h2>
          </div>
          <button onClick={handleClose} className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-red-500 hover:text-red-500 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div ref={contentRef} className="space-y-16">
          {/* Section: Operational Intent */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-2 h-2 bg-sage rotate-45"></div>
                 <h3 className="text-[11px] font-black tracking-widest uppercase text-white/40 italic">Operational_Intent</h3>
              </div>
              <button 
                onClick={() => handleSpeak(intentText, 'intent')}
                disabled={activeSpeech === 'intent'}
                className="text-[10px] font-black text-sage hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
              >
                <i className={`fas ${activeSpeech === 'intent' ? 'fa-spinner fa-spin' : 'fa-volume-up'}`}></i> Play_Audio
              </button>
            </div>
            <p className="text-xl font-light leading-relaxed text-white/70 italic">
              {intentText}
            </p>
          </section>

          {/* Section: Field Deployment */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 bg-sage rotate-45"></div>
               <h3 className="text-[11px] font-black tracking-widest uppercase text-white/40 italic">Field_Deployment_Scenario</h3>
            </div>
            <div className="space-y-8">
              {[
                { step: "01", label: "Deployment", desc: "The user enters the terminal via a seamless Single Sign-On (SSO). Interface distortion signals 'Connected' status." },
                { step: "02", label: "Capture", desc: "Intelligence is ingested via URL (Capture Engine) or mobile exports (Warehouse Module)." },
                { step: "03", label: "Neural Processing", desc: "Gemini 3 Pro deconstructs the content, detecting vibes and generating tactical takeaways." },
                { step: "04", label: "Manifestation", desc: "Platforms like IG focus on aesthetics, while X captures prioritize strategic logic." },
                { step: "05", label: "Node Dialogue", desc: "A secure comm-link allows operatives to query the captured archive directly." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-8 group">
                  <span className="font-mono text-xs text-sage/30 group-hover:text-sage transition-colors">{item.step}</span>
                  <div className="space-y-2 flex-1 border-l border-white/5 pl-8">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black uppercase tracking-widest text-white/90">{item.label}</h4>
                      <button 
                        onClick={() => handleSpeak(`${item.label}. ${item.desc}`, `step-${idx}`)}
                        className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity text-sage hover:text-white"
                      >
                        <i className={`fas ${activeSpeech === `step-${idx}` ? 'fa-spinner fa-spin' : 'fa-volume-up'}`}></i>
                      </button>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Speech Synthesis Data */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 bg-sage rotate-45"></div>
               <h3 className="text-[11px] font-black tracking-widest uppercase text-white/40 italic">Synthesis_Data [TTS_SCRIPTS]</h3>
            </div>
            <div className="space-y-10">
              {[
                { title: "Tactical_Overview", text: "Welcome to GATHSALT. You are now connected to the primary capture engine. We aggregate fragmented data from X, Facebook, and Instagram, distilling chaos into clarity. The noise ends here. Intelligence begins now." },
                { title: "Field_Guide", text: "To begin a capture, paste a URL into the engine or drop an image into the Universal Media Kit. Our AI analyzes the visual expression of Instagram nodes and the strategic intent of X captures. Your session is active." },
                { title: "Gathsalt_Manifesto", text: "GATHSALT is the ultimate intelligence warehouse. We take your shared content from anywhere and power it through Gemini 3 to give you a full-context summary in seconds. One sign-on. Infinite insights." }
              ].map((script, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-8 space-y-4 group">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-sage uppercase tracking-[0.2em]">{script.title}</span>
                    <button 
                      onClick={() => handleSpeak(script.text, `script-${idx}`)}
                      disabled={activeSpeech === `script-${idx}`}
                      className="text-white/20 hover:text-sage transition-colors"
                    >
                      <i className={`fas ${activeSpeech === `script-${idx}` ? 'fa-circle-notch fa-spin' : 'fa-volume-up'} text-[10px]`}></i>
                    </button>
                  </div>
                  <p className="text-xs text-white/60 font-mono leading-loose uppercase italic tracking-tighter">
                    "{script.text}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto pt-12 border-t border-white/5">
          <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest text-center">
            GATHSALT CORE // SECURE ACCESS GRANTED // END OF BRIEFING
          </p>
        </div>
      </div>
    </div>
  );
};

export default BriefingPanel;
