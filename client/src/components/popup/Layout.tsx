import { motion } from 'framer-motion';
import { useState } from 'react';
import {brand_logo_2} from "@/assets"
import {Outlet} from "react-router-dom"

const Layout = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <>
    <div className="bg-transparent">
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
 
    
    </div>
    <Outlet/>
  </>
  )
}

export default Layout