// Analytics.jsx - Updated Layout
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "./Analytics.css";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();

    // Real-time polling: Fetch data every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    // Skip loading state on subsequent calls (for polling)
    if (!analyticsData) {
      setLoading(true);
    }
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(`Error ${res.status}: ${errorText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setAnalyticsData(data);
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const barData = analyticsData ? [
    { name: "Users", value: analyticsData.totalUsers },
    { name: "Projects", value: analyticsData.totalProjects },
    { name: "Active Tasks", value: analyticsData.activeTasks },
  ] : [];

  const pieData = analyticsData ? [
    { name: "Active Tasks", value: analyticsData.activeTasks, color: "#667eea" },
    { name: "Completed Tasks", value: (analyticsData.totalProjects * 5) - analyticsData.activeTasks || 0, color: "#f093fb" },
  ] : [];

  return (
    <div className="analytics-container">
      <h1>System Analytics</h1>
      
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      {analyticsData && !loading && (
        <div className="analytics-content">
          {/* ROW 1: 3 Stats Cards */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="icon-wrapper">
                <i className="fas fa-users"></i>
              </div>
              <h3>Total Users</h3>
              <p>{analyticsData.totalUsers}</p>
            </div>
            
            <div className="stat-card">
              <div className="icon-wrapper">
                <i className="fas fa-folder-open"></i>
              </div>
              <h3>Total Projects</h3>
              <p>{analyticsData.totalProjects}</p>
            </div>
            
            <div className="stat-card">
              <div className="icon-wrapper">
                <i className="fas fa-tasks"></i>
              </div>
              <h3>Active Tasks</h3>
              <p>{analyticsData.activeTasks}</p>
            </div>
          </div>

          {/* ROW 2: 2 Charts */}
          <div className="charts-row">
            {/* Bar Chart */}
            <div className="chart-container">
              <h3>Overview Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#a0a0a0" />
                  <YAxis stroke="#a0a0a0" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e2a4a', 
                      border: '1px solid #667eea',
                      borderRadius: '10px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[10, 10, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#667eea" />
                      <stop offset="100%" stopColor="#f093fb" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="chart-container">
              <h3>Task Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e2a4a', 
                      border: '1px solid #667eea',
                      borderRadius: '10px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;