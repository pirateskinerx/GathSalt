
import React, { useState, useRef } from 'react';
import gsap from 'gsap';

interface MediaKitProps {
  onCapture: (base64: string, mime: string) => void;
  isProcessing: boolean;
}

const MediaKit: React.FC<MediaKitProps> = ({ onCapture, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onCapture(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative w-full border-2 border-dashed transition-all duration-700 p-16 flex flex-col items-center justify-center gap-8 ${
        dragActive ? 'border-sage bg-sage/5 scale-[1.02]' : 'border-white/5 bg-white/[0.005]'
      } ${isProcessing ? 'opacity-30 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-4">
           <i className={`fas ${isProcessing ? 'fa-sync-alt fa-spin' : 'fa-plus'} text-sage`}></i>
        </div>
        <span className="text-[12px] font-black tracking-[0.6em] uppercase text-white italic">
          Universal Media Kit
        </span>
        <p className="text-[10px] font-mono text-white/20 uppercase max-w-xs leading-relaxed">
          DRAG OR CLICK TO SYNC SHARING FROM MOBILE OS (SCREENSHOTS / EXPORTS)
        </p>
      </div>

      <div className="flex gap-10 mt-4 opacity-20">
        <i className="facebook text-xs"></i>
        <i className="fab fa-instagram text-xs"></i>
        <i className="fab fa-x-twitter text-xs"></i>
        <i className="fas fa-camera text-xs"></i>
      </div>

      {dragActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-sage text-[40px] font-black italic uppercase tracking-tighter animate-pulse">
            Drop_Node
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaKit;
