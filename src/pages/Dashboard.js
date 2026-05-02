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
  const [staffList, setStaffList] = useState([]);
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

  const ordersRef = collection(db, "orders");

  const products = [
    "Wheat Sharbati",
    "Wheat Lokwan",
    "Multigrain",
    "Millet",
    "High Protein",
    "High Fibre",
    "Diabetes",
    "Chana Special",
    "Jowar Special",
    "Bajra Special",
    "Soybean",
    "Ragi",
    "Rice",
    "Makka",
    "Telangana Achar",
    "Chilli Powder",
    "Haldi Powder",
    "Seasame Seeds",
    "Rai",
  ];

  const recipes = {
    Multigrain: {
      Wheat: 0.4,
      Bajra: 0.22,
      Jowar: 0.18,
      Chana: 0.1,
      Soybean: 0.08,
      Methi: 0.02,
    },
    "High Protein": {
      Wheat: 0.5,
      Soybean: 0.2,
      Chana: 0.15,
      Flaxseed: 0.15,
    },
    "High Fibre": {
      Wheat: 0.4,
      Barley: 0.2,
      Jowar: 0.2,
      Bajra: 0.2,
    },
    Diabetes: {
      Wheat: 0.4,
      Bajra: 0.15,
      Jowar: 0.15,
      Chana: 0.1,
      Soybean: 0.1,
      Methi: 0.05,
      Flaxseed: 0.05,
    },
    Millet: {
      Foxtail: 1,
    },
  };

  const getTime = (val) => {
    if (!val) return 0;
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes("-")) return new Date(dateStr);
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
  };

  const fetchData = useCallback(async () => {
    const snapshot = await getDocs(ordersRef);
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    list.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
    setData(list);
  }, []);

  const fetchStaff = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "staff"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStaffList(list);
  }, []);

  const fetchStock = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "stock"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStockList(list);
  }, []);

  useEffect(() => {
    fetchData();
    fetchStaff();
    fetchStock();
  }, [fetchData, fetchStaff, fetchStock]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      createdBy: user?.email,
    });

    fetchData();

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

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
  };

  const handleUpdate = async () => {
    await updateDoc(doc(db, "orders", editId), { ...form });
    setEditId(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await deleteDoc(doc(db, "orders", id));
    fetchData();
  };

  // ✅ EXPORT CSV
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
      "Assigned To",
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
      item.assignedTo || "",
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
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

  const groupedData = filteredData.reduce((acc, item) => {
    const date = item.date || "No Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

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
            padding: "8px 14px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      )}

      <h2>💰 Grand Total: ₹ {grandTotal}</h2>

      <input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {Object.keys(groupedData).map((date) => (
        <div key={date}>
          <h3>{date}</h3>

          <table border="1" width="100%">
            <tbody>
              {groupedData[date].map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.mobile}</td>
                  <td>{item.weight}</td>
                  <td>{item.item}</td>
                  <td>{item.address}</td>
                  <td>{item.amount}</td>
                  <td>{item.status}</td>
                  <td>{item.payment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h3 style={{ marginTop: "40px" }}>📦 Raw Material Stock</h3>

      <ul>
        {stockList.map((s) => (
          <li key={s.id}>
            {s.item} : {s.quantity} KG
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
