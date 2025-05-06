import { motion } from 'framer-motion';
import { useState } from 'react';
import {wellfound,gmail,internshala,linkedin,brand_logo_2} from "@/assets"

const Landing = ({ onLogin }: { onLogin: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-100">
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
          className="w-20 h-20 mx-auto mb-6"
        >
          <img
            src={brand_logo_2}
            alt="ReplyIn Logo"
            className="w-full h-full "
          />
        </motion.div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Covlet
        </h1>
        
        <p className="text-gray-600 mb-8">
          Your AI-powered cover letter assistant that helps you stand out
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogin}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center gap-2">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </div>
          </motion.button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button 
            className="w-full px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors duration-300"
            onClick={() => window.open('https://github.com/Csb-218/ReplyIn')}
          >
            Learn More
          </button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

       <div className='mt-5'>
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
            <img src={internshala} alt="LinkedIn" className="w-6 h-6" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.2, rotate: -10 }}
            className="p-2 bg-white rounded-full shadow-md cursor-pointer"
          >
            <img src={gmail} alt="Wellfound" className="w-6 h-6" />
          </motion.div>
        </div>
       </div>
        
      </motion.div>
    </div>
  );
};

export default Landing;