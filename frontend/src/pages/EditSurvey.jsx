import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";

const EditSurvey = () => {
  const { id } = useParams(); 
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState(""); 
  const [expiryTime, setExpiryTime] = useState(""); 
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/surveys/public/${id}`);
        const data = res.data;
        
        setTitle(data.title);
        setDescription(data.description || "");
        
        // Split DB Date into Date and Time inputs
        if(data.expiresAt) {
            const dateObj = new Date(data.expiresAt);
            setExpiryDate(dateObj.toISOString().split('T')[0]);
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            setExpiryTime(`${hours}:${minutes}`);
        }
        
        const formattedQuestions = data.questions.map(q => ({
            ...q,
            options: q.options ? q.options.join(", ") : "",
            required: q.required !== undefined ? q.required : true
        }));
        
        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (err) {
        toast.error("Could not load survey data");
      }
    };
    fetchSurvey();
  }, [id]);

  // --- NEW: SHARE FUNCTION ---
  const handleShare = () => {
    const link = `${window.location.origin}/take/${id}`;
    navigator.clipboard.writeText(link).then(() => {
        toast.success("Link copied to clipboard!");
    });
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: "", questionType: "text", options: "", required: true }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving changes...");
    
    let finalExpiresAt = null;
    if (expiryDate && expiryTime) {
        finalExpiresAt = new Date(`${expiryDate}T${expiryTime}`);
    }

    const formattedQuestions = questions.map(q => ({
      ...q,
      options: q.questionType !== "text" ? q.options.split(",").map(opt => opt.trim()) : []
    }));

    const surveyData = { 
        title, 
        description, 
        questions: formattedQuestions,
        expiresAt: finalExpiresAt 
    };

    try {
      const config = { headers: { "x-auth-token": token } };
      await axios.put(`http://localhost:5000/api/surveys/${id}`, surveyData, config);
      
      toast.dismiss(loadingToast);
      toast.success("Survey Updated!");
      navigate("/dashboard");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update survey.");
    }
  };

  if(loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Share Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Survey</h1>
        
        <div className="flex gap-3">
            <button 
                type="button"
                onClick={handleShare}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition flex items-center gap-2"
            >
                🔗 Copy Link
            </button>
            <button 
                type="button"
                onClick={() => navigate("/dashboard")} 
                className="text-gray-500 hover:text-gray-700 px-3 py-2"
            >
                Cancel
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Survey Title</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-gray-700 font-bold mb-2">Close Date</label>
                <input
                type="date"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-gray-700 font-bold mb-2">Close Time</label>
                <input
                type="time"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                />
            </div>
          </div>
        </div>

        {questions.map((q, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-bold"
              >
                ✕ Remove
              </button>
            )}

            <div className="mb-4 pr-10">
              <label className="block text-gray-600 text-sm font-bold mb-1">Question {index + 1}</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-gray-600 text-sm font-bold mb-1">Answer Type</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  value={q.questionType}
                  onChange={(e) => handleQuestionChange(index, "questionType", e.target.value)}
                >
                  <option value="text">Short Text</option>
                  <option value="radio">Multiple Choice</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>

              {/* Required Toggle */}
              <div className="flex items-center h-10 pb-1">
                 <input 
                    type="checkbox" 
                    id={`req-${index}`}
                    checked={q.required}
                    onChange={(e) => handleQuestionChange(index, "required", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded mr-2"
                 />
                 <label htmlFor={`req-${index}`} className="text-gray-700 font-medium cursor-pointer select-none">
                    Required Question?
                 </label>
              </div>
            </div>

            {q.questionType !== "text" && (
                <div className="mt-4">
                  <label className="block text-gray-600 text-sm font-bold mb-1">Options (comma separated)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={q.options}
                    onChange={(e) => handleQuestionChange(index, "options", e.target.value)}
                    required
                  />
                </div>
              )}
          </div>
        ))}

        <div className="flex justify-between items-center pt-4 pb-20">
          <button type="button" onClick={addQuestion} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded">
            + Add Question
          </button>
          <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg shadow hover:bg-blue-700">
            Update Survey
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSurvey;