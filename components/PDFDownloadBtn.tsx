import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Ensure this is installed: npm install jspdf-autotable

export const generatePDF = (content: string, company: string = "QUICKREPORT UK", userStatus: string = "free",logoUrl?: string) => {
  
  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
  });

  const today = new Date().toLocaleDateString('en-GB');
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursorY = 80;
if (userStatus === "pro" && logoUrl) {
    // x: 40, y: 20, width: 50, height: 50
    doc.addImage(logoUrl, 'PNG', 40, 12, 50, 50); 
  }
  // Clean text logic
  const cleanLineText = (text: string) => {
    return text.replace(/\[(.*?)\]/g, "$1").replace(/\*\*/g, "").trim();
  };
const headerX = (userStatus === "pro" && logoUrl) ? 100 : 40;
doc.setFontSize(22).setFont("helvetica", "bold").setTextColor(30, 41, 59);
// USE ONLY THIS ONE (Remove the duplicate below it)
doc.text(company.toUpperCase(), headerX, 50);

  // 2. Date: Aligned Right (Removed Status/Category logic as requested)
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(148, 163, 184);
  doc.text(`DATE: ${today}`, pageWidth - margin - 80, 50);

  // 3. Separator Line
  doc.setLineWidth(0.5).setDrawColor(203, 213, 225);
  doc.line(margin, 65, pageWidth - margin, 65);

  const lines = content.split('\n');
  let tableRows: string[][] = [];
  let isInsideTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Table Detection Logic
    if (line.startsWith('|')) {
      isInsideTable = true;
      // Skip the separator line (|---|---|)
      if (!line.includes('---')) {
        const data = line.split('|').filter(cell => cell.trim() !== "").map(cell => cell.trim());
        tableRows.push(data);
      }
      continue;
    } else if (isInsideTable && !line.startsWith('|')) {
      // Render the table once the table block ends
      if (tableRows.length > 0) {
        autoTable(doc, {
  startY: cursorY,
  head: [tableRows[0]],
  body: tableRows.slice(1),
  margin: { left: margin },
  theme: 'striped',
  styles: { 
    fontSize: 10, 
    cellPadding: 8 
  },
  headStyles: { 
    // REMOVE fillStyle: 'f'
    fillColor: [15, 21, 29] // This correctly sets the Slate 800 background
  }
});
        cursorY = (doc as any).lastAutoTable.finalY + 20;
        tableRows = [];
      }
      isInsideTable = false;
    }

    if (!line || isInsideTable) continue;

    const cleanedText = cleanLineText(line);
    const isHeading = line.startsWith('#') || line.includes('**');

    if (isHeading) {
      doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(15, 23, 42);
      const title = cleanedText.replace(/^#+\s*/, "");
      doc.text(title, margin, cursorY);
      cursorY += 25;
    } else {
      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(cleanedText, pageWidth - (margin * 2));
      doc.text(splitText, margin, cursorY, { lineHeightFactor: 1.5 });
      cursorY += (splitText.length * 16) + 10;
    }

    if (cursorY > 750) {
      doc.addPage();
      cursorY = 60;
    }
  }

// --- NEW LOGIC START ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // 1. Add Watermark if NOT Pro
    if (userStatus !== "pro") {
      doc.saveGraphicsState();
      // Calculate diagonal angle
      const angle = Math.atan2(doc.internal.pageSize.getHeight(), doc.internal.pageSize.getWidth()) * (180 / Math.PI);
      
      const gState = new (doc as any).GState({ opacity: 0.1, ca: 0.1 });
      doc.setGState(gState);
      doc.setFontSize(50).setTextColor(150).setFont("helvetica", "bold");

      doc.text("QUICKREPORT FREE VERSION", pageWidth, doc.internal.pageSize.getHeight() / 2, {
    angle: 45,
    align: "center"
  });
  doc.restoreGraphicsState();
}

    // 2. Add Page Numbers
    doc.setFontSize(9).setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 820, { align: "center" });
  }

  // 3. ALWAYS Save at the absolute end
  doc.save(`${company}_Report.pdf`);
  // --- NEW LOGIC END ---
};