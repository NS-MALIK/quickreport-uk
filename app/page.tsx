// "use client";
// import { useEffect, useState, useRef } from "react";
// import { HardHat, FileText, Download, Zap, ShieldCheck, Mic, Lock, History, Edit, Image as ImageIcon } from "lucide-react";
// import { generatePDF } from "@/components/PDFDownloadBtn";
// import { supabase } from "@/lib/supabase";
// import UserNav from "@/components/UserNav";
// import AuthButton from "@/components/AuthButton";
// import { useRouter } from "next/navigation";
// import ReactMarkdown from "react-markdown";
// import Link from "next/link";

// // Tier Logic Configuration
// const TIER_CONFIG: Record<string, { limit: number; features: string[] }> = {
//     free: { limit: 2, features: ["watermark"] },
//     pro: { limit: 5, features: ["mic", "logo", "clean_pdf", "history"] },
//     business: { limit: 9999, features: ["mic", "logo", "clean_pdf", "history", "edit"] }
// };

// export default function Home() {
//     const [input, setInput] = useState("");
//     const [report, setReport] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [user, setUser] = useState<any>(null);
//     const [userStatus, setUserStatus] = useState<string>("free");
//     const [dailyCount, setDailyCount] = useState<number | null>(null); // Start as null to prevent flicker
//     const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
//     const [uploading, setUploading] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const recognitionRef = useRef<any>(null);
//     const router = useRouter();

//     const hasFeature = (feature: string) => TIER_CONFIG[userStatus]?.features.includes(feature);

//     const cleanForDisplay = (text: string) => {
//         return text.split('\n').map(line => {
//             const trimmed = line.trim();
//             if (trimmed.startsWith('#') || trimmed.startsWith('**')) {
//                 return `\n${trimmed.replace(/\[(.*?)\]/g, "$1")}`;
//             }
//             return trimmed.replace(/\[(.*?)\]/g, "$1");
//         }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
//     };

//     // --- MICROPHONE LOGIC ---
//     const toggleListening = () => {
//         if (!hasFeature("mic")) return router.push('/pricing');

//         const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//         if (!SpeechRecognition) {
//             alert("Your browser does not support voice input. Please use Chrome or Edge.");
//             return;
//         }

//         if (!recognitionRef.current) {
//             const recognition = new SpeechRecognition();
//             recognition.continuous = true;
//             recognition.interimResults = true;
//             recognition.lang = "en-GB";

//             recognition.onresult = (event: any) => {
//                 let finalTranscript = "";
//                 for (let i = event.resultIndex; i < event.results.length; ++i) {
//                     if (event.results[i].isFinal) {
//                         finalTranscript += event.results[i][0].transcript;
//                     }
//                 }
//                 if (finalTranscript) {
//                     setInput((prev) => prev + (prev.length > 0 ? " " : "") + finalTranscript);
//                 }
//             };

//             recognition.onend = () => setIsListening(false);
//             recognition.onerror = (err: any) => {
//                 console.error("Speech error:", err);
//                 setIsListening(false);
//             };
//             recognitionRef.current = recognition;
//         }

//         if (isListening) {
//             recognitionRef.current.stop();
//             setIsListening(false);
//         } else {
//             recognitionRef.current.start();
//             setIsListening(true);
//         }
//     };

//     useEffect(() => {
//         const savedReport = localStorage.getItem("last_report");
//         const savedInput = localStorage.getItem("last_input");
//         if (savedReport) setReport(savedReport);
//         if (savedInput) setInput(savedInput);

//         const syncUserAndStats = async () => {
//             try {
//                 const { data: { user } } = await supabase.auth.getUser();
//                 setUser(user);

//                 if (user) {
//                     const { data: profile, error } = await supabase
//                         .from("profiles")
//                         .select("status, daily_count, last_gen_date, logo_url")
//                         .eq("id", user.id)
//                         .single();

//                     if (error) {
//                         console.error("Error fetching profile:", error.message);
//                         setDailyCount(0); // Default to 0 if error
//                         return;
//                     }

//                     if (profile) {
//                         setUserStatus(profile.status || "free");
//                         setLogoUrl(profile.logo_url);

//                         const today = new Date().toISOString().split('T')[0];
//                         if (profile.last_gen_date !== today) {
//                             setDailyCount(0);
//                         } else {
//                             setDailyCount(profile.daily_count || 0);
//                         }
//                     }
//                 } else {
//                     setDailyCount(0); // Not logged in
//                 }
//             } catch (err) {
//                 console.error("Sync error:", err);
//                 setDailyCount(0);
//             }
//         };
//         syncUserAndStats();
//     }, []);

//     useEffect(() => {
//         localStorage.setItem("last_report", report);
//         localStorage.setItem("last_input", input);
//     }, [report, input]);

//     const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (!e.target.files || e.target.files.length === 0 || !user || !hasFeature("logo")) return;
//         try {
//             setUploading(true);
//             const file = e.target.files[0];
//             const filePath = `${user.id}/logo.${file.name.split('.').pop()}`;
//             await supabase.storage.from('logos').upload(filePath, file, { upsert: true });
//             const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
//             setLogoUrl(data.publicUrl);
//             await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("id", user.id);
//         } catch (err) { console.error(err); } finally { setUploading(false); }
//     };

//     const handleGenerate = async () => {
//         if (!user) {
//             alert("Please sign in to generate reports.");
//             return;
//         }

//         const currentTier = TIER_CONFIG[userStatus] || TIER_CONFIG.free;
//         if (dailyCount !== null && dailyCount >= currentTier.limit) {
//             router.push('/pricing');
//             return;
//         }

//         setLoading(true);
//         try {
//             const { data: rpcData, error: rpcError } = await supabase.rpc('increment_daily_count', { user_id: user.id });

//             if (rpcError || !rpcData.success) {
//                 console.error("Credit check failed:", rpcError || rpcData.error);
//                 router.push('/pricing');
//                 setLoading(false);
//                 return;
//             }

//             const res = await fetch("/api/generate", {
//                 method: "POST",
//                 body: JSON.stringify({ transcript: input }),
//             });
//             const data = await res.json();

//             if (data.report) {
//                 setReport(data.report);
//                 setDailyCount(rpcData.new_count);

//                 await supabase.from("reports").insert({
//                     user_id: user.id,
//                     transcript: input,
//                     generated_report: data.report
//                 });
//             }
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">


//             <section className="py-16 px-6 text-center max-w-4xl mx-auto">
//                 <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
//                     Turn Messy Site Notes into <span className="text-blue-600">Professional Reports</span>
//                 </h1>

//                 <div className="bg-white p-8 rounded-[32px] shadow-xl border-2 border-slate-100 text-left mb-12">
//                     <div className="flex justify-between items-center mb-6">
//                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Input Transcript</label>
//                         <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-wider">
//                             {userStatus === 'business'
//                                 ? "Unlimited"
//                                 : dailyCount === null
//                                     ? "Loading..."
//                                     : `${TIER_CONFIG[userStatus]?.limit - dailyCount} Credits Left`}
//                         </div>
//                     </div>

//                     <textarea
//                         className="w-full h-44 p-6 text-lg border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all mb-8 outline-none bg-slate-50/50"
//                         placeholder="Describe your site progress..."
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                     />

//                     <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={toggleListening}
//                                 className={`p-4 rounded-2xl relative transition-all ${isListening ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-200' :
//                                         !hasFeature("mic") ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
//                                             'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                                     }`}
//                             >
//                                 <Mic size={24} />
//                                 {!hasFeature("mic") && <Lock size={12} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5" />}
//                             </button>
//                             <div className="flex flex-col">
//                                 <span className="text-sm font-bold text-slate-700 leading-none">
//                                     {isListening ? "Listening..." : "Voice Input"}
//                                 </span>
//                                 <span className="text-[10px] text-slate-400 font-medium">Speak your notes</span>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             <div
//                                 onClick={() => !hasFeature("logo") ? router.push('/pricing') : fileInputRef.current?.click()}
//                                 className="h-14 w-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center hover:border-blue-500 transition-all cursor-pointer relative"
//                             >
//                                 {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain p-2" /> : <span className="text-2xl font-light text-slate-300">+</span>}
//                                 {!hasFeature("logo") && <Lock size={10} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5" />}
//                                 <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
//                             </div>
//                             <div className="flex flex-col cursor-pointer" onClick={() => !hasFeature("logo") && router.push('/pricing')}>
//                                 <span className="text-sm font-bold text-slate-700 leading-none">Branding</span>
//                                 <span className="text-[10px] text-slate-400 font-medium">Upload Logo (Pro)</span>
//                             </div>
//                         </div>
//                     </div>

//                     <button onClick={handleGenerate} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg">
//                         {loading ? "AI is processing..." : <><Zap size={22} fill="currentColor" /> Generate Official Report</>}
//                     </button>
//                 </div>

//                 {report && (
//                     <div className="mt-10 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden text-left">
//                         <div className="bg-slate-900 px-8 py-6">
//                             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//                                 <h3 className="text-white font-black flex items-center gap-2 uppercase tracking-widest text-sm">
//                                     <FileText size={18} /> Official Record
//                                 </h3>

//                                 <div className="flex flex-wrap gap-3">
//                                     <button
//                                         onClick={() => !hasFeature("clean_pdf") ? router.push('/pricing') : generatePDF(report, "QUICKREPORT UK", userStatus, logoUrl)}
//                                         className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
//                                     >
//                                         <ShieldCheck size={14} /> Clean PDF (Pro)
//                                     </button>
//                                     <button
//                                         onClick={() => generatePDF(report, "QUICKREPORT UK", "free")}
//                                         className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-600 transition-all font-black text-[10px] uppercase tracking-widest"
//                                     >
//                                         <Download size={14} /> Export with Watermark
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="p-10 md:p-16 relative">
//                             {hasFeature("edit") && (
//                                 <button className="absolute top-4 right-4 text-blue-600 flex items-center gap-1 text-xs font-bold uppercase">
//                                     <Edit size={14} /> Edit Mode
//                                 </button>
//                             )}
//                             <ReactMarkdown
//                                 components={{
//                                     h1: ({ node, ...props }) => <h1 className="text-4xl font-black text-slate-900 mb-6" {...props} />,
//                                     h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 uppercase border-b pb-2" {...props} />,
//                                     p: ({ node, ...props }) => <p className="mb-4 leading-relaxed text-lg text-slate-700" {...props} />,
//                                 }}
//                             >
//                                 {cleanForDisplay(report)}
//                             </ReactMarkdown>
//                         </div>
//                     </div>
//                 )}
//             </section>
//         </main>
//     );
// }


"use client";
import { useEffect, useState, useRef } from "react";
import { HardHat, FileText, Zap, ShieldCheck, Mic, Edit, Image as ImageIcon } from "lucide-react";
import { generatePDF } from "@/components/PDFDownloadBtn";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userStatus] = useState<string>("business"); // Testing: Always unlocked
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- IMPROVED VOICE LOGIC ---
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-GB";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            // Append final results to the input
            const result = event.results[i][0].transcript;
            setInput((prev) => prev + (prev.length > 0 ? " " : "") + result);
          } else {
            // Track interim results (optional: you could display these in a preview)
            currentTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        alert("Microphone access blocked. Please click the lock icon in your browser address bar and set Microphone to 'Allow'.");
      }
      
      setIsListening(false);
    };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Start error:", err);
      }
    }
  };

  // --- LOGO UPLOAD ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const filePath = `${user.id}/logo-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('logos').upload(filePath, file);
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
      setLogoUrl(data.publicUrl);
      await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("id", user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("logo_url").eq("id", user.id).single();
        if (data?.logo_url) setLogoUrl(data.logo_url);
      }
    };
    sync();
    // Cleanup mic on unmount
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  const handleGenerate = async () => {
    if (!user) return alert("Sign in first.");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ transcript: input }),
      });
      const data = await res.json();
      if (data.report) setReport(data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-black mb-8 text-center">
          TEST MODE: <span className="text-blue-600">Voice & Logo Unlocked</span>
        </h1>

        <div className="bg-white p-8 rounded-[32px] shadow-xl border-2 border-slate-100">
          <textarea
            className="w-full h-44 p-6 text-lg border-2 border-slate-50 rounded-2xl mb-8 outline-none bg-slate-50/50 focus:border-blue-500 transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Click the mic and start talking..."
          />

          <div className="flex flex-wrap gap-6 mb-8">
            {/* Mic Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleListening}
                className={`p-5 rounded-2xl transition-all ${
                  isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Mic size={28} />
              </button>
              <div>
                <p className="font-bold text-slate-700">Voice Input</p>
                <p className="text-xs text-slate-400">{isListening ? "Listening... Speak now" : "Click to speak"}</p>
              </div>
            </div>

            {/* Logo Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-16 w-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center hover:border-blue-500 transition-all overflow-hidden"
              >
                {logoUrl ? <img src={logoUrl} className="p-2 object-contain" /> : <ImageIcon className="text-slate-300" />}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </button>
              <div>
                <p className="font-bold text-slate-700">Company Logo</p>
                <p className="text-xs text-slate-400">{uploading ? "Uploading..." : "Test branding"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? "AI is processing..." : <><Zap size={22} fill="currentColor" /> Generate Report</>}
          </button>
        </div>

        {report && (
          <div className="mt-12 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <span className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <FileText size={18} /> Generated Record
              </span>
              <button
                onClick={() => generatePDF(report, "QuickReport-Uk TEST CO", "business", logoUrl)}
                className="bg-amber-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase hover:bg-amber-600 transition-all"
              >
                <ShieldCheck size={16} className="inline mr-2" /> Download Clean PDF
              </button>
            </div>
            <div className="p-12 prose max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}