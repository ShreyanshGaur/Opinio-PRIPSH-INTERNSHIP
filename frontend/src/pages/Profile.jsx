import { useState, useContext, useEffect } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast"; // <--- Import

const Profile = () => {
  const { token, user } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  // Removed local 'message' state entirely!

  useEffect(() => {
    if (user && user.name) {
        setName(user.name); 
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating profile..."); // <--- Show loading spinner

    try {
      const config = { headers: { "x-auth-token": token } };
      const body = { name };
      if (password) body.password = password;

      await axios.put("http://localhost:5000/api/auth/profile", body, config);
      
      toast.dismiss(loadingToast); // Remove spinner
      toast.success("Profile updated successfully!"); // Show success
      setPassword(""); 
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Account Settings</h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Display Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-gray-400 mt-1">Leave blank to keep current name.</p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || "email@example.com"} 
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <hr className="border-gray-100 my-4" />

          <div>
            <label className="block text-gray-700 font-bold mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
            />
            <p className="text-sm text-gray-400 mt-1">Leave blank to keep current password.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;