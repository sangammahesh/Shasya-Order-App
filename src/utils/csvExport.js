export const exportCSV = (data, fileName = "Report.csv") => {
  try {
    if (!data || data.length === 0) {
      alert("No data found");
      return;
    }

    const headers = Object.keys(data[0]);

    const csv =
      headers.join(",") +
      "\n" +
      data
        .map((row) =>
          headers
            .map((field) => `"${String(row[field] || "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = fileName;

    link.click();
  } catch (error) {
    console.error("CSV EXPORT ERROR:", error);
  }
};
