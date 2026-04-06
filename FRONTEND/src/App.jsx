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
    !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
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

  const handleLogin = (data, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    storage.setItem('token', data.token);
    storage.setItem('user', JSON.stringify(data.user));

    otherStorage.removeItem('token');
    otherStorage.removeItem('user');

    setUser(data.user);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
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
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />
      <main className="main-content">
        <div className="container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
