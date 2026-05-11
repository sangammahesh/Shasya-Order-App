import { db } from "../firebase";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// GET ORDERS
export const getOrders = async () => {
  const snapshot = await getDocs(collection(db, "orders"));

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// ADD ORDER
export const addOrder = async (data) => {
  return await addDoc(collection(db, "orders"), data);
};

// UPDATE ORDER
export const updateOrder = async (id, data) => {
  return await updateDoc(doc(db, "orders", id), data);
};

// DELETE ORDER
export const deleteOrder = async (id) => {
  return await deleteDoc(doc(db, "orders", id));
};
