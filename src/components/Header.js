import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Header({ user, isAdmin, exportAllCSV }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      <h2>Dashboard ({isAdmin ? "admin" : "staff"})</h2>

      <p>Welcome: {user?.email}</p>

      <button onClick={handleLogout}>Logout</button>

      {isAdmin && (
        <button onClick={exportAllCSV} style={{ marginLeft: "10px" }}>
          Export CSV
        </button>
      )}
    </div>
  );
}

export default Header;
