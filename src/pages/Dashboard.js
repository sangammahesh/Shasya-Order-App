import React, { useEffect, useState } from "react";

import { db } from "../firebase";

import { collection, getDocs } from "firebase/firestore";

import Header from "../components/Header";
import OrderForm from "../components/OrderForm";
import Loading from "../components/Loading";

import OrdersPage from "./OrdersPage";
import ReportsPage from "./ReportsPage";
import StockPage from "./StockPage";
import StaffPage from "./StaffPage";

import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
} from "../services/orderService";

import { getTime } from "../utils/dateUtils";

function Dashboard({ user, isAdmin }) {
  // STATES
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);

  const [staffList, setStaffList] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    weight: "",
    item: "",
    amount: "",
    assignedTo: "",
  });

  // FETCH STAFF
  const fetchStaff = async () => {
    try {
      const snapshot = await getDocs(collection(db, "staff"));

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStaffList(list);
    } catch (error) {
      console.error("STAFF ERROR:", error);
    }
  };

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const list = await getOrders();

      // SORT LATEST FIRST
      list.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

      setData(list);

      // AUTO SELECT LATEST MONTH
      if (list.length > 0) {
        const latest = list[0]?.monthKey || "";

        setSelectedYear(latest.slice(0, 4));

        setSelectedMonth(latest);
      }
    } catch (error) {
      console.error("FIREBASE ERROR:", error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // LOAD DATA
  useEffect(() => {
    fetchOrders();
    fetchStaff();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // CLEAR FORM
  const clearForm = () => {
    setForm({
      name: "",
      mobile: "",
      weight: "",
      item: "",
      amount: "",
      assignedTo: "",
    });
  };

  // ADD ORDER
  const handleAdd = async () => {
    try {
      if (!form.name || !form.mobile) {
        alert("Name and Mobile required");

        return;
      }

      const now = new Date();

      const monthKey = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      await addOrder({
        ...form,

        status: "Pending",

        paymentStatus: "Pending",

        paymentMode: "",

        date: now.toLocaleDateString("en-CA"),

        monthKey,

        createdAt: new Date(),
      });

      clearForm();

      fetchOrders();
    } catch (error) {
      console.error("ADD ERROR:", error);
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      name: item.name || "",

      mobile: item.mobile || "",

      weight: item.weight || "",

      item: item.item || "",

      amount: item.amount || "",

      assignedTo: item.assignedTo || "",
    });
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      await updateOrder(editId, form);

      setEditId(null);

      clearForm();

      fetchOrders();
    } catch (error) {
      console.error("UPDATE ERROR:", error);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm("Delete this order?");

      if (!confirmDelete) return;

      await deleteOrder(id);

      fetchOrders();
    } catch (error) {
      console.error("DELETE ERROR:", error);
    }
  };

  // DELIVER
  const handleDeliver = async (item, paymentMode) => {
    try {
      await updateOrder(item.id, {
        status: "Delivered",

        paymentMode,

        paymentStatus: paymentMode === "Later" ? "Pending" : "Paid",
      });

      fetchOrders();
    } catch (error) {
      console.error("DELIVERY ERROR:", error);
    }
  };

  // MARK PAID
  const markPaid = async (item) => {
    try {
      await updateOrder(item.id, {
        paymentStatus: "Paid",
      });

      fetchOrders();
    } catch (error) {
      console.error("MARK PAID ERROR:", error);
    }
  };

  // FILTER BY MONTH
  let filteredData = data.filter((item) => item.monthKey === selectedMonth);

  // STAFF FILTER
  if (!isAdmin) {
    filteredData = filteredData.filter(
      (item) => item.assignedTo === user?.email && item.status !== "Delivered"
    );
  }

  // LOADING
  if (loading) {
    return <Loading />;
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "auto",
        padding: "20px",
      }}
    >
      {/* HEADER */}
      <Header user={user} isAdmin={isAdmin} />

      {/* ADMIN */}
      {isAdmin ? (
        <>
          {/* ORDER FORM */}
          <OrderForm
            form={form}
            handleChange={handleChange}
            handleAdd={handleAdd}
            handleUpdate={handleUpdate}
            editId={editId}
            staffList={staffList}
          />

          {/* REPORTS */}
          <ReportsPage
            data={data}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          {/* ORDERS */}
          <OrdersPage
            filteredData={filteredData}
            isAdmin={isAdmin}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleDeliver={handleDeliver}
            markPaid={markPaid}
            staffList={staffList}
          />

          {/* STOCK */}
          <StockPage />

          {/* STAFF */}
          <StaffPage />
        </>
      ) : (
        /* STAFF */
        <OrdersPage
          filteredData={filteredData}
          isAdmin={false}
          handleDeliver={handleDeliver}
        />
      )}
    </div>
  );
}

export default Dashboard;
