import React, { useEffect, useState } from "react";

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

import { getTime, getMonthKey } from "../utils/dateUtils";

function Dashboard({ user, isAdmin }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    weight: "",
    item: "",
    amount: "",
  });

  // FETCH DATA
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const list = await getOrders();

      list.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));

      setData(list);
    } catch (error) {
      console.error("FETCH ERROR:", error);

      alert("Firebase fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  // EDIT ORDER
  const handleEdit = (item) => {
    setEditId(item.id);

    setForm({
      name: item.name || "",
      mobile: item.mobile || "",
      weight: item.weight || "",
      item: item.item || "",
      amount: item.amount || "",
    });
  };

  // UPDATE ORDER
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

  // DELETE ORDER
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

  // FILTER DATA
  const filteredData = data.filter((item) => getMonthKey(item));

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

      {/* ORDER FORM */}
      <OrderForm
        form={form}
        handleChange={handleChange}
        handleAdd={handleAdd}
        handleUpdate={handleUpdate}
        editId={editId}
      />

      {/* REPORTS */}
      <ReportsPage data={filteredData} />

      {/* ORDERS */}
      <OrdersPage
        filteredData={filteredData}
        isAdmin={isAdmin}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* ADMIN ONLY */}
      {isAdmin && <StockPage />}

      {isAdmin && <StaffPage />}
    </div>
  );
}

export default Dashboard;
