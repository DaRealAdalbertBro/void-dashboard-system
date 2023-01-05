import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './components/Dashboard/Dashboard';
import Home from './components/Home';
import Profile from './components/Profile/Profile';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import NotFound from './components/InvalidPage/NotFound';
import UserManagement from './components/UserManagement/UserManagement';

// set Axios defaults
import Axios from 'axios';
import { useEffect } from 'react';
import { toggleTheme } from './utils/utils';
Axios.defaults.withCredentials = true;

function App() {

  useEffect(() => {
    // Immediately invoked function to set the theme on initial load
    toggleTheme();

  }, []);

  return (
    <Router>
      <div className='App'>

        <Routes>
          <Route exact path='/login' element={<LoginPage />} />

          <Route path='/dashboard' element={
            <Dashboard componentToShow={<Home />} />
          } />

          <Route path="/dashboard/users/register" element={<RegisterPage />} />

          <Route exact path='/dashboard/profile' element={
            <Dashboard componentToShow={<Profile />} />
          } />

          <Route exact path='/dashboard/profile/:userID' element={
            <Dashboard componentToShow={<Profile />} />
          } />

          <Route exact path='/dashboard/users' element={
            <Dashboard componentToShow={<UserManagement />} />
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
