

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
//   free: { limit: 2, features: ["watermark"] },
//   pro: { limit: 5, features: ["mic", "logo", "clean_pdf", "history"] },
//   business: { limit: 9999, features: ["mic", "logo", "clean_pdf", "history", "edit"] }
// };

// export default function Home() {
//   const [input, setInput] = useState("");
//   const [report, setReport] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [userStatus, setUserStatus] = useState<string>("free");
//   const [dailyCount, setDailyCount] = useState(0);
//   const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
//   const [uploading, setUploading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const recognitionRef = useRef<any>(null); // Ref to store the speech object
//   const router = useRouter();

//   const hasFeature = (feature: string) => TIER_CONFIG[userStatus]?.features.includes(feature);

//   const cleanForDisplay = (text: string) => {
//     return text.split('\n').map(line => {
//       const trimmed = line.trim();
//       if (trimmed.startsWith('#') || trimmed.startsWith('**')) {
//         return `\n${trimmed.replace(/\[(.*?)\]/g, "$1")}`; 
//       }
//       return trimmed.replace(/\[(.*?)\]/g, "$1");
//     }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
//   };

//   // --- MICROPHONE LOGIC ---
//   const toggleListening = () => {
//     if (!hasFeature("mic")) return router.push('/pricing');

//     const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Your browser does not support voice input. Please use Chrome or Edge.");
//       return;
//     }

//     if (!recognitionRef.current) {
//       const recognition = new SpeechRecognition();
//       recognition.continuous = true;
//       recognition.interimResults = true;
//       recognition.lang = "en-GB";

//       recognition.onresult = (event: any) => {
//         let finalTranscript = "";
//         for (let i = event.resultIndex; i < event.results.length; ++i) {
//           if (event.results[i].isFinal) {
//             finalTranscript += event.results[i][0].transcript;
//           }
//         }
//         if (finalTranscript) {
//           setInput((prev) => prev + (prev.length > 0 ? " " : "") + finalTranscript);
//         }
//       };

//       recognition.onend = () => setIsListening(false);
//       recognition.onerror = (err: any) => {
//         console.error("Speech error:", err);
//         setIsListening(false);
//       };
//       recognitionRef.current = recognition;
//     }

//     if (isListening) {
//       recognitionRef.current.stop();
//       setIsListening(false);
//     } else {
//       recognitionRef.current.start();
//       setIsListening(true);
//     }
//   };

//   useEffect(() => {
//     const savedReport = localStorage.getItem("last_report");
//     const savedInput = localStorage.getItem("last_input");
//     if (savedReport) setReport(savedReport);
//     if (savedInput) setInput(savedInput);

//     const syncUserAndStats = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       setUser(user);

//       if (user) {
//         const { data: profile } = await supabase
//           .from("profiles")
//           .select("status, daily_count, last_gen_date, logo_url")
//           .eq("id", user.id)
//           .single();

//         if (profile) {
//       setUserStatus(profile.status || "free");
//       setLogoUrl(profile.logo_url);
      
//       // Get today's date in YYYY-MM-DD format
//       const today = new Date().toISOString().split('T')[0];
      
//       // If the date in DB is NOT today, it means it's a new day! Reset to 0.
//       if (profile.last_gen_date !== today) {
//         setDailyCount(0);
//       } else {
//         // If it IS today, show the count stored in the database
//         setDailyCount(profile.daily_count || 0);
//       }
//     }
//       }
//     };
//     syncUserAndStats();
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("last_report", report);
//     localStorage.setItem("last_input", input);
//   }, [report, input]);

//   const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0 || !user || !hasFeature("logo")) return;
//     try {
//       setUploading(true);
//       const file = e.target.files[0];
//       const filePath = `${user.id}/logo.${file.name.split('.').pop()}`;
//       await supabase.storage.from('logos').upload(filePath, file, { upsert: true });
//       const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
//       setLogoUrl(data.publicUrl);
//       await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("id", user.id);
//     } catch (err) { console.error(err); } finally { setUploading(false); }
//   };
// const handleGenerate = async () => {
//     if (!user) {
//       alert("Please sign in to generate reports.");
//       return;
//     }

//    // Access the .limit property specifically
//     const currentTier = TIER_CONFIG[userStatus] || TIER_CONFIG.free;
//     const currentLimit = currentTier.limit;

//     // Now the comparison works because both are numbers
//     if (dailyCount >= currentLimit) {
//       router.push('/pricing');
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         body: JSON.stringify({ transcript: input }),
//       });
//       const data = await res.json();

//       if (data.report) {
//         setReport(data.report);

//         // 1. UPDATE UI IMMEDIATELY (Optimistic)
//         const newCount = dailyCount + 1;
//         setDailyCount(newCount); 

//         // 2. UPDATE DATABASE DIRECTLY (No RPC)
//         const today = new Date().toISOString().split('T')[0];
        
//         const { error: updateError } = await supabase
//           .from("profiles")
//           .update({ 
//             daily_count: newCount, 
//             last_gen_date: today 
//           })
//           .eq("id", user.id);

//         if (updateError) {
//           console.error("Credit sync failed:", updateError.message);
//         }

//         // 3. Save to History
//         await supabase.from("reports").insert({ 
//           user_id: user.id, 
//           transcript: input, 
//           generated_report: data.report 
//         });
//       }
//     } catch (err) { 
//       console.error(err); 
//     } finally { 
//       setLoading(false); 
//     }
//   };
//   return (
//     <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
//       <nav className="p-6 border-b bg-white flex justify-between items-center sticky top-0 z-50">
//         <div className="flex items-center gap-2 font-bold text-xl text-blue-700"><HardHat size={28} /> QuickReport UK</div>
//         <div className="hidden md:flex items-center gap-8 px-6">
//           <Link href="/features" className="text-sm font-black text-slate-600 uppercase tracking-widest">Features</Link>
//           <Link href="/compliance" className="text-sm font-black text-slate-600 uppercase tracking-widest">Compliance</Link>
//           <Link href="/pricing" className="text-sm font-black text-slate-900 underline decoration-blue-500 underline-offset-4 uppercase tracking-widest">Pricing</Link>
//         </div>
//         <div className="flex items-center gap-4"><UserNav /> {!user && <AuthButton />} </div>
//       </nav>

//       <section className="py-16 px-6 text-center max-w-4xl mx-auto">
//         <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
//           Turn Messy Site Notes into <span className="text-blue-600">Professional Reports</span>
//         </h1>
        
//         <div className="bg-white p-8 rounded-[32px] shadow-xl border-2 border-slate-100 text-left mb-12">
//           <div className="flex justify-between items-center mb-6">
//             <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Input Transcript</label>
//             <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-wider">
//               {userStatus === 'business' ? "Unlimited" : `${TIER_CONFIG[userStatus]?.limit - dailyCount} Credits Left`}
//             </div>
//           </div>

//           <textarea
//             className="w-full h-44 p-6 text-lg border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all mb-8 outline-none bg-slate-50/50"
//             placeholder="Describe your site progress..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//           />
          
//           <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
//             <div className="flex items-center gap-3">
//               <button 
//                 onClick={toggleListening}
//                 className={`p-4 rounded-2xl relative transition-all ${
//                   isListening ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-200' : 
//                   !hasFeature("mic") ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
//                   'bg-blue-50 text-blue-600 hover:bg-blue-100'
//                 }`}
//               >
//                 <Mic size={24} />
//                 {!hasFeature("mic") && <Lock size={12} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5" />}
//               </button>
//               <div className="flex flex-col">
//                 <span className="text-sm font-bold text-slate-700 leading-none">
//                   {isListening ? "Listening..." : "Voice Input"}
//                 </span>
//                 <span className="text-[10px] text-slate-400 font-medium">Speak your notes</span>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div 
//                 onClick={() => !hasFeature("logo") ? router.push('/pricing') : fileInputRef.current?.click()}
//                 className="h-14 w-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center hover:border-blue-500 transition-all cursor-pointer relative"
//               >
//                 {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain p-2" /> : <span className="text-2xl font-light text-slate-300">+</span>}
//                 {!hasFeature("logo") && <Lock size={10} className="absolute -top-1 -right-1 text-amber-600 bg-white rounded-full p-0.5" />}
//                 <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
//               </div>
//               <div className="flex flex-col cursor-pointer" onClick={() => !hasFeature("logo") && router.push('/pricing')}>
//                 <span className="text-sm font-bold text-slate-700 leading-none">Branding</span>
//                 <span className="text-[10px] text-slate-400 font-medium">Upload Logo (Pro)</span>
//               </div>
//             </div>
//           </div>

//           <button onClick={handleGenerate} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg">
//             {loading ? "AI is processing..." : <><Zap size={22} fill="currentColor" /> Generate Official Report</>}
//           </button>
//         </div>

//         {report && (
//           <div className="mt-10 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden text-left">
//             <div className="bg-slate-900 px-8 py-6">
//               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//                 <h3 className="text-white font-black flex items-center gap-2 uppercase tracking-widest text-sm">
//                   <FileText size={18} /> Official Record
//                 </h3>
                
//                 <div className="flex flex-wrap gap-3">
//                   <button 
//                     onClick={() => !hasFeature("clean_pdf") ? router.push('/pricing') : generatePDF(report, "QUICKREPORT UK", userStatus, logoUrl)}
//                     className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
//                   >
//                     <ShieldCheck size={14} /> Clean PDF (Pro)
//                   </button>
//                   <button 
//                     onClick={() => generatePDF(report, "QUICKREPORT UK", "free")}
//                     className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-600 transition-all font-black text-[10px] uppercase tracking-widest"
//                   >
//                     <Download size={14} /> Export with Watermark
//                   </button>
//                 </div>
//               </div>
//             </div>
//             <div className="p-10 md:p-16 relative">
//               {hasFeature("edit") && (
//                 <button className="absolute top-4 right-4 text-blue-600 flex items-center gap-1 text-xs font-bold uppercase">
//                   <Edit size={14} /> Edit Mode
//                 </button>
//               )}
//               <ReactMarkdown
//                 components={{
//                   h1: ({node, ...props}) => <h1 className="text-4xl font-black text-slate-900 mb-6" {...props} />,
//                   h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 uppercase border-b pb-2" {...props} />,
//                   p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-lg text-slate-700" {...props} />,
//                 }}
//               >
//                 {cleanForDisplay(report)}
//               </ReactMarkdown>
//             </div>
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }

"use client";
import { useEffect, useState, useRef } from "react";
import { HardHat, FileText, Download, Zap, ShieldCheck, Mic, History, Edit, Image as ImageIcon } from "lucide-react";
import { generatePDF } from "@/components/PDFDownloadBtn";
import { supabase } from "@/lib/supabase";
import UserNav from "@/components/UserNav";
import AuthButton from "@/components/AuthButton";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

// Tier Logic Configuration (Kept for structure, but bypassed for testing)
const TIER_CONFIG: Record<string, { limit: number; features: string[] }> = {
  free: { limit: 9999, features: ["mic", "logo", "clean_pdf", "history", "edit", "watermark"] },
  pro: { limit: 9999, features: ["mic", "logo", "clean_pdf", "history", "edit"] },
  business: { limit: 9999, features: ["mic", "logo", "clean_pdf", "history", "edit"] }
};

export default function Home() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<string>("business"); // Set to business for full testing access
  const [dailyCount, setDailyCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  // For testing: This always returns true
  const hasFeature = (feature: string) => true;

  const cleanForDisplay = (text: string) => {
    return text.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || trimmed.startsWith('**')) {
        return `\n${trimmed.replace(/\[(.*?)\]/g, "$1")}`; 
      }
      return trimmed.replace(/\[(.*?)\]/g, "$1");
    }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-GB";
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInput((prev) => prev + (prev.length > 0 ? " " : "") + finalTranscript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); } 
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const syncUserAndStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, daily_count, last_gen_date, logo_url")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUserStatus("business"); // Force business status for testing
        setLogoUrl(profile.logo_url);
        setDailyCount(profile.daily_count || 0);
      }
    }
  };

  useEffect(() => {
    const savedReport = localStorage.getItem("last_report");
    const savedInput = localStorage.getItem("last_input");
    if (savedReport) setReport(savedReport);
    if (savedInput) setInput(savedInput);
    syncUserAndStats();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    try {
      setUploading(true);
      const file = e.target.files[0];
      const filePath = `${user.id}/logo.${file.name.split('.').pop()}`;
      await supabase.storage.from('logos').upload(filePath, file, { upsert: true });
      const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
      setLogoUrl(data.publicUrl);
      await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("id", user.id);
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const handleGenerate = async () => {
    if (!user) return alert("Please sign in.");
    
    setLoading(true);
    try {
      // Direct update for testing instead of RPC to bypass all server-side limits
      const newCount = dailyCount + 1;
      const today = new Date().toISOString().split('T')[0];
      
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ transcript: input }),
      });
      const data = await res.json();

      if (data.report) {
        setReport(data.report);
        setDailyCount(newCount);
        
        await supabase.from("profiles").update({ 
          daily_count: newCount, 
          last_gen_date: today 
        }).eq("id", user.id);

        await supabase.from("reports").insert({ 
          user_id: user.id, 
          transcript: input, 
          generated_report: data.report 
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* <nav className="p-6 border-b bg-white flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-700"><HardHat size={28} /> QuickReport UK</div>
        <div className="hidden md:flex items-center gap-8 px-6">
          <Link href="/features" className="text-sm font-black text-slate-600 uppercase tracking-widest">Features</Link>
          <Link href="/compliance" className="text-sm font-black text-slate-600 uppercase tracking-widest">Compliance</Link>
          <Link href="/pricing" className="text-sm font-black text-slate-900 underline decoration-blue-500 underline-offset-4 uppercase tracking-widest">Pricing</Link>
        </div>
        <div className="flex items-center gap-4"><UserNav /> {!user && <AuthButton />} </div>
      </nav> */}

      <section className="py-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          TEST MODE: <span className="text-blue-600">All Features Unlocked</span>
        </h1>
        
        <div className="bg-white p-8 rounded-[32px] shadow-xl border-2 border-slate-100 text-left mb-12">
          <div className="flex justify-between items-center mb-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Input Transcript</label>
            <div className="bg-green-50 border border-green-100 px-3 py-1 rounded-full text-[10px] font-black text-green-600 uppercase tracking-wider">
              Unlimited Test Credits
            </div>
          </div>

          <textarea
            className="w-full h-44 p-6 text-lg border-2 border-slate-50 rounded-2xl focus:border-blue-500 transition-all mb-8 outline-none bg-slate-50/50"
            placeholder="Describe your site progress..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleListening}
                className={`p-4 rounded-2xl relative transition-all ${isListening ? 'bg-red-50 text-red-600 animate-pulse ring-2 ring-red-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
              >
                <Mic size={24} />
              </button>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 leading-none">Voice Input</span>
                <span className="text-[10px] text-slate-400 font-medium">{isListening ? "Listening..." : "Unlocked"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-14 w-14 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center hover:border-blue-500 transition-all cursor-pointer relative"
              >
                {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain p-2" /> : <span className="text-2xl font-light text-slate-300">+</span>}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
              <div className="flex flex-col cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <span className="text-sm font-bold text-slate-700 leading-none">Branding</span>
                <span className="text-[10px] text-slate-400 font-medium">Unlocked</span>
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg">
            {loading ? "AI is processing..." : <><Zap size={22} fill="currentColor" /> Generate Official Report</>}
          </button>
        </div>

        {report && (
          <div className="mt-10 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden text-left">
            <div className="bg-slate-900 px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-white font-black flex items-center gap-2 uppercase tracking-widest text-sm">
                  <FileText size={18} /> Official Record
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => generatePDF(report, "QUICKREPORT UK", "business", logoUrl)}
                    className="flex items-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                  >
                    <ShieldCheck size={14} /> Clean PDF
                  </button>
                  <button 
                    onClick={() => generatePDF(report, "QUICKREPORT UK", "free")}
                    className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-600 transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <Download size={14} /> Export (Watermarked)
                  </button>
                </div>
              </div>
            </div>
            <div className="p-10 md:p-16 relative">
              <button className="absolute top-4 right-4 text-blue-600 flex items-center gap-1 text-xs font-bold uppercase">
                <Edit size={14} /> Edit Mode Unlocked
              </button>
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-black text-slate-900 mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3 uppercase border-b pb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-lg text-slate-700" {...props} />,
                }}
              >
                {cleanForDisplay(report)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}