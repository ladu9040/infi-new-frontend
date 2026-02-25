import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TransIntro: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  const companyDetails = `Welcome to INFI Logistics. We are a next-generation logistics platform dedicated to revolutionizing the transport industry. Our mission is to provide seamless, efficient, and transparent logistics solutions for transporters and vendors alike. With state-of-the-art tracking, easy bidding, and automated documentation, we empower your business to move forward faster. Experience the future of logistics with INFI.`;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(companyDetails.slice(0, i + 1));
      i++;
      if (i >= companyDetails.length) {
        clearInterval(interval);
        setIsFinished(true);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    navigate('/trans-dashboard');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-start justify-start p-12 lg:p-24 font-sans overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/Trucks-port-containers.jpg")' }}
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-400 via-yellow-200/90 to-transparent"
      />

      <div className="w-full max-w-6xl z-10 mt-12">
        <div className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-black font-medium tracking-tight text-left">
          {displayText}
          <span className="inline-block w-1.5 h-6 md:w-2 md:h-10 bg-black ml-2 animate-pulse align-middle" />
        </div>
      </div>

      <button
        onClick={handleSkip}
        className={`fixed bottom-10 right-10 flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transform active:scale-95 transition-all z-20 ${
          isFinished 
            ? 'bg-black text-white hover:bg-gray-900 ring-4 ring-black/20 scale-110' 
            : 'bg-white/80 backdrop-blur-md text-black hover:bg-white border-2 border-black/5'
        }`}
      >
        <span>{isFinished ? 'Get Started' : 'Skip Intro'}</span>
        <span className="text-xl">→</span>
      </button>
    </div>
  );
};

export default TransIntro;

