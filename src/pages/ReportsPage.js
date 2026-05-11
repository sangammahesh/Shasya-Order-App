import React from "react";

import SummaryCards from "../components/SummaryCards";

function ReportsPage({ data }) {
  const totalOrders = data.length;

  const totalAmount = data.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const pendingPayments = data
    .filter((item) => item.paymentStatus === "Pending")
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Reports</h2>

      <SummaryCards
        totalOrders={totalOrders}
        totalAmount={totalAmount}
        pendingPayments={pendingPayments}
      />
    </div>
  );
}

export default ReportsPage;
