"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileText, Calendar, Search, Edit3, Trash2, Plus, 
  Loader2, Inbox, ArrowUpDown, AlertTriangle, Share2, 
  Download
} from "lucide-react";
import { generatePDF } from "@/components/PDFDownloadBtn";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (!error) setReports(data || []);
    setLoading(false);
  };

  const deleteReport = async (id: string) => {
    if (confirm("Are you sure?")) {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (!error) setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const deleteAllReports = async () => {
    if (confirm("DANGER: Purge ALL history?")) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from("reports").delete().eq("user_id", user.id);
        if (!error) setReports([]);
      }
    }
  };

  // LOGIC PRESERVED: Filter & Sort
  const filteredReports = reports.filter((report) => {
    const searchLower = searchQuery.toLowerCase();
    return (report.transcript?.toLowerCase().includes(searchLower) || report.generated_report?.toLowerCase().includes(searchLower));
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  // NEW: WPS-STYLE SHARE LOGIC
  const handleQuickShare = async (report: any) => {
    const shareData = {
      title: `Report: ${report.id.substring(0,8)}`,
      text: report.generated_report.substring(0, 100) + "...",
      url: `${window.location.origin}/dashboard/${report.id}`,
    };
    if (navigator.share) { await navigator.share(shareData); }
    else { window.location.href = `mailto:?subject=${shareData.title}&body=${shareData.url}`; }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-slate-50 antialiased">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="animate-in fade-in slide-in-from-left duration-500">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report History</h1>
          <p className="text-slate-600 font-medium">Manage professional site documentation.</p>
        </div>
        <Link href="/" className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-95">
          <Plus size={20} /> New Report
        </Link>
      </div>

      {/* Control Bar PRESERVED */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Search records..." className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold focus:border-blue-600 outline-none transition-all shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="md:col-span-4 relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full pl-10 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 font-bold appearance-none focus:border-blue-600 outline-none cursor-pointer shadow-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={deleteAllReports} className="flex items-center gap-1.5 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors">
          <AlertTriangle size={14} /> Purge Records
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin text-blue-700 mb-4" size={44} /><p className="text-slate-900 font-black">Syncing...</p></div>
      ) : sortedReports.length === 0 ? (
        <div className="text-center py-24 border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-white"><Inbox size={40} className="mx-auto mb-4 text-slate-300" /><h3 className="text-xl font-black text-slate-900">No reports found</h3></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedReports.map((report) => (
            <div key={report.id} className="bg-white p-5 rounded-[2rem] border-2 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl"><FileText size={24} /></div>
                <div className="truncate">
                  <Link href={`/dashboard/${report.id}`} className="font-black text-slate-900 hover:text-blue-700 text-lg block truncate">
                    {report.transcript.substring(0, 40) || "Untitled Report"}...
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Calendar size={12} /> {new Date(report.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${report.status === 'Finalised' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{report.status || 'Draft'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0">
                <button onClick={() => handleQuickShare(report)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl" title="Share"><Share2 size={20} /></button>
                <button onClick={() => router.push(`/dashboard/${report.id}`)} className="flex-1 md:flex-none px-5 py-3 bg-slate-100 text-slate-900 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all">EDIT</button>
                <button onClick={() => generatePDF(report.generated_report)} className="flex-1 md:flex-none px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all"><Download size={18} /> </button>
                <button onClick={() => deleteReport(report.id)} className="p-3 text-slate-300 hover:text-red-600"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}