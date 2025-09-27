import React from "react";
import { user } from "../../types";
import ResumeUploader from "./ResumeUploader";
import { getResumeDataFromDB } from "@/services/server";
import { NavLink } from "react-router-dom";

interface props{
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  user: user;
}

const Home = ({ setUser, user}: props) => {

  const [isResumeAvailable, setIsResumeAvailable] = React.useState<boolean>(false);
  console.log("hi home")
  const handleLogout = () => {
    chrome.storage.local.remove(["user"], () => {
      setUser(null);
    });
  };


  async function getResumeAndStore(){
    try{
      const response = await getResumeDataFromDB(user.email);
      setIsResumeAvailable(true);

      const userObject = await chrome.storage.local.get("user");

       const updatedUser = {
          ...userObject.user,
          resume: response,
        };

      chrome.storage.local.set({ user: updatedUser }, () => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
          } else {
            console.log("Resume data stored in user object successfully");
          }
        });
        
    }catch(error){
        setIsResumeAvailable(false);
        console.error("Error fetching resume data:", error);
    };
  }

  React.useEffect(() => {

    if(!user.resume){
      getResumeAndStore();
    }else{
      setIsResumeAvailable(true);
    }
    

  }, [user.email]);


  return (
    <div className="p-4 h-full flex flex-col relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-gradient-y"></div>
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-bounce"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 relative z-10">
        <p id="div" className="text-3xl mb-4">
          Hello {user.given_name} !
        </p>
        <h2 className="mb-4">
          {" "}
          I am
          <span
            className="cursor-pointer mx-1 text-lime-600 font-bold"
            onClick={() => window.open("https://covlet.in")}
          >
            Covlet
          </span>
          - An AI text generator
        </h2>
    <NavLink 
      to={"/profile"}
      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-white/20"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      View Profile
    </NavLink>

        <div className="mt-6 space-y-4">
          { isResumeAvailable ?
            <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-lg shadow-lg">
              <p className="text-sm text-green-700 font-medium">✓ Resume data is available</p>
              <p className="text-xs text-green-600 mt-1">You can now generate personalized cover letters!</p>
            </div>
            :
            <div className="space-y-3">
              <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-lg shadow-lg">
                <p className="text-sm text-red-700 font-medium">⚠ No resume data found</p>
                <p className="text-xs text-red-600 mt-1">Upload your resume to get started</p>
              </div>
              <ResumeUploader 
                isResumeAvailable={isResumeAvailable}
                setIsResumeAvailable={setIsResumeAvailable}
                user={user}
              />
            </div>
          }
        </div>
      </div>
      
      {/* Footer with user info and logout */}
      <div className="border-t border-gray-200/50 pt-4 mt-4 relative z-10">
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-lg p-2 border border-white/30">
          <p className="text-xs text-gray-600">{user.email}</p>
          <button
            onClick={handleLogout}
            className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50/80 transition-colors backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
