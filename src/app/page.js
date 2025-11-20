'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function VoiceChallenge() {
  const [status, setStatus] = useState('Klik tombol mic...');
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [flag, setFlag] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); 
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setStatus('Browser tidak support.');
      }
    }
  }, []);

  const processVoice = async (finalTranscript) => {
    const cleanTranscript = finalTranscript.replace(/\s/g, '').toLowerCase();
    setStatus('Hmm...?');
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt: cleanTranscript }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setStatus('Success!');
        setFlag(data.flag);
        setLiveText(''); 
      } else {
        setStatus('Maaf, kurang jelas...');
        setTimeout(() => {
            if (!isSuccess) setLiveText('');
        }, 2000);
      }
    } catch (error) {
      setStatus('Server Error.');
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (!isSupported || isSuccess) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      recognitionRef.current?.stop();
      return; 
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true; 

    recognition.onstart = () => {
      setIsListening(true);
      setLiveText('');
      setStatus('Mendengarkan...');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          processVoice(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (!isSuccess) setLiveText(finalTranscript || interimTranscript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100 font-sans relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* --- KARTU UTAMA --- */}
      <div className="z-10 w-full max-w-2xl flex flex-col shadow-[0_20px_60px_-15px_rgba(236,72,153,0.3)] rounded-[2.5rem] overflow-hidden border-4 border-white bg-white">
        
        {/* AREA GAMBAR */}
        <div className="relative w-full h-[380px] md:h-[480px] bg-pink-50">
           {!isSuccess ? (
             <Image 
               src="/waguri.webp"
               alt="Karakter Normal"
               fill
               className="object-cover object-top transition-transform duration-700 hover:scale-105"
               priority
             />
           ) : (
             <Image 
                src="/inikah_my.png"
                alt="Karakter Malu"
                fill
                className="object-cover object-top animate-fadeIn"
                priority
             />
           )}
           
           <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent"></div>
           
           <div className="absolute bottom-6 left-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-pink-500/30 border-2 border-white transform -rotate-2">
              <span>WAGURI-CHAN</span>
           </div>
        </div>

        {/* AREA DIALOG BOX */}
        <div className="bg-white p-8 relative">
            
            <div className="min-h-[90px] mb-2">
                {!isSuccess && (
                    <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium animate-pulse">
                       {liveText ? `"${liveText}..."` : "Nee... kamu mau ngomong apa? Katakan padaku..."}
                    </p>
                )}

                {isSuccess && (
                    <div className="animate-fadeIn">
                        <p className="text-pink-500 font-bold text-2xl mb-2">
                            "Eh?! K-kamu... I- I love you too!" ❤️
                        </p>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">
                            *Affection Level Max achieved*
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end border-t-2 border-pink-50 pt-6 mt-4">
                
                <div className="flex flex-col justify-end">
                    <p className={`text-xs font-bold uppercase tracking-widest ${
                        isListening ? 'text-rose-500 animate-pulse' : 
                        isSuccess ? 'text-pink-500' : 'text-slate-400'
                    }`}>
                        {status}
                    </p>
                </div>

                <button
                    onClick={toggleListening}
                    disabled={isSuccess || !isSupported}
                    className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg border-4 border-white
                    ${isListening 
                        ? 'bg-rose-500 text-white animate-pulse shadow-rose-300' 
                        : 'bg-pink-100 text-pink-500 hover:bg-pink-500 hover:text-white hover:shadow-pink-300/50 hover:scale-110'}
                    ${isSuccess ? 'hidden' : 'block'}
                    `}
                >
                    <span className="text-2xl">{isListening ? '⬛' : '🎙️'}</span>
                </button>
            </div>

            {flag && (
                <div className="mt-6 p-5 bg-pink-50 border-2 border-pink-200 border-dashed rounded-2xl text-center animate-[bounce_1s_infinite]">
                    <p className="text-pink-400 text-[10px] uppercase tracking-[0.2em] mb-2 font-bold">💖 Secret Gift Unlocked 💖</p>
                    <code className="text-lg md:text-xl font-mono font-bold text-pink-600 select-all break-all">
                    {flag}
                    </code>
                </div>
            )}
        </div>

      </div>
      
      <div className="mt-10 text-[10px] text-pink-400/60 tracking-widest font-bold">
        udah nge-bf rockyou.txt kan? ucapin ke waguri-chan ya!
      </div>
    </main>
  );
}