import { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { IProfileSchema, user } from "../../types";
import Home from "../../components/popup/Home";
import ProfileBuild from "@/components/popup/ProfileBuild";
import Layout from "../../components/popup/Layout";
import Landing from "../../components/popup/Landing";
import { addResumeDataToDB } from "@/services/server";
import "./App.css";


function App() {
  const [user, setUser] = useState<user | null>(null);
  const [isLoggingState, setLoggingState] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setLoggingState(true);
      const loggedin = await chrome.runtime.sendMessage({
        type: "GOOGLE_LOGIN",
      });
      console.log(loggedin);
    } catch (error) {
      console.log(error);
    } finally {
      // addResumeDataToDB(resume,user?.email)
      setLoggingState(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    chrome.storage.local.get(["user"], (result) => {
      if (result.user) {
        setUser(result.user);
        const resume:IProfileSchema = {
          personal: {
            name: result.user.name,
            phone: "",
            linkedin: "",
            email: result.user.email,
          },
          summary: "",
          experience: [],
          education: [],
          skills: {
            technical: [],
            soft: [],
          },
          certifications: [],
          languages: [],
          projects: [],
        };
        addResumeDataToDB(resume);
        console.log(result.user.email);
      }
    });
  }, [isLoggingState]);

  if (!user) {
    return (
      <div className="h-full flex flex-col">
        <Landing handleLogin={handleLogin} isLoggingState={isLoggingState} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <MemoryRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home setUser={setUser} user={user} />} />
            <Route
              path="/profile"
              element={<ProfileBuild setUser={setUser} user={user} />}
            />
          </Routes>
        </Layout>
      </MemoryRouter>
    </div>
  );
}

export default App;
