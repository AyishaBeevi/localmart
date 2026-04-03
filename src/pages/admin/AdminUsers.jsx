import { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminSidebar from "../../components/AdminSidebar";
import toast from "react-hot-toast";

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get(
        "/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUsers(res.data);

    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* 🔥 BLOCK / UNBLOCK TOGGLE */
  const toggleBlockUser = (user) => {

    const isBlocked = user.status === "blocked";

    toast.custom((t) => (

      <div className="bg-white border shadow-lg rounded-lg p-4 w-80">

        <p className="text-sm font-medium mb-3">
          {isBlocked ? "Unblock this user?" : "Block this user?"}
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm border rounded"
          >
            Cancel
          </button>

          <button
            onClick={async () => {

              toast.dismiss(t.id);

              try {

                const url = isBlocked
                  ? `/api/admin/users/${user._id}/unblock`
                  : `/api/admin/users/${user._id}/block`;

                // await axios.put(
                //   `http://localhost:5000${url}`,
                //   {},
                //   { headers: { Authorization: `Bearer ${token}` } }
                // );

                await API.put(url);

                setUsers(prev =>
                  prev.map(u =>
                    u._id === user._id
                      ? { ...u, status: isBlocked ? "active" : "blocked" }
                      : u
                  )
                );

                toast.success(
                  isBlocked ? "User unblocked" : "User blocked"
                );

              } catch {
                toast.error("Action failed");
              }

            }}
            className={`px-3 py-1 text-sm text-white rounded ${
              isBlocked ? "bg-green-600" : "bg-yellow-600"
            }`}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>

        </div>

      </div>

    ));
  };

  /* 🔥 DELETE USER */
  const deleteUser = (user) => {

    if (user.role === "admin") {
      toast.error("Cannot delete admin");
      return;
    }

    toast.custom((t) => (

      <div className="bg-white border shadow-lg rounded-lg p-4 w-80">

        <p className="text-sm font-medium mb-3 text-red-600">
          Delete this user permanently?
        </p>

        <div className="flex justify-end gap-2">

          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm border rounded"
          >
            Cancel
          </button>

          <button
            onClick={async () => {

              toast.dismiss(t.id);

              try {

                await API.delete(
                  `/admin/users/${user._id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                setUsers(prev =>
                  prev.filter(u => u._id !== user._id)
                );

                toast.success("User deleted");

              } catch {
                toast.error("Delete failed");
              }

            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded"
          >
            Delete
          </button>

        </div>

      </div>

    ));
  };

  return (

    <div className="flex min-h-screen bg-gray-50">

      <AdminSidebar />

      <div className="flex-1 p-6">

        <h1 className="text-2xl font-bold mb-6">
          Users Management
        </h1>

        <div className="bg-white border rounded-xl overflow-hidden">

          {loading ? (

            <div className="p-6 text-center text-textMuted">
              Loading users...
            </div>

          ) : users.length === 0 ? (

            <div className="p-6 text-center text-textMuted">
              No users found
            </div>

          ) : (

            <table className="w-full text-sm">

              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-4 text-left">User</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Joined</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>

                {users.map(user => (

                  <tr key={user._id} className="border-t hover:bg-gray-50">

                    <td className="p-4">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-textMuted">{user.email}</p>
                    </td>

                    <td className="p-4 capitalize">
                      {user.role}
                    </td>

                    <td className="p-4">

                      {user.status === "blocked" ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          Blocked
                        </span>
                      ) : user.subscription === "seller" ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Seller
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          User
                        </span>
                      )}

                    </td>

                    <td className="p-4 text-xs text-textMuted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 flex gap-3 text-xs">

                      <button
                        onClick={() => toggleBlockUser(user)}
                        className={`${
                          user.status === "blocked"
                            ? "text-green-600 hover:underline"
                            : "text-yellow-600 hover:underline"
                        }`}
                      >
                        {user.status === "blocked" ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => deleteUser(user)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>

  );

}

export default AdminUsers;