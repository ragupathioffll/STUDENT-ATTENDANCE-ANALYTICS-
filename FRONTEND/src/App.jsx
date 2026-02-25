import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import Dashboard from './Components/Dashboard';
import Students from './Components/Students';
import Attendance from './Components/Attendance';
import Reports from './Components/Reports';
import Login from './Components/Login';
import { apiService } from './api/service';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') !== null
  );
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const studentsList = await apiService.getStudents();
      setStudents(studentsList);

      // Load today's attendance by default
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await apiService.getAttendance(today);
      if (todayAttendance) {
        setAttendanceData({
          [today]: todayAttendance.records.reduce((acc, rec) => ({
            ...acc, [rec.studentId._id || rec.studentId]: rec.status
          }), {})
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-container">Loading data...</div>;

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students students={students} setStudents={setStudents} />;
      case 'attendance':
        return <Attendance students={students} attendanceData={attendanceData} setAttendanceData={setAttendanceData} />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard students={students} attendanceData={attendanceData} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <main className="main-content">
        <div className="container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
