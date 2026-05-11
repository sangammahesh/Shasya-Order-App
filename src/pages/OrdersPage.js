import React from "react";

import OrdersTable from "../components/OrdersTable";

function OrdersPage({
  filteredData,
  isAdmin,
  handleEdit,
  handleDelete,
  handleDeliver,
  markPaid,
  staffList,
}) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h2>{isAdmin ? "All Orders" : "My Pending Orders"}</h2>

      <OrdersTable
        filteredData={filteredData}
        isAdmin={isAdmin}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleDeliver={handleDeliver}
        markPaid={markPaid}
        staffList={staffList}
      />
    </div>
  );
}

export default OrdersPage;
