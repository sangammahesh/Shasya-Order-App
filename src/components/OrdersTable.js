import React, { useState } from "react";

function OrdersTable({
  filteredData,
  isAdmin,
  handleEdit,
  handleDelete,
  handleDeliver,
  markPaid,
  staffList = [],
}) {
  const [paymentModes, setPaymentModes] = useState({});

  // GET STAFF NAME
  const getStaffName = (email) => {
    const found = staffList.find((staff) => staff.email === email);

    return found ? found.name : email || "-";
  };

  return (
    <div
      style={{
        overflowX: "auto",
        marginTop: "20px",
      }}
    >
      <table
        border="1"
        cellPadding="10"
        width="100%"
        style={{
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th>#</th>

            <th>Date</th>

            <th>Customer</th>

            <th>Mobile</th>

            <th>Item</th>

            <th>Weight</th>

            <th>Amount</th>

            {isAdmin && (
              <>
                <th>Status</th>

                <th>Payment</th>

                <th>Payment Status</th>

                <th>Assigned To</th>

                <th>Actions</th>
              </>
            )}

            {!isAdmin && <th>Action</th>}
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td
                colSpan={isAdmin ? 12 : 8}
                style={{
                  textAlign: "center",
                }}
              >
                No Orders Found
              </td>
            </tr>
          ) : (
            filteredData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>{item.date || "-"}</td>

                <td>{item.name}</td>

                <td>{item.mobile}</td>

                <td>{item.item}</td>

                <td>{item.weight}</td>

                <td>₹ {item.amount}</td>

                {/* ADMIN */}
                {isAdmin && (
                  <>
                    <td>{item.status}</td>

                    <td>{item.paymentMode || "-"}</td>

                    <td>{item.paymentStatus || "-"}</td>

                    <td>{getStaffName(item.assignedTo)}</td>

                    <td>
                      <button onClick={() => handleEdit(item)}>Edit</button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          marginLeft: "5px",
                        }}
                      >
                        Delete
                      </button>

                      {item.paymentStatus === "Pending" &&
                        item.status === "Delivered" && (
                          <button
                            onClick={() => markPaid(item)}
                            style={{
                              marginLeft: "5px",
                            }}
                          >
                            Mark Paid
                          </button>
                        )}
                    </td>
                  </>
                )}

                {/* STAFF */}
                {!isAdmin && (
                  <td>
                    <select
                      value={paymentModes[item.id] || ""}
                      onChange={(e) =>
                        setPaymentModes({
                          ...paymentModes,
                          [item.id]: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>

                      <option value="Cash">Cash</option>

                      <option value="GPay">GPay</option>

                      <option value="Later">Later</option>
                    </select>

                    <button
                      onClick={() => handleDeliver(item, paymentModes[item.id])}
                      style={{
                        marginLeft: "10px",
                      }}
                    >
                      Delivered
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;
