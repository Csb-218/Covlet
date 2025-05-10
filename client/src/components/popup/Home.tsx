import React from "react";
import { user } from "../../types";
import ResumeUploader from "./ResumeUploader";
import { NavLink } from "react-router-dom";
import { getResumeDataFromDB } from "@/services/server";

const Home = ({
  setUser,
  user,
}: {
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  user: user;
}) => {

  const [isResumeAvailable, setIsResumeAvailable] = React.useState<boolean>(false);

  const handleLogout = () => {
    chrome.storage.local.remove(["user"], () => {
      setUser(null);
    });
  };

  React.useEffect(() => {
    getResumeDataFromDB(user.email)
      .then((response) => {
        setIsResumeAvailable(true);
        console.log("Resume data fetched successfully:", response);
      })
      .catch((error) => {
        setIsResumeAvailable(false);
        console.error("Error fetching resume data:", error);
      });
  }
  , []);





  return (
    <div className="p-4">
      <p id="div" className="text-3xl">
        Hi {user.given_name} !
      </p>
      <h2>
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
      <span>
        Edit your 
        <NavLink to={"/profile"} className="text-blue-500 hover:underline">
           profile
        </NavLink>
      </span>

      <div className="mt-4">
        <p className="text-sm">Logged in as: {user.email}</p>
        <button
          onClick={handleLogout}
          className="mt-2 text-sm text-red-500 hover:text-red-600"
        >
          Logout
        </button>
      </div>
      {/* <h2 className="mt-4">
        Open
        <span
          className="cursor-pointer mx-1 underline"
          onClick={() => window.open("https://linkedin.com")}
        >
          LinkedIn
        </span>
        to start!
      </h2> */}
      { isResumeAvailable ?
        <p className="text-sm text-green-500">Resume data is available</p>
        :
        <>
        <p className="text-sm text-red-500">No resume data found</p>
        <ResumeUploader />
        </>
        
      }
    </div>
  );
};

export default Home;
