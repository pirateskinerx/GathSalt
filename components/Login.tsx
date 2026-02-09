import React from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading }) => {
  const mockSsoLogin = () => {
    onLogin({
      name: "Operative_01",
      email: "field@gathsalt.ai",
      avatar: "https://picsum.photos/seed/operative/100/100"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080908] font-sans">
      <div className="max-w-md w-full glass-panel p-12 space-y-12 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-sage/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-lime/5 blur-[120px] rounded-full"></div>

        <div className="text-center space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 ai-gradient rounded-sm mb-4 shadow-2xl shadow-sage/10 rotate-45">
            <i className="fas fa-fingerprint text-4xl text-[#080908] -rotate-45"></i>
          </div>
          <div className="space-y-4">
            <h1 className="gathsalt-italic text-5xl italic font-black text-white">GATHSALT</h1>
            <p className="text-[10px] font-mono text-sage tracking-[0.5em] uppercase opacity-60">Strategic Intelligence Hub</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <button
            onClick={mockSsoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 py-5 px-6 bg-white hover:bg-sage text-black rounded-none font-black uppercase tracking-[0.3em] text-[12px] transition-all duration-700 transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fas fa-key text-[10px]"></i>
            )}
            {isLoading ? "Synchronizing..." : "Initiate SSO Session"}
          </button>
          
          <div className="flex items-center gap-6 py-4">
            <div className="h-px flex-1 bg-white/5"></div>
            <span className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-black italic">Active Protocols</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <div className="flex justify-center gap-12 text-xl text-white/20">
            <i className="fab fa-facebook-f hover:text-white transition-colors duration-500"></i>
            <i className="fab fa-instagram hover:text-white transition-colors duration-500"></i>
            <i className="fab fa-x-twitter hover:text-white transition-colors duration-500"></i>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5 text-center">
          <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest leading-relaxed">
            By accessing this terminal, you agree to encrypted data handling and forensic transparency protocols.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;