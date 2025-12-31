import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast"; // <--- Import

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      login(res.data.token);
      toast.success("Account created successfully!"); // <--- Success Toast
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration Failed"); // <--- Error Toast
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-700 to-indigo-900 text-white flex-col justify-center px-16">
        <h1 className="text-5xl font-bold mb-4">Join Opinio.</h1>
        <p className="text-xl text-indigo-100">Create unlimited surveys and gather insights today.</p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-12 relative">
        <Link to="/" className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">✕ Close</Link>

        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Create Account</h2>
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none transition"
                placeholder="John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none transition"
                placeholder="name@company.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none transition"
                placeholder="Create a strong password"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-md">
              Sign Up Free
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;