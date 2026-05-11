import React from "react";

import OrdersTable from "../components/OrdersTable";

function OrdersPage({ filteredData, isAdmin, handleEdit, handleDelete }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Orders</h2>

      <OrdersTable
        filteredData={filteredData}
        isAdmin={isAdmin}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default OrdersPage;
