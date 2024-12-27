import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { UserProvider } from './UserContext';
import './App.css';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
                <Dashboard />
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
