import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast"; // <--- 1. Import Toaster

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateSurvey from "./pages/CreateSurvey";
import TakeSurvey from "./pages/TakeSurvey";
import Results from "./pages/Results";
import EditSurvey from "./pages/EditSurvey";
import Profile from "./pages/Profile";
import MySurveys from "./pages/MySurveys";

const Layout = ({ children }) => {
  const location = useLocation();
  const showSidebar = [
    "/dashboard", "/create-survey", "/my-surveys", "/profile"
  ].includes(location.pathname) 
  || location.pathname.startsWith("/results/")
  || location.pathname.startsWith("/edit/");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}
      <div className={`flex-1 ${showSidebar ? "ml-64 p-8" : ""}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* 2. Add Toaster here. You can configure position and colors */}
        <Toaster 
           position="top-right" 
           toastOptions={{
             duration: 3000,
             style: { background: '#333', color: '#fff' },
             success: { style: { background: 'green' } },
             error: { style: { background: 'red' } },
           }}
        />
        
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/take/:id" element={<TakeSurvey />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-survey" element={<ProtectedRoute><CreateSurvey /></ProtectedRoute>} />
            <Route path="/my-surveys" element={<ProtectedRoute><MySurveys /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/edit/:id" element={<ProtectedRoute><EditSurvey /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;