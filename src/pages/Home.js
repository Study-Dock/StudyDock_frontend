import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Transform Your Notes into Smart Flashcards
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Upload your handwritten or typed notes, and let AI generate interactive
        flashcards to enhance your learning experience.
      </p>
      {user ? (
        <div className="space-x-4">
          <Link
            to="/upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Upload Notes
          </Link>
          <Link
            to="/flashcards"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
          >
            View Flashcards
          </Link>
        </div>
      ) : (
        <div className="space-x-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
          >
            Sign In
          </Link>
        </div>
      )}

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">1</div>
          <h3 className="text-xl font-semibold mb-2">Upload Notes</h3>
          <p className="text-gray-600">
            Upload images of your handwritten or typed notes directly from your
            device.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">2</div>
          <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
          <p className="text-gray-600">
            Our AI extracts text and generates optimized flashcards using Gemini
            AI.
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">3</div>
          <h3 className="text-xl font-semibold mb-2">Study Smart</h3>
          <p className="text-gray-600">
            Access your flashcards anytime and accelerate your learning process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
