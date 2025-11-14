import React, { useState } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import MetaData from "./pages/MetaData";
import Alerts from "./pages/Alert";
import AuthLayout from "./layouts/AuthLayout/AuthLayout";
import AppService from "./pages/AppService/AppService";
import Scheduler from "./pages/Scheduler/Scheduler";
import DataCenter from "./pages/DataCenter/DataCenter";
import { isAuthenticated } from "./utils/authHelper";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
  };

  

  return (
    <Router>
      {isLoggedIn ? (
        <MainLayout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meta-data" element={<MetaData />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/app-service" element={<AppService />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/data-center" element={<DataCenter />} />
          </Routes>
        </MainLayout>
      ) : (
        <AuthLayout onLoginSuccess={handleLoginSuccess} />
      )}
    </Router>
  );
}

export default App;