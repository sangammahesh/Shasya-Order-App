import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

function Dashboard({ user, isAdmin }) {
  const role = isAdmin ? "admin" : "staff";

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [stockList, setStockList] = useState([]);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    weight: "",
    item: "",
    address: "",
    amount: "",
    assignedTo: "",
  });

  const getTime = (val) => {
    if (!val) return 0;
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
  };

  const fetchData = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "orders"));

    const list = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    list.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

    setData(list);
  }, []);

  const fetchStock = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "stock"));

    const list = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    setStockList(list);
  }, []);

  useEffect(() => {
    fetchData();

    if (isAdmin) {
      fetchStock();
    }
  }, [fetchData, fetchStock, isAdmin]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setForm({
      name: "",
      mobile: "",
      weight: "",
      item: "",
      address: "",
      amount: "",
      assignedTo: "",
    });
  };

  const handleAdd = async () => {
    if (!form.name || !form.mobile) {
      alert("Name & Mobile required");
      return;
    }

    const today = new Date().toLocaleDateString("en-CA");

    await addDoc(collection(db, "orders"), {
      ...form,
      status: "Pending",
      paymentMode: "",
      paymentStatus: "Pending",
      date: today,
      createdAt: new Date(),
    });

    clearForm();
    fetchData();
  };

  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      name: item.name || "",
      mobile: item.mobile || "",
      weight: item.weight || "",
      item: item.item || "",
      address: item.address || "",
      amount: item.amount || "",
      assignedTo: item.assignedTo || "",
    });
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, "orders", editId), form);

    setEditId(null);
    clearForm();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    await deleteDoc(doc(db, "orders", id));
    fetchData();
  };

  // FIXED: only local state update (fast + reliable)
  const handlePaymentMode = (id, mode) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              paymentMode: mode,
              paymentStatus:
                mode === "Cash" || mode === "GPay" ? "Paid" : "Pending",
            }
          : item
      )
    );
  };

  // FIXED: use latest selected payment value
  const handleDeliver = async (item) => {
    const currentItem = data.find((row) => row.id === item.id);

    const mode = currentItem?.paymentMode || "Later";

    await updateDoc(doc(db, "orders", item.id), {
      status: "Delivered",
      paymentMode: mode,
      paymentStatus: mode === "Cash" || mode === "GPay" ? "Paid" : "Pending",
    });

    fetchData();
  };

  const markPaid = async (item) => {
    await updateDoc(doc(db, "orders", item.id), {
      paymentStatus: "Paid",
    });

    fetchData();
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Name",
      "Mobile",
      "Weight",
      "Item",
      "Address",
      "Amount",
      "Status",
      "Payment Mode",
      "Payment Status",
    ];

    const rows = data.map((item) => [
      item.date || "",
      item.name || "",
      item.mobile || "",
      item.weight || "",
      item.item || "",
      item.address || "",
      item.amount || "",
      item.status || "",
      item.paymentMode || "",
      item.paymentStatus || "",
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((col) => `"${col}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.mobile?.includes(search)
  );

  if (!isAdmin) {
    filteredData = filteredData.filter(
      (item) =>
        item.status !== "Delivered" &&
        (!item.assignedTo || item.assignedTo === user?.email)
    );
  }

  const grandTotal = data.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const pendingTotal = data
    .filter(
      (item) => item.status === "Delivered" && item.paymentStatus === "Pending"
    )
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "auto" }}>
      <h2>Dashboard ({role})</h2>

      <p>Welcome: {user?.email}</p>

      <button onClick={handleLogout}>Logout</button>

      {isAdmin && (
        <button
          onClick={exportToCSV}
          style={{
            marginLeft: "10px",
            background: "green",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      )}

      {isAdmin && <h2>💰 Grand Total: ₹ {grandTotal}</h2>}
      {isAdmin && <h3>🧾 Pending Payments: ₹ {pendingTotal}</h3>}

      {isAdmin && (
        <div style={{ marginBottom: "20px" }}>
          <h3>{editId ? "Edit Order" : "Add Order"}</h3>

          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="mobile"
            placeholder="Mobile"
            value={form.mobile}
            onChange={handleChange}
          />
          <input
            name="weight"
            placeholder="Weight"
            value={form.weight}
            onChange={handleChange}
          />
          <input
            name="item"
            placeholder="Item"
            value={form.item}
            onChange={handleChange}
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
          <input
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
          />
          <input
            name="assignedTo"
            placeholder="Assign Staff Email"
            value={form.assignedTo}
            onChange={handleChange}
          />

          <br />
          <br />

          {editId ? (
            <button onClick={handleUpdate}>Update</button>
          ) : (
            <button onClick={handleAdd}>Add Order</button>
          )}
        </div>
      )}

      <input
        placeholder="Search Name / Mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table
        border="1"
        width="100%"
        cellPadding="6"
        style={{ marginTop: "15px" }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Weight</th>
            <th>Item</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Payment Mode</th>
            <th>Payment Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.mobile}</td>
              <td>{item.weight}</td>
              <td>{item.item}</td>
              <td>{item.address}</td>
              <td>{item.amount}</td>
              <td>{item.status}</td>
              <td>{item.paymentMode || "-"}</td>
              <td>{item.paymentStatus || "-"}</td>

              <td>
                {!isAdmin && item.status !== "Delivered" && (
                  <>
                    <select
                      value={item.paymentMode || ""}
                      onChange={(e) =>
                        handlePaymentMode(item.id, e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Cash">Cash</option>
                      <option value="GPay">GPay</option>
                      <option value="Later">Later</option>
                    </select>

                    <button
                      onClick={() => handleDeliver(item)}
                      style={{ marginLeft: "5px" }}
                    >
                      Delivered
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <button onClick={() => handleEdit(item)}>Edit</button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ marginLeft: "5px" }}
                    >
                      Delete
                    </button>

                    {item.status === "Delivered" &&
                      item.paymentStatus === "Pending" && (
                        <button
                          onClick={() => markPaid(item)}
                          style={{ marginLeft: "5px" }}
                        >
                          Mark Paid
                        </button>
                      )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAdmin && (
        <>
          <h3 style={{ marginTop: "40px" }}>📦 Raw Material Stock</h3>

          <ul>
            {stockList.map((item) => (
              <li key={item.id}>
                {item.item} : {item.quantity} KG
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Dashboard;
