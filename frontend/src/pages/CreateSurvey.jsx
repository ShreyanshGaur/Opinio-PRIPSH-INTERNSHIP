import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";

const CreateSurvey = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState(""); 
  const [expiryTime, setExpiryTime] = useState(""); 

  // Added 'required: true' to initial state
  const [questions, setQuestions] = useState([
    { questionText: "", questionType: "text", options: "", required: true }
  ]);

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
    const loadingToast = toast.loading("Creating survey...");

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
      await axios.post("http://localhost:5000/api/surveys", surveyData, config);
      
      toast.dismiss(loadingToast);
      toast.success("Survey Published!");
      navigate("/dashboard");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create survey.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Survey</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Survey Title</label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Customer Feedback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Description</label>
            <textarea
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Survey details..."
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

        {/* Questions Section */}
        {questions.map((q, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-bold">✕ Remove</button>
            )}

            <div className="mb-4 pr-10">
              <label className="block text-gray-600 text-sm font-bold mb-1">Question {index + 1}</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Type your question..."
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

              {/* NEW: Required Toggle */}
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
                    placeholder="Option 1, Option 2, Option 3"
                    value={q.options}
                    onChange={(e) => handleQuestionChange(index, "options", e.target.value)}
                    required
                  />
                </div>
              )}
          </div>
        ))}

        <div className="flex justify-between items-center pt-4 pb-10">
          <button type="button" onClick={addQuestion} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded transition">+ Add Question</button>
          <button type="submit" className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg shadow hover:bg-green-700 transition">Save & Publish</button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;