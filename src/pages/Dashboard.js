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

  // ✅ HANDLE FIRESTORE TIMESTAMP
  const getTime = (val) => {
    if (!val) return 0;
    if (val.seconds) return val.seconds * 1000;
    return new Date(val).getTime();
  };

  // ✅ FIX DATE PARSING (DD/MM/YYYY + YYYY-MM-DD)
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

    // ✅ NEW ORDERS ON TOP
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

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, [fetchData, fetchStaff]);

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

    const today = new Date().toLocaleDateString("en-CA"); // always safe format

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

  const handleDeliver = async (item) => {
    if (!item.payment) {
      alert("Select payment first");
      return;
    }

    await updateDoc(doc(db, "orders", item.id), {
      status: "Delivered",
    });

    fetchData();
  };

  const handlePaymentChange = async (item, value) => {
    await updateDoc(doc(db, "orders", item.id), {
      payment: value,
    });
    fetchData();
  };

  // 🔍 FILTER
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

  // 📅 GROUP
  const groupedData = filteredData.reduce((acc, item) => {
    const date = item.date || "No Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  // ✅ DAY NAME FIXED
  const getDayName = (dateStr) => {
    return parseDate(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
    });
  };

  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "auto" }}>
      <h2>Dashboard ({role})</h2>

      <p>Welcome: {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>

      {isAdmin && (
        <div>
          <h3>Add / Edit Order</h3>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
          />
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            placeholder="Mobile"
          />
          <input
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder="Weight"
          />
          <input
            name="item"
            value={form.item}
            onChange={handleChange}
            placeholder="Item"
          />
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
          />

          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
          >
            <option value="">Assign Staff</option>
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
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {Object.keys(groupedData)
        .sort((a, b) => parseDate(b) - parseDate(a)) // ✅ FIXED SORT
        .map((date) => {
          const items = groupedData[date].sort(
            (a, b) => getTime(b.createdAt) - getTime(a.createdAt)
          );

          const total = items.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
          );

          return (
            <div key={date} style={{ marginTop: "20px" }}>
              <h3>
                📅 {date} ({getDayName(date)}) | ₹ {total}
              </h3>

              <table border="1" width="100%">
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.mobile}</td>
                      <td>{item.weight}</td>
                      <td>{item.item}</td>
                      <td>{item.address}</td>
                      <td>{item.amount}</td>

                      <td>
                        {staffList.find((s) => s.email === item.assignedTo)
                          ?.name || "-"}
                      </td>

                      <td>{item.status}</td>
                      <td>{item.payment || "-"}</td>

                      <td>
                        {!isAdmin && item.status !== "Delivered" && (
                          <>
                            <select
                              value={item.payment || ""}
                              onChange={(e) =>
                                handlePaymentChange(item, e.target.value)
                              }
                            >
                              <option value="">Payment</option>
                              <option value="Cash">Cash</option>
                              <option value="GPay">GPay</option>
                            </select>

                            <button onClick={() => handleDeliver(item)}>
                              Delivered
                            </button>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <button onClick={() => handleEdit(item)}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
    </div>
  );
}

export default Dashboard;
