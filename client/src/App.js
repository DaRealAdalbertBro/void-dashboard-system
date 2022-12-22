import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Profile from './components/Profile';
import RegisterPage from './components/RegisterPage';


function App() {

  return (
    <Router>
      <div className='App'>

        <Routes>
          <Route exact path='/' element={<LoginPage />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route exact path='/dashboard/profile' element={
            <Dashboard componentToShow={<Profile />} />
          } />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
