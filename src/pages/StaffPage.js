import React, { useEffect, useState } from "react";

import { db } from "../firebase";

import { collection, getDocs } from "firebase/firestore";

function StaffPage() {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const snapshot = await getDocs(collection(db, "staff"));

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStaffList(list);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Staff</h2>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {staffList.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StaffPage;
