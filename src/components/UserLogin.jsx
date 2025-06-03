// src/components/UserLogin.jsx
import React from 'react';

const USERS = ['Dave', 'Slade'];

const UserLogin = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Eleventhree Pizza
          </h1>
          <h2 className="text-xl text-gray-600">
            Inventory Management
          </h2>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 text-center mb-6">
            Select your name to continue:
          </h3>
          
          {USERS.map((user) => (
            <button
              key={user}
              onClick={() => onLogin(user)}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-lg"
            >
              {user}
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Click your name to access the inventory system</p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;