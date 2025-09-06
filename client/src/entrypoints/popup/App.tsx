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
   const [isLoggingState, setLoggingState] = useState<boolean>(false);

   const handleLogin = async () => {
    try{
      setLoggingState(true)
      const loggedin = await chrome.runtime.sendMessage({ type: 'GOOGLE_LOGIN' });
    }catch(error){
      console.log(error)
    }finally{
      setLoggingState(false)
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    chrome.storage.local.get(['user'], (result) => {
      if (result.user) {
        setUser(result.user);
      }
    });
  }, [user,isLoggingState]);

  if (!user) {
    return <Landing handleLogin={handleLogin} isLoggingState={isLoggingState} />;
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
            element={<ProfileBuild setUser={setUser} user={user}/>}
          />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

export default App;
