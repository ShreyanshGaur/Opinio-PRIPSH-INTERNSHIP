import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast"; // <--- Import toast

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      login(res.data.token);
      toast.success("Welcome back!"); // <--- Nice success message
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Login Failed. Check credentials."); // <--- Nice error message
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-800 text-white flex-col justify-center px-16">
        <h1 className="text-5xl font-bold mb-4">Welcome Back.</h1>
        <p className="text-xl text-blue-100">Log in to access your surveys and analytics.</p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-12 relative">
        <Link to="/" className="absolute top-8 right-8 text-gray-400 hover:text-gray-600">✕ Close</Link>
        
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Sign In</h2>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                placeholder="name@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-md">
              Log In
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;