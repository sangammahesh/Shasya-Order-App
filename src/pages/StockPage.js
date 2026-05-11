import React, { useEffect, useState } from "react";

import { db } from "../firebase";

import { collection, getDocs } from "firebase/firestore";

function StockPage() {
  const [stockList, setStockList] = useState([]);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const snapshot = await getDocs(collection(db, "stock"));

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStockList(list);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Stock</h2>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {stockList.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockPage;
