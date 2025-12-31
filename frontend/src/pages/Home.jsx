import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      {/* Left Side: Branding */}
      <div className="w-1/2 bg-gradient-to-br from-blue-600 to-purple-800 text-white flex flex-col justify-center px-16 relative">
        <div className="absolute top-8 left-8">
           <span className="text-2xl font-bold tracking-wider opacity-80">OPINIO</span>
        </div>
        <h1 className="text-6xl font-extrabold mb-6 leading-tight">
          Your Voice,<br />Data Driven.
        </h1>
        <p className="text-xl text-blue-100 mb-8 max-w-lg">
          The most intuitive way to build surveys, collect real-time answers, and visualize your data.
        </p>
      </div>

      {/* Right Side: Action */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center px-16">
        <div className="max-w-md w-full text-center space-y-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Get Started</h2>
            <p className="text-gray-500">Join thousands of creators today.</p>
          </div>

          <div className="space-y-4">
            <Link 
              to="/login"
              className="w-full block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl transition shadow-lg hover:shadow-xl"
            >
              Login to Account
            </Link>
            
            <Link 
              to="/register"
              className="w-full block bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 text-lg font-semibold py-4 rounded-xl transition"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;