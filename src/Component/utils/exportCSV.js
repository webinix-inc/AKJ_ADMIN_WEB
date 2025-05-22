import { saveAs } from "file-saver";

export function exportToCSV(data, fileName = "enquiries.csv") {
  const csvHeaders = Object.keys(data[0] || {}).join(",");
  const csvRows = data.map((row) =>
    Object.values(row)
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csvContent = [csvHeaders, ...csvRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, fileName);
}
