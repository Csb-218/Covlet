import { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route  } from "react-router-dom";
import { user } from "../../types";
import Home from "../../components/popup/Home";
import ProfileBuild from '@/components/popup/ProfileBuild';
import Layout from '../../components/popup/Layout';
import Landing from '../../components/popup/Landing';
import './App.css';

function App() {
  const [user, setUser] = useState<user | null>(null);
  const [checkAuth, setCheckAuth] = useState<boolean>(false);


  const handleLogin = async () => {
    const loggedin = await chrome.runtime.sendMessage({ type: 'GOOGLE_LOGIN' });
  };

  useEffect(() => {
    // Check if user is already logged in
    chrome.storage.local.get(['user'], (result) => {
      if (result.user) {
        setUser(result.user);
      }
    });
  }, [user,checkAuth]);

  if (!user) {
    return <Landing onLogin={handleLogin} />;
  }

  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={<Home setUser={setUser} user={user} />}
          />
          <Route
            path="/profile"
            element={<ProfileBuild />}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

export default App;
