import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { wellfound, gmail, internshala, linkedin, brand_logo_2 , floating_robot } from "@/assets"
import SpinnerXlBasicHalf from "@/components/common/AsyncSpinner"

interface props{
  handleLogin:()=>void
  isLoggingState:boolean
}
const Landing = ({handleLogin , isLoggingState}:props) => {

  // const [isLoggingState, setLoggingState] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false);
  // const handleLogin = async () => {
  //   setLoggingState(true)
  //   const loggedin = await chrome.runtime.sendMessage({ type: 'GOOGLE_LOGIN' });
  //   console.log(loggedin)
  //   setLoggingState(false)
  // };





  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto relative bg-radial-[at_50%_75%] from-emerald-100 via-teal-200 to-cyan-300 to-90%">
      {/* Animated Background */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 animate-gradient-x"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 "></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 "></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 "></div>
      </div> */}
      
      {/* Content */}
      <div className="relative z-10">

      <h1 className="text-xl font-light bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
          Covlet
      </h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.5 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="w-16 h-16 mx-auto mb-4"
        >
          <img
            src={floating_robot}
            alt="Covlet Logo"
            className="w-full h-full aspect-square "
          />
        </motion.div>

        <h2 className="text-3xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">Welcome!</h2>

        <p className="text-gray-600 mb-6">
          Your AI-powered cover letter assistant that helps you stand out
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogin}
            disabled={isLoggingState}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >


            <div className="flex items-center justify-center gap-2" data-testid="login-button">
              {
                isLoggingState ?
                  <SpinnerXlBasicHalf data-testid="spinner"/>

                  :
                  <>
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    <span>Login with Google</span>
                  </>
              }
            </div>



          </motion.button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            className="w-full px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors duration-300"
            onClick={() => window.open('https://www.covlet.in/')}
          >
            Learn More
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className='mt-4'>
          <p>Integrated with</p>

          <div className=" flex justify-center space-x-4 m-1">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="p-2 bg-white rounded-full shadow-md cursor-pointer"
            >
              <img src={linkedin} alt="LinkedIn" className="w-6 h-6" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2, rotate: -10 }}
              className="p-2 bg-white rounded-full shadow-md cursor-pointer"
            >
              <img src={wellfound} alt="Wellfound" className="w-6 h-6" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="p-2 bg-white rounded-full shadow-md cursor-pointer"
            >
              <img src={internshala} alt="Internshala" className="w-6 h-6" />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.2, rotate: -10 }}
              className="p-2 bg-white rounded-full shadow-md cursor-pointer"
            >
              <img src={gmail} alt="Gmail" className="w-6 h-6" />
            </motion.div>
          </div>
        </div>

      </motion.div>
      </div>
    </div>
  );
};

export default Landing;