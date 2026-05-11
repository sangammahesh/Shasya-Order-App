function OrderForm({
  form,
  handleChange,
  handleAdd,
  handleUpdate,
  editId,
  staffList,
}) {
  return (
    <div style={{ marginTop: "20px" }}>
      <input
        name="name"
        placeholder="Customer Name"
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
        name="amount"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
      />

      {/* STAFF SELECT */}
      <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
        <option value="">Assign Staff</option>

        {staffList.map((staff) => (
          <option key={staff.id} value={staff.email}>
            {staff.name}
          </option>
        ))}
      </select>

      {editId ? (
        <button onClick={handleUpdate}>Update Order</button>
      ) : (
        <button onClick={handleAdd}>Add Order</button>
      )}
    </div>
  );
}

export default OrderForm;
