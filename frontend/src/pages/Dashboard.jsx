import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast"; // <--- Import Toast

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState({ totalSurveys: 0, totalQuestions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const config = { headers: { "x-auth-token": token } };
        const res = await axios.get("http://localhost:5000/api/surveys/my-surveys", config);
        const data = res.data;
        
        setSurveys(data);
        
        // Calculate Stats
        const questionCount = data.reduce((acc, curr) => acc + curr.questions.length, 0);
        setStats({ totalSurveys: data.length, totalQuestions: questionCount });
        
      } catch (err) {
        console.error("Error fetching surveys", err);
      } finally {
        setLoading(false);
      }
    };
    if(token) fetchSurveys();
  }, [token]);

  // --- NEW SHARE FUNCTION ---
  const handleShare = (id) => {
    // Construct the public link
    const link = `${window.location.origin}/take/${id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
        toast.success("Link copied to clipboard!");
    });
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading Overview...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user ? user.name : "User"} 👋</h1>
      <p className="text-gray-500 mb-8">Here is what is happening with your projects today.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full text-2xl">📂</div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Surveys</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalSurveys}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full text-2xl">❓</div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Questions</p>
            <h3 className="text-3xl font-bold text-gray-800">{stats.totalQuestions}</h3>
          </div>
        </div>

        <Link to="/create-survey" className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-center hover:shadow-xl transition transform hover:scale-[1.02]">
          <span className="text-2xl mb-2">✨</span>
          <span className="font-bold text-lg">Create New Survey</span>
          <span className="text-blue-200 text-sm">Launch a new project in seconds &rarr;</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        <Link to="/my-surveys" className="text-blue-600 text-sm font-semibold hover:underline">View All &rarr;</Link>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No activity yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {surveys.slice(0, 2).map((survey) => (
            <div key={survey._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{survey.title}</h3>
                <p className="text-gray-400 text-sm">Created: {new Date(survey.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="flex gap-2">
                 <Link to={`/results/${survey._id}`} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
                   Analytics
                 </Link>
                 
                 {/* SHARE BUTTON */}
                 <button 
                    onClick={() => handleShare(survey._id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition flex items-center gap-2"
                    title="Copy Link to Clipboard"
                 >
                    <span>🔗</span> Share
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;