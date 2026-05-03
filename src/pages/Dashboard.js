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
  const [stockList, setStockList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    weight: "",
    item: "",
    address: "",
    amount: "",
    assignedTo: "",
  });

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

  const getTime = (val) => {
    if (!val) return 0;
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
  };

  const getMonthKey = (item) => {
    if (item.monthKey && /^\d{4}-\d{2}$/.test(item.monthKey)) {
      return item.monthKey;
    }

    if (item.date) {
      const d = new Date(item.date);
      if (!isNaN(d)) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }
    }

    if (item.createdAt?.seconds) {
      const d = new Date(item.createdAt.seconds * 1000);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    return "";
  };

  const fetchData = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "orders"));

    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    list.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
    setData(list);

    const months = [
      ...new Set(list.map((item) => getMonthKey(item)).filter(Boolean)),
    ].sort();

    if (months.length > 0) {
      const latest = months[months.length - 1];
      setSelectedYear(latest.slice(0, 4));
      setSelectedMonth(latest);
    } else {
      const now = new Date();
      const mk = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      setSelectedYear(mk.slice(0, 4));
      setSelectedMonth(mk);
    }
  }, []);

  const fetchStock = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "stock"));

    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    setStockList(list);
  }, []);

  const fetchStaff = useCallback(async () => {
    const snapshot = await getDocs(collection(db, "staff"));

    const list = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    setStaffList(list);
  }, []);

  useEffect(() => {
    fetchData();
    fetchStaff();

    if (isAdmin) fetchStock();
  }, [fetchData, fetchStock, fetchStaff, isAdmin]);

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

    const now = new Date();

    const monthKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const today = now.toLocaleDateString("en-CA");

    await addDoc(collection(db, "orders"), {
      ...form,
      status: "Pending",
      paymentMode: "",
      paymentStatus: "Pending",
      date: today,
      monthKey,
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

  const handleDeliver = async (item) => {
    const current = data.find((row) => row.id === item.id);
    const mode = current?.paymentMode || "Later";

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

  const getStaffName = (email) => {
    const found = staffList.find((s) => s.email === email);
    return found ? found.name : email || "-";
  };

  const exportAllCSV = () => {
    if (data.length === 0) {
      alert("No data found");
      return;
    }

    const headers = [
      "Year",
      "Month",
      "Date",
      "Name",
      "Mobile",
      "Weight",
      "Item",
      "Address",
      "Amount",
      "Assigned Staff",
      "Status",
      "Payment Mode",
      "Payment Status",
    ];

    const rows = data.map((item) => {
      const mk = getMonthKey(item);
      const year = mk.slice(0, 4);
      const month = monthNames[parseInt(mk.slice(5, 7), 10) - 1] || "";

      return [
        year,
        month,
        item.date || "",
        item.name || "",
        item.mobile || "",
        item.weight || "",
        item.item || "",
        item.address || "",
        item.amount || "",
        getStaffName(item.assignedTo),
        item.status || "",
        item.paymentMode || "",
        item.paymentStatus || "",
      ];
    });

    const csv =
      headers.join(",") +
      "\n" +
      rows
        .map((row) =>
          row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "All_Reports.csv";
    link.click();
  };

  const yearList = [
    ...new Set(
      data
        .map((item) => getMonthKey(item))
        .filter(Boolean)
        .map((m) => m.slice(0, 4))
    ),
  ]
    .sort()
    .reverse();

  const monthList = [
    ...new Set(
      data
        .map((item) => getMonthKey(item))
        .filter((m) => m.slice(0, 4) === selectedYear)
    ),
  ]
    .sort()
    .reverse();

  let filteredData = data.filter(
    (item) =>
      getMonthKey(item) === selectedMonth &&
      (item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.mobile?.includes(search))
  );

  if (!isAdmin) {
    filteredData = filteredData.filter(
      (item) =>
        item.status !== "Delivered" &&
        (!item.assignedTo || item.assignedTo === user?.email)
    );
  }

  const grandTotal = filteredData.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const pendingTotal = filteredData
    .filter(
      (item) => item.status === "Delivered" && item.paymentStatus === "Pending"
    )
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const monthTitle = selectedMonth
    ? `${
        monthNames[parseInt(selectedMonth.slice(5, 7), 10) - 1]
      } ${selectedYear}`
    : "";

  return (
    <div style={{ padding: "10px", maxWidth: "1300px", margin: "auto" }}>
      <h2>Dashboard ({role})</h2>
      <p>Welcome: {user?.email}</p>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={handleLogout}>Logout</button>

        {isAdmin && (
          <button onClick={exportAllCSV} style={{ marginLeft: "10px" }}>
            Export All CSV
          </button>
        )}
      </div>

      {/* YEAR */}
      <div style={{ marginTop: "20px" }}>
        <h3>📁 Years</h3>

        {yearList.map((year) => (
          <button
            key={year}
            onClick={() => {
              setSelectedYear(year);

              const months = [
                ...new Set(
                  data
                    .map((item) => getMonthKey(item))
                    .filter((m) => m.slice(0, 4) === year)
                ),
              ]
                .sort()
                .reverse();

              if (months.length > 0) setSelectedMonth(months[0]);
            }}
            style={{
              marginRight: "8px",
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

      {/* MONTH */}
      <div style={{ marginTop: "20px" }}>
        <h3>📅 Months</h3>

        {monthList.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            style={{
              marginRight: "8px",
              marginBottom: "8px",
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

      <h2 style={{ marginTop: "20px" }}>📄 {monthTitle}</h2>

      {isAdmin && <h2>💰 Monthly Total: ₹ {grandTotal}</h2>}
      {isAdmin && <h3>🧾 Pending Payments: ₹ {pendingTotal}</h3>}

      {/* FORM */}
      {isAdmin && (
        <div style={{ marginTop: "25px", marginBottom: "25px" }}>
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

          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
          >
            <option value="">Select Staff</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.email}>
                {staff.name}
              </option>
            ))}
          </select>

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

      {/* TABLE */}
      <table
        border="1"
        width="100%"
        cellPadding="6"
        style={{ marginTop: "15px" }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Name</th>
            <th>Mobile</th>
            <th>Weight</th>
            <th>Item</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Assigned</th>
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
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>{item.mobile}</td>
              <td>{item.weight}</td>
              <td>{item.item}</td>
              <td>{item.address}</td>
              <td>{item.amount}</td>
              <td>{getStaffName(item.assignedTo)}</td>
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

      {/* STOCK */}
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
