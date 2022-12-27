import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './components/Dashboard/Dashboard';
import Home from './components/Home';
import Profile from './components/Profile/Profile';

import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import NotFound from './components/InvalidPage/NotFound';


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
          <Route path="*" element={<NotFound />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
