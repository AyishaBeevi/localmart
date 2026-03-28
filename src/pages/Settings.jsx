import { useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";

function Settings() {

  const [passwords,setPasswords] = useState({
    current:"",
    new:""
  });

  const [notifications,setNotifications] = useState({
    chat:true,
    interest:true,
    email:false
  });

  const handlePasswordChange = async () => {

    try{

      await API.put("/auth/change-password", passwords);

      toast.success("Password updated");

      setPasswords({
        current:"",
        new:""
      });

    }catch(err){

      toast.error("Error updating password");

    }

  };

  const handleDeleteAccount = () => {

  toast.custom((t) => (

    <div className="bg-white border shadow-lg rounded-lg p-4 w-80">

      <p className="text-sm font-medium mb-3 text-red-600">
        Delete your account permanently?
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

              await API.delete("/auth/delete");

              localStorage.removeItem("token");

              toast.success("Account deleted");

              setTimeout(() => {
                window.location = "/";
              }, 1000);

            } catch {

              toast.error("Error deleting account");

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

    <div className="max-w-4xl mx-auto p-10">

      <h1 className="text-3xl font-bold mb-10">
        Settings
      </h1>


      {/* PASSWORD */}

      <div className="border rounded-lg p-6 mb-8">

        <h2 className="font-semibold mb-4">
          Change Password
        </h2>

        <input
          type="password"
          placeholder="Current password"
          value={passwords.current}
          onChange={(e)=>setPasswords({...passwords,current:e.target.value})}
          className="border w-full p-2 mb-3"
        />

        <input
          type="password"
          placeholder="New password"
          value={passwords.new}
          onChange={(e)=>setPasswords({...passwords,new:e.target.value})}
          className="border w-full p-2 mb-4"
        />

        <button
          onClick={handlePasswordChange}
          className="bg-brand text-white px-4 py-2 rounded"
        >
          Update Password
        </button>

      </div>


      {/* NOTIFICATIONS */}

      <div className="border rounded-lg p-6 mb-8">

        <h2 className="font-semibold mb-4">
          Notifications
        </h2>

        <label className="flex items-center gap-3 mb-3">

          <input
            type="checkbox"
            checked={notifications.chat}
            onChange={(e)=>setNotifications({
              ...notifications,
              chat:e.target.checked
            })}
          />

          Chat notifications

        </label>

        <label className="flex items-center gap-3 mb-3">

          <input
            type="checkbox"
            checked={notifications.interest}
            onChange={(e)=>setNotifications({
              ...notifications,
              interest:e.target.checked
            })}
          />

          Product interest alerts

        </label>

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={notifications.email}
            onChange={(e)=>setNotifications({
              ...notifications,
              email:e.target.checked
            })}
          />

          Email notifications

        </label>

      </div>


      {/* DANGER ZONE */}

      <div className="border rounded-lg p-6">

        <h2 className="font-semibold mb-4 text-red-600">
          Danger Zone
        </h2>

        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>

      </div>

    </div>

  );

}

export default Settings;