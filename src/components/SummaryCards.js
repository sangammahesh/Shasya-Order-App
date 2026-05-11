function SummaryCards({ totalOrders, totalAmount, pendingPayments }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        marginTop: "20px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          padding: "20px",
          background: "#f1f1f1",
          borderRadius: "8px",
          minWidth: "200px",
        }}
      >
        <h3>Total Orders</h3>
        <h2>{totalOrders}</h2>
      </div>

      <div
        style={{
          padding: "20px",
          background: "#d4edda",
          borderRadius: "8px",
          minWidth: "200px",
        }}
      >
        <h3>Total Amount</h3>
        <h2>₹ {totalAmount}</h2>
      </div>

      <div
        style={{
          padding: "20px",
          background: "#fff3cd",
          borderRadius: "8px",
          minWidth: "200px",
        }}
      >
        <h3>Pending Payments</h3>
        <h2>₹ {pendingPayments}</h2>
      </div>
    </div>
  );
}

export default SummaryCards;
