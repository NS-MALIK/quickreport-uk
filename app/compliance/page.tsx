import { Lock, FileCheck, Scale, ShieldAlert } from "lucide-react";

export default function Compliance() {
  return (
    <div className="bg-slate-50 min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto bg-white p-10 md:p-16 rounded-[32px] shadow-xl border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-green-100 p-3 rounded-2xl">
            <ShieldAlert className="text-green-700" size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Legal & Compliance</h1>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="text-blue-600" size={24} /> Data Privacy (UK GDPR)
            </h2>
            <p className="text-lg text-slate-600 leading-8">
              QuickReport UK adheres to strict data protection protocols. Your site transcripts and generated reports are 
              <span className="text-slate-900 font-bold"> encrypted at rest </span> 
              and are never used to train public third-party AI models. We process data in compliance with the UK Data Protection Act 2018.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileCheck className="text-blue-600" size={24} /> HSE Standard Reporting
            </h2>
            <p className="text-lg text-slate-600 leading-8">
              Our AI templates are structured to follow the <span className="text-slate-900 font-bold underline decoration-blue-500">Health and Safety at Work etc. Act 1974</span> requirements. 
              The tool ensures that key data points—such as safety observations and material usage—are captured for formal record-keeping.
            </p>
          </section>

          {/* Section 3 - Disclaimer */}
          <section className="bg-slate-900 text-white p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-blue-400">
              <Scale size={20} /> Legal Disclaimer
            </h3>
            <p className="text-slate-300 leading-7 text-sm italic">
              QuickReport UK is a productivity assistant designed to help format site notes. It does not constitute legal or safety advice. 
              Site Managers and HSE Officers must review all generated content to ensure it accurately reflects the site conditions before 
              final submission to regulatory bodies.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            Last Updated: December 2024 • QuickReport UK Compliance Team
          </p>
        </div>
      </div>
    </div>
  );
}