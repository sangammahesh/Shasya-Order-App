import { monthNames } from "../utils/dateUtils";

function MonthFilter({
  yearList,
  monthList,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
}) {
  return (
    <>
      <div style={{ marginTop: "20px" }}>
        <h3>Years</h3>

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

      <div style={{ marginTop: "20px" }}>
        <h3>Months</h3>

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
    </>
  );
}

export default MonthFilter;
