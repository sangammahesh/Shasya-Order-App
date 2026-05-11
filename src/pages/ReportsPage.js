import React from "react";

function ReportsPage({
  data,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // YEARS
  const yearList = [
    ...new Set(
      data.map((item) => {
        if (item.monthKey) {
          return item.monthKey.slice(0, 4);
        }

        if (item.date) {
          return item.date.slice(0, 4);
        }

        return "";
      })
    ),
  ]
    .filter(Boolean)
    .sort();

  // MONTHS
  const monthList = [
    ...new Set(
      data
        .filter((item) => {
          const key = item.monthKey || item.date?.slice(0, 7);

          return key && key.slice(0, 4) === selectedYear;
        })
        .map((item) => item.monthKey || item.date?.slice(0, 7))
    ),
  ]
    .filter(Boolean)
    .sort();

  // FILTERED MONTH DATA
  const filtered = data.filter((item) => {
    const key = item.monthKey || item.date?.slice(0, 7);

    return key === selectedMonth;
  });

  // TOTALS
  const totalOrders = filtered.length;

  const totalAmount = filtered.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const paidAmount = filtered
    .filter((item) => item.paymentStatus === "Paid")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const pendingAmount = filtered
    .filter((item) => item.paymentStatus === "Pending")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Reports</h2>

      {/* YEARS */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Select Year</h3>

        {yearList.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            style={{
              marginRight: "10px",
              padding: "8px 14px",
              border: "none",
              cursor: "pointer",
              background: selectedYear === year ? "#007bff" : "#ddd",
              color: selectedYear === year ? "#fff" : "#000",
            }}
          >
            {year}
          </button>
        ))}
      </div>

      {/* MONTHS */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Select Month</h3>

        {monthList.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            style={{
              marginRight: "10px",
              marginBottom: "10px",
              padding: "8px 14px",
              border: "none",
              cursor: "pointer",
              background: selectedMonth === month ? "#28a745" : "#ddd",
              color: selectedMonth === month ? "#fff" : "#000",
            }}
          >
            {monthNames[parseInt(month.slice(5, 7), 10) - 1]}
          </button>
        ))}
      </div>

      {/* REPORT CARDS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#f1f1f1",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>Total Orders</h3>

          <h1>{totalOrders}</h1>
        </div>

        <div
          style={{
            background: "#d4edda",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>Total Revenue</h3>

          <h1>₹ {totalAmount}</h1>
        </div>

        <div
          style={{
            background: "#cce5ff",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>Paid Amount</h3>

          <h1>₹ {paidAmount}</h1>
        </div>

        <div
          style={{
            background: "#fff3cd",
            padding: "20px",
            borderRadius: "10px",
            minWidth: "220px",
          }}
        >
          <h3>Pending Amount</h3>

          <h1>₹ {pendingAmount}</h1>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
