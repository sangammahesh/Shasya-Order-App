function OrdersTable({ filteredData, isAdmin, handleEdit, handleDelete }) {
  return (
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
          <th>Amount</th>
          <th>Status</th>
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
            <td>{item.amount}</td>
            <td>{item.status}</td>

            <td>
              {isAdmin && (
                <>
                  <button onClick={() => handleEdit(item)}>Edit</button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ marginLeft: "5px" }}
                  >
                    Delete
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OrdersTable;
