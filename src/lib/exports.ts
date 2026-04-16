import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function exportExcel(filename: string, sheets: { name: string; rows: any[] }[]) {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.json_to_sheet(s.rows);
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportPDF(
  title: string,
  filename: string,
  sections: { heading: string; columns: string[]; rows: (string | number)[][] }[]
) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(204, 85, 38);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 25);

  let y = 32;
  sections.forEach((sec, i) => {
    if (i > 0) y = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(sec.heading, 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [sec.columns],
      body: sec.rows,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [204, 85, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [250, 245, 238] },
    });
  });

  doc.save(`${filename}.pdf`);
}
