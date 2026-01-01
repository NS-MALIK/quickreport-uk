import Link from "next/link";
import { HardHat, ShieldCheck, Mail, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <HardHat className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              QUICKREPORT <span className="text-blue-500">UK</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            The leading AI-powered site reporting tool for UK construction and HSE professionals. 
            Built for accuracy, speed, and compliance.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Product</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
            <li><Link href="/compliance" className="hover:text-blue-400 transition-colors">HSE Compliance</Link></li>
          </ul>
        </div>

        {/* Legal & Trust */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal & Safety</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li>
               <div className="flex items-center gap-2 text-green-500 text-xs font-bold mt-2">
                 <ShieldCheck size={14} /> 
                 <span>GDPR COMPLIANT</span>
               </div>
            </li>
          </ul>
        </div>

        {/* Contact/Support */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Support</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-blue-500" />
              <span>support@quickreport.uk</span>
            </li>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-all">
                <Linkedin size={18} className="text-white" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-400 transition-all">
                <Twitter size={18} className="text-white" />
              </Link>
            </div>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © {currentYear} QuickReport UK. All rights reserved. Registered in England & Wales.
        </p>
        <div className="flex gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <span>Encrypted Data Processing</span>
          <span>No AI Training on User Data</span>
        </div>
      </div>
    </footer>
  );
}