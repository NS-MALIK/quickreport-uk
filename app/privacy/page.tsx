import { Lock, EyeOff, Server, ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-[32px] shadow-sm border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">Privacy & Data Safety</h1>
        
        <div className="space-y-10">
          <section className="flex gap-4">
            <div className="bg-blue-100 p-3 rounded-xl h-fit">
              <Lock className="text-blue-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Encryption</h3>
              <p className="text-slate-600 leading-relaxed">
                All site transcripts are encrypted using <strong>AES-256 bit encryption</strong>. Your data is protected both during transit and while stored in our database.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="bg-red-100 p-3 rounded-xl h-fit">
              <EyeOff className="text-red-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No AI Training</h3>
              <p className="text-slate-600 leading-relaxed">
                We respect trade secrets. Unlike public AI tools, <strong>we do not use your reports to train</strong> or improve our AI models. Your site notes remain your property.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="bg-green-100 p-3 rounded-xl h-fit">
              <Server className="text-green-700" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">UK-Based Data Processing</h3>
              <p className="text-slate-600 leading-relaxed">
                Our infrastructure is optimized for UK compliance, ensuring your digital records meet the standard for <strong>HSE audit trails</strong>.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 bg-slate-900 rounded-2xl">
          <p className="text-white text-sm text-center font-medium flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-blue-400" /> 
            Fully GDPR Compliant Data Management
          </p>
        </div>
      </div>
    </div>
  );
}