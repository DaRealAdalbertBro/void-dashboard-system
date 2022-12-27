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
Axios.defaults.withCredentials = true;

function App() {

  return (
    <Router>
      <div className='App'>

        <Routes>
          <Route exact path='/' element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path='/dashboard' element={
            <Dashboard componentToShow={<Home />} />
          } />

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
