import React from 'react'
import {
  BrowserRouter as Router, Routes,
  Route, Navigate,
} from "react-router-dom"

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Dashboard/Home';
import Expense from './pages/Dashboard/Expense';
import Income from './pages/Dashboard/Income';
import UserProvider from './context/UserContext';
import {Toaster} from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <div>
      <Router>
        <Routes>
          <Route path='/' element={<Root />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signUp' element={<SignUp />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/income" element={<Income />} />
        </Routes>
      </Router>
    </div>

    <Toaster
      toastOptions={{
        className:"",
        style:{
          fontsize:'13px'
        }
      }}
    />
    </UserProvider>
  );
};

const Root = () => {
  // Checking if token exists in localSotrage
  const isAuthenticated = !!localStorage.getItem('token');

  //if the token exists then redirect to dashboiard otherwise to the login page
  return isAuthenticated ? (
    <Navigate to="/dashboard" />) : (<Navigate to="/login" />);
}; 

export default App;