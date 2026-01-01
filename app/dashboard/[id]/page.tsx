"use client";
import { useEffect, useState, use, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import remarkGfm from 'remark-gfm';
import {
  Save, ArrowLeft, Download, Edit3, Eye, 
  Bold, Heading1, List, Table as TableIcon, Tag, Calendar, 
  Clock, Link as LinkIcon, Share2
} from "lucide-react";
import { generatePDF } from "@/components/PDFDownloadBtn";
import ReactMarkdown from "react-markdown";

export default function ViewEditReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<any>(null);
  const [editedContent, setEditedContent] = useState("");
  const [companyName, setCompanyName] = useState("QUICKREPORT UK LTD");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState("Draft");
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const cleanForDisplay = (text: string) => {
    return text
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed.startsWith('**')) {
          return `\n${trimmed.replace(/\[(.*?)\]/g, "$1")}`;
        }
        return trimmed.replace(/\[(.*?)\]/g, "$1");
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // WPS-STYLE SHARE LOGIC
  const handleShare = async () => {
    const shareData = {
      title: `${category} Report - ${companyName}`,
      text: cleanForDisplay(editedContent),
      url: window.location.href, 
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + "\n\nLink: " + shareData.url)}`;
        window.location.href = mailtoLink;
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const applyFormat = (prefix: string, suffix: string = "") => {
    if (!textAreaRef.current) return;
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const text = editedContent;
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setEditedContent(newText);
    setTimeout(() => {
      textAreaRef.current?.focus();
      textAreaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  // REFINED LINK INSERTION
  const insertLink = () => {
  // This prompt message is handled by the browser and 
  // will show your real domain name once deployed.
  const url = prompt("Paste your link URL here (e.g., https://example.com):");
  
  if (url) {
    // Basic validation to ensure it starts with http/https
    const validUrl = url.startsWith('http') ? url : `https://${url}`;
    applyFormat("[", `](${validUrl})`);
  }
};

  useEffect(() => {
    const fetchReport = async () => {
      const { data } = await supabase.from("reports").select("*").eq("id", id).single();
      if (data) {
        setReport(data);
        setEditedContent(data.generated_report);
        if (data.category) setCategory(data.category);
        if (data.status) setStatus(data.status);
      }
    };
    fetchReport();
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase.from("reports").update({
      generated_report: editedContent,
      category: category,
      status: status
    }).eq("id", id);
    if (!error) {
      setIsEditing(false);
      setSaving(false);
      router.refresh();
    }
  };

  if (!report) return <div className="p-20 text-center font-bold text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 pb-20 antialiased font-sans">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-900 font-black uppercase text-sm tracking-tighter hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} /> History
          </button>
          <div className="flex gap-3">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-800">
                <Edit3 size={18} /> EDIT
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowPreview(!showPreview)} className="bg-slate-50 border-2 px-4 py-2.5 rounded-xl font-bold text-slate-600">
                  <Eye size={18} /> {showPreview ? "HIDE" : "PREVIEW"}
                </button>
                <button onClick={handleUpdate} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold">
                  <Save size={18} /> SAVE
                </button>
              </div>
            )}
            <button onClick={handleShare} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm">
              <Share2 size={18} /> SHARE
            </button>
            <button onClick={() => generatePDF(editedContent, companyName)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors">
              <Download size={18} /> EXPORT
            </button>
          </div>
        </div>
      </nav>

      <div className={`mx-auto transition-all ${isEditing && showPreview ? 'max-w-[1300px]' : 'max-w-[900px]'}`}>
        {isEditing && (
          <div className="bg-white border border-slate-200 mb-4 p-3 rounded-xl flex items-center gap-4 shadow-sm sticky top-[85px] z-40 mx-4">
            <div className="flex gap-1 border-r pr-3">
              <button onClick={() => applyFormat("**", "**")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700" title="Bold"><Bold size={20} /></button>
              <button onClick={() => applyFormat("# ", "")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700" title="Heading"><Heading1 size={20} /></button>
              <button onClick={() => applyFormat("- ", "")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700" title="List"><List size={20} /></button>
            </div>
            
            <div className="flex gap-1 border-r pr-3">
              <button onClick={() => applyFormat("\n| Item | Description | Status |\n|---|---|---|\n| | | |\n")} className="p-2 hover:bg-slate-100 rounded-lg text-slate-700" title="Table"><TableIcon size={20} /></button>
             <button 
  onClick={insertLink} 
  className="p-2 hover:bg-slate-100 rounded-lg text-slate-700" 
  title="Insert Link"
>
  <LinkIcon size={20} />
</button>
            </div>

            <div className="flex gap-3 items-center pl-2">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                  <option>General</option><option>Safety</option><option>Electrical</option><option>Plumbing</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer">
                  <option>Draft</option><option>Finalised</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-2xl border border-slate-200 min-h-[29.7cm] flex flex-col overflow-hidden rounded-sm">
          <div className="p-16 border-b-4 border-slate-900">
            <input className="w-full text-5xl font-black text-slate-900 uppercase tracking-tighter outline-none mb-6 border-b-2 border-transparent focus:border-blue-100 transition-colors" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <div className="flex justify-between items-end border-t border-slate-200 pt-8">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-sm"><Tag size={16} className="text-blue-600" /> {category} RECORD</p>
                <p className="flex items-center gap-2 text-slate-500 font-bold uppercase text-xs"><Clock size={16} /> {new Date(report.created_at).toLocaleDateString()}</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${status === 'Finalised' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {status}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row">
            {isEditing && (
              <div className={`p-12 bg-slate-50 border-r border-slate-100 ${showPreview ? 'md:w-1/2' : 'w-full'}`}>
                <textarea ref={textAreaRef} className="w-full h-full min-h-[700px] text-slate-900 text-xl leading-relaxed outline-none bg-transparent resize-none font-sans" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} placeholder="Start writing your report content here..." />
              </div>
            )}
            {(!isEditing || showPreview) && (
              <div className={`p-16 bg-white ${isEditing ? 'md:w-1/2' : 'w-full'}`}>
                <div className="text-slate-900 text-xl leading-[1.8] antialiased [&_a]:text-blue-600 [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_table]:mb-10 [&_th]:border [&_th]:bg-slate-50 [&_th]:p-3 [&_th]:text-left [&_td]:border [&_td]:p-3">
                  <ReactMarkdown remarkPlugins={[remarkGfm as any]}>
                    {cleanForDisplay(editedContent)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}