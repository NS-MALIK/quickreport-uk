import { Mic, Shield, Zap, FileText, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Features() {
  const features = [
    {
      title: "AI Voice-to-Report",
      desc: "Speak naturally. Our AI extracts key data from your voice notes, filtering out site noise to create structured HSE records.",
      icon: <Mic className="text-blue-600" size={32} />,
      pro: true
    },
    {
      title: "HSE Framework Alignment",
      desc: "Automatically organizes notes into Job Details, Progress, Materials, and Safety Observations following UK standards.",
      icon: <Shield className="text-green-600" size={32} />,
      pro: false
    },
    {
      title: "Corporate Branding",
      desc: "Upload your company logo. Every PDF generated will feature your high-resolution header for a professional finish.",
      icon: <ImageIcon className="text-purple-600" size={32} />,
      pro: true
    },
    {
      title: "Instant PDF Generation",
      desc: "Convert site data into a formatted, downloadable PDF in seconds. No more manual typing back at the office.",
      icon: <Zap className="text-yellow-600" size={32} />,
      pro: false
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-slate-900 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Tools Built for <span className="text-blue-400">UK Construction</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop wasting hours on paperwork. QuickReport UK turns site observations into professional documents instantly.
        </p>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-2 gap-10">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-500 transition-all bg-white shadow-sm">
              <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-blue-50 transition-colors">
                {f.icon}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-slate-900">{f.title}</h3>
                {f.pro && (
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-tighter">
                    Pro Feature
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-blue-50 p-12 rounded-[40px]">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Ready to streamline your site records?</h2>
          <Link href="/" className="inline-block bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-800 transition-all">
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}