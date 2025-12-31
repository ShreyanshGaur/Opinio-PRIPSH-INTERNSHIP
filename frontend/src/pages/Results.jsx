import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Results = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { "x-auth-token": token } };
        const res = await axios.get(`http://localhost:5000/api/surveys/results/${id}`, config);
        setSurvey(res.data.survey);
        setResponses(res.data.responses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  // --- CSV Export Logic ---
  const downloadCSV = () => {
    if (!survey || responses.length === 0) return alert("No data to export");

    // 1. Create Headers (Survey Title + Question Texts)
    let csvContent = "data:text/csv;charset=utf-8,";
    const headers = ["Submission Date", ...survey.questions.map(q => `"${q.questionText}"`)];
    csvContent += headers.join(",") + "\n";

    // 2. Map Responses to Rows
    responses.forEach(res => {
      const row = [];
      
      // Add Date
      row.push(`"${new Date(res.submittedAt).toLocaleString()}"`);

      // Add Answers for each question
      survey.questions.forEach(q => {
        const ansObj = res.answers.find(a => a.questionId === q._id);
        let ansText = "";
        
        if (ansObj) {
            // If answer is array (checkbox), join with semicolon; otherwise just string
            ansText = Array.isArray(ansObj.answer) ? ansObj.answer.join("; ") : ansObj.answer;
        }
        // Escape quotes to prevent CSV errors
        row.push(`"${ansText.replace(/"/g, '""')}"`);
      });

      csvContent += row.join(",") + "\n";
    });

    // 3. Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("button");
    const a = document.createElement("a");
    a.setAttribute("href", encodedUri);
    a.setAttribute("download", `${survey.title.replace(/ /g, "_")}_Results.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // -------------------------

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;

  // Chart Logic
  const getChartData = (question) => {
    const counts = {};
    if(question.options) question.options.forEach(opt => counts[opt] = 0);

    responses.forEach((res) => {
      const answerObj = res.answers.find((a) => a.questionId === question._id);
      if (answerObj) {
        const val = answerObj.answer;
        if (Array.isArray(val)) {
          val.forEach(v => { if (counts[v] !== undefined) counts[v]++; });
        } else {
          if (counts[val] !== undefined) counts[val]++;
        }
      }
    });

    return {
      labels: Object.keys(counts),
      datasets: [{
          label: "Votes",
          data: Object.values(counts),
          backgroundColor: "rgba(59, 130, 246, 0.6)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 1,
      }],
    };
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header with Export Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{survey.title}</h1>
          <p className="text-gray-500 mt-1">
              Total Responses: <span className="font-bold text-black">{responses.length}</span>
          </p>
        </div>
        
        <div className="flex gap-3">
            <Link to="/dashboard" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                &larr; Back
            </Link>
            <button 
                onClick={downloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow flex items-center gap-2 transition"
            >
                <span>📥</span> Download CSV
            </button>
        </div>
      </div>

      <div className="space-y-8">
        {survey.questions.map((q, index) => (
          <div key={q._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {index + 1}. {q.questionText}
            </h3>

            {q.questionType === "text" ? (
              <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto space-y-2 border border-gray-100">
                {responses.map((res, i) => {
                  const ans = res.answers.find(a => a.questionId === q._id);
                  return ans ? (
                    <div key={i} className="border-b border-gray-200 pb-2 text-gray-700 last:border-0 last:pb-0">
                      {ans.answer}
                    </div>
                  ) : null;
                })}
                {responses.length === 0 && <p className="text-gray-400 italic">No responses yet.</p>}
              </div>
            ) : (
              <div className="h-64">
                <Bar 
                  data={getChartData(q)} 
                  options={{ 
                    maintainAspectRatio: false, 
                    responsive: true,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                  }} 
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;