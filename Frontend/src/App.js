// App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";
import { Box, Typography, CircularProgress } from '@mui/material';
import QuotationsPage from "./pages/QuotationsPage";
import CreateQuotationPage from "./pages/CreateQuotationPage";

// Create placeholder components for each route
const Dashboard = () => <Box sx={{ p: 3 }}><Typography variant="h4">Dashboard</Typography></Box>;
// Remove the old placeholder component
// const Quotations = () => <Box sx={{ p: 3 }}><Typography variant="h4">Quotations</Typography></Box>;
const Clients = () => <Box sx={{ p: 3 }}><Typography variant="h4">Clients</Typography></Box>;
const Products = () => <Box sx={{ p: 3 }}><Typography variant="h4">Products & Services</Typography></Box>;
const Reports = () => <Box sx={{ p: 3 }}><Typography variant="h4">Reports & Analytics</Typography></Box>;
const Admin = () => <Box sx={{ p: 3 }}><Typography variant="h4">Administration</Typography></Box>;
const Settings = () => <Box sx={{ p: 3 }}><Typography variant="h4">Settings</Typography></Box>;
const Notifications = () => <Box sx={{ p: 3 }}><Typography variant="h4">Notifications</Typography></Box>;
const Help = () => <Box sx={{ p: 3 }}><Typography variant="h4">Help & Support</Typography></Box>;

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await fetch(`http://localhost:8000/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const responseData = await response.json();
        if (response.ok) {
          console.log(
            "Received User Data",
            responseData,
            "name",
            responseData.name
          );
          setUserName(responseData.name);
          setIsAuthenticated(true);
        } else {
          console.error("User Data not received", response.status);
          setIsAuthenticated(false);
          setUserName("");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
        setUserName("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <LoginPage />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <RegisterPage />
          } />
          
          {/* Protected routes with Layout */}
          <Route path="/" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <HomePage userName={userName} />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Dashboard />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/quotations" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <QuotationsPage />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/quotations/new" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <CreateQuotationPage />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/clients" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Clients />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/products" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Products />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/reports" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Reports />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/admin" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Admin />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/settings" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Settings />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/notifications" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Notifications />
              </Layout> : 
              <Navigate to="/login" />
          } />
          <Route path="/help" element={
            isAuthenticated ? 
              <Layout userName={userName}>
                <Help />
              </Layout> : 
              <Navigate to="/login" />
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
