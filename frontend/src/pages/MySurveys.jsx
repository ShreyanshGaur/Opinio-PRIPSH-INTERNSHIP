import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";

const MySurveys = () => {
  const { token } = useContext(AuthContext);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const config = { headers: { "x-auth-token": token } };
        const res = await axios.get("http://localhost:5000/api/surveys/my-surveys", config);
        setSurveys(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Could not load library");
      } finally {
        setLoading(false);
      }
    };
    if(token) fetchSurveys();
  }, [token]);

  // NEW SHARE FUNCTION
  const handleShare = (id) => {
    const link = `${window.location.origin}/take/${id}`;
    navigator.clipboard.writeText(link).then(() => {
        toast.success("Link copied!");
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this survey permanently?")) {
      try {
        const config = { headers: { "x-auth-token": token } };
        await axios.delete(`http://localhost:5000/api/surveys/${id}`, config);
        setSurveys(surveys.filter((s) => s._id !== id));
        toast.success("Survey deleted");
      } catch (err) { 
        toast.error("Failed to delete"); 
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Library...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Survey Library</h1>
        <Link to="/create-survey" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-black">
            + New Project
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {surveys.map((survey) => (
              <tr key={survey._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                  <div className="text-xs text-gray-500">{survey.questions.length} Questions</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(survey.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => handleShare(survey._id)}
                    className="text-green-600 hover:text-green-900 font-bold"
                    title="Copy Link"
                  >
                    Share
                  </button>
                  <Link to={`/results/${survey._id}`} className="text-blue-600 hover:text-blue-900">Analytics</Link>
                  <Link to={`/edit/${survey._id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                  <button onClick={() => handleDelete(survey._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {surveys.length === 0 && (
                <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                        No surveys found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MySurveys;