import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TakeSurvey = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/surveys/public/${id}`);
        setSurvey(res.data);
      } catch (err) {
        if(err.response && err.response.status === 423) {
            setExpired(true);
        } else {
            toast.error("Survey not found");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleCheckboxChange = (questionId, option) => {
    const currentAnswers = answers[questionId] || [];
    let newAnswers;
    if (currentAnswers.includes(option)) {
      newAnswers = currentAnswers.filter(item => item !== option);
    } else {
      newAnswers = [...currentAnswers, option];
    }
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- 1. VALIDATION CHECK ---
    const missing = [];
    survey.questions.forEach(q => {
        if (q.required) {
            const val = answers[q._id];
            // Check if empty, or if array is empty (for checkboxes)
            if (!val || (Array.isArray(val) && val.length === 0)) {
                missing.push(q.questionText);
            }
        }
    });

    if (missing.length > 0) {
        toast.error(`Please fill out required questions: ${missing.length}`);
        return; // <--- STOP HERE
    }

    // --- 2. SUBMISSION ---
    const loadingToast = toast.loading("Submitting...");
    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      answer: answers[qId]
    }));

    try {
      await axios.post("http://localhost:5000/api/surveys/response", {
        surveyId: id,
        answers: formattedAnswers
      });
      toast.dismiss(loadingToast);
      toast.success("Thank you! Response recorded.");
      setSubmitted(true);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to submit response. Try again.");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading Survey...</div>;
  
  if (expired) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border-t-4 border-red-500">
                <div className="text-5xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Survey Closed</h1>
                <p className="text-gray-600">This survey is no longer accepting responses.</p>
            </div>
        </div>
    );
  }

  if (!survey) return <div className="text-center mt-20 text-red-500">Survey not found.</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your response has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-t-xl border-b-4 border-blue-600 shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && <p className="text-gray-600 mt-2">{survey.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {survey.questions.map((q) => (
            <div key={q._id} className={`bg-white p-6 rounded-xl shadow-sm border ${q.required ? "border-l-4 border-l-blue-500 border-gray-200" : "border-gray-200"}`}>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                {q.questionText} 
                {q.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                {!q.required && <span className="text-gray-400 text-sm ml-2 font-normal">(Optional)</span>}
              </label>

              {q.questionType === 'text' && (
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Your answer"
                  onChange={(e) => handleInputChange(q._id, e.target.value)}
                />
              )}

              {q.questionType === 'radio' && (
                <div className="space-y-2">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center">
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        className="w-4 h-4 text-blue-600"
                        onChange={(e) => handleInputChange(q._id, e.target.value)}
                      />
                      <span className="ml-2 text-gray-700">{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {q.questionType === 'checkbox' && (
                <div className="space-y-2">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center">
                      <input
                        type="checkbox"
                        value={opt}
                        className="w-4 h-4 text-blue-600 rounded"
                        onChange={() => handleCheckboxChange(q._id, opt)}
                      />
                      <span className="ml-2 text-gray-700">{opt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition transform hover:scale-[1.01]"
          >
            Submit Response
          </button>
        </form>
      </div>
    </div>
  );
};

export default TakeSurvey;