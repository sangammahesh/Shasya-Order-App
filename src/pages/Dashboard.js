import React, { useState, useEffect } from "react";
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
  });

  const ordersRef = collection(db, "orders");

  const getTime = (val) => {
    if (!val) return 0;
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
  };

  const fetchData = async () => {
    const snapshot = await getDocs(ordersRef);

    const list = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    list.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

    setData(list);
  };

  const fetchStock = async () => {
    const snapshot = await getDocs(collection(db, "stock"));

    const list = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    setStockList(list);
  };

  useEffect(() => {
    fetchData();
    fetchStock();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async () => {
    if (!form.name || !form.mobile) {
      alert("Name & Mobile required");
      return;
    }

    const today = new Date().toLocaleDateString("en-CA");

    await addDoc(ordersRef, {
      ...form,
      status: "Pending",
      payment: "",
      date: today,
      createdAt: new Date(),
    });

    setForm({
      name: "",
      mobile: "",
      weight: "",
      item: "",
      address: "",
      amount: "",
    });

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
    });
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, "orders", editId), form);

    setEditId(null);

    setForm({
      name: "",
      mobile: "",
      weight: "",
      item: "",
      address: "",
      amount: "",
    });

    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    await deleteDoc(doc(db, "orders", id));

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
      "Payment",
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
      item.payment || "",
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

  const filteredData = data.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.mobile?.includes(search)
  );

  const grandTotal = data.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

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

      <h2>💰 Grand Total: ₹ {grandTotal}</h2>

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
            {isAdmin && <th>Action</th>}
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

              {isAdmin && (
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ marginLeft: "5px" }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: "40px" }}>📦 Raw Material Stock</h3>

      <ul>
        {stockList.map((item) => (
          <li key={item.id}>
            {item.item} : {item.quantity} KG
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
