"use client";
import { useState } from "react";

export default function ReportForm() {
  const [input, setInput] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ transcript: input }),
      });
      const data = await response.json();
      setReport(data.report);
    } catch (error) {
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">New Site Report</h2>
      
      <textarea
        className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
        placeholder="Paste your voice transcript here (e.g., 'Finished the wiring at London site, no issues...')"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
      >
        {loading ? "Generating Report..." : "Generate Professional Report"}
      </button>

      {report && (
        <div className="mt-8 p-4 bg-gray-50 border-l-4 border-blue-600 rounded">
          <h3 className="font-bold text-lg mb-2">AI Generated Preview:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
            {report}
          </pre>
        </div>
      )}
    </div>
  );
}