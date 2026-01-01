"use client";
import { useState } from "react";
import { Check, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: "0",
      features: ["2 Reports / day", "Standard PDF Export", "Basic Editing Tools", "Community Support"],
      buttonText: "Current Plan",
      highlight: false
    },
    {
      name: "Pro",
      price: isAnnual ? "15" : "19",
      features: ["10 Reports /day", "Custom Company Branding", "Advanced Table Rendering", "Live Share Links", "Priority Support"],
      buttonText: "Upgrade to Pro",
      highlight: true
    },
    {
      name: "Business",
      price: isAnnual ? "45" : "59",
      features: ["Team Management", "Audit Log History", "API Access", "Dedicated Manager", "Compliance Training"],
      buttonText: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 antialiased">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Simple Pricing</h1>
        <p className="text-xl text-slate-600 font-bold mb-12">Professional reporting tools for every stage of your business.</p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`font-black uppercase text-xs ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-slate-900 rounded-full p-1 transition-all relative"
          >
            <div className={`w-6 h-6 bg-white rounded-full transition-all ${isAnnual ? 'ml-6' : 'ml-0'}`} />
          </button>
          <span className={`font-black uppercase text-xs ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Yearly (Save 20%)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`p-10 rounded-[3rem] border-4 transition-all ${plan.highlight ? 'border-blue-600 bg-white shadow-2xl scale-105 z-10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">{plan.name}</h3>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                <span className="text-slate-400 font-bold">/mo</span>
              </div>
              <ul className="text-left space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 font-bold text-slate-700">
                    <Check size={18} className="text-green-500" /> {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${plan.highlight ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}