import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import Login from './components/Login';

// Use host port 8000 matching Docker Compose, with configure override.
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  
  // Loading states
  const [isLoadingSimulate, setIsLoadingSimulate] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isTakingAction, setIsTakingAction] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  // Authentication handlers
  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    
    // Clear console workspace state
    setCases([]);
    setSelectedCaseId(null);
    setSelectedCaseDetails(null);
    setHasSimulated(false);
  };

  // Build authorization headers helper
  const getAuthHeaders = (extraHeaders = {}) => {
    return {
      'Authorization': `Bearer ${token}`,
      ...extraHeaders
    };
  };

  // Fetch all cases
  const fetchCases = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/cases`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch cases");
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  // Trigger synthetic data simulation
  const simulateData = async () => {
    if (!token) return;
    setIsLoadingSimulate(true);
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("Simulation failed");
      setHasSimulated(true);
      await fetchCases();
      
      // Clear selected case since list is regenerated
      setSelectedCaseId(null);
      setSelectedCaseDetails(null);
    } catch (err) {
      console.error("Simulation failed:", err);
      alert("Failed to connect to the backend. Please ensure the backend server is running.");
    } finally {
      setIsLoadingSimulate(false);
    }
  };

  // Load a specific case's details
  const loadCaseDetail = async (id) => {
    if (!token) return;
    setSelectedCaseId(id);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`${API_BASE}/cases/${id}`, {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("Failed to load case details");
      const data = await res.json();
      setSelectedCaseDetails(data);
    } catch (err) {
      console.error("Error loading case:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Execute triage action (escalate, dismiss, false_positive)
  const takeAction = async (action) => {
    if (!selectedCaseId || !token) return;
    setIsTakingAction(true);
    try {
      const res = await fetch(`${API_BASE}/cases/${selectedCaseId}/action`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ action }),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(`Action ${action} failed`);
      
      // Refresh list & current details
      await fetchCases();
      await loadCaseDetail(selectedCaseId);
    } catch (err) {
      console.error(`Failed to record action ${action}:`, err);
    } finally {
      setIsTakingAction(false);
    }
  };

  // Initial load when token changes
  useEffect(() => {
    if (token) {
      fetchCases();
    }
  }, [token]);

  // If session token is missing, redirect/render login panel
  if (!token) {
    return <Login onLogin={handleLogin} apiBase={API_BASE} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-slate-100 bg-[#0b0f19]">
      <Navbar
        onSimulate={simulateData}
        isLoading={isLoadingSimulate}
        username={username}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mt-4">
        {/* Left column: Case Checklist */}
        <CaseList
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={loadCaseDetail}
          hasSimulated={hasSimulated}
        />

        {/* Right column: Incident Details & Event Timeline */}
        <CaseDetail
          caseData={selectedCaseDetails}
          isLoadingDetail={isLoadingDetail}
          onTakeAction={takeAction}
          isTakingAction={isTakingAction}
        />
      </main>
    </div>
  );
}
