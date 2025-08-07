import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import WaitlistModal from './components/WaitlistModal';

type Page = 'home' | 'about';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleJoinWaitlist = () => {
    setIsWaitlistOpen(true);
  };

  const handleLearnMore = () => {
    setCurrentPage('about');
  };

  const handleAboutClick = () => {
    setCurrentPage('about');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onAboutClick={handleAboutClick} />
      
      {currentPage === 'home' ? (
        <HomePage 
          onJoinWaitlist={handleJoinWaitlist}
          onLearnMore={handleLearnMore}
        />
      ) : (
        <AboutPage 
          onBack={handleBackToHome}
          onJoinWaitlist={handleJoinWaitlist}
        />
      )}
      
      {/* Footer */}
      <footer className="bg-green-50 py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 lg:mb-0">
            <span className="text-2xl font-bold text-gray-800">Covlet</span>
            <span className="text-gray-600">© 2025 Covlet Inc</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="https://www.linkedin.com/company/covlet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 font-medium hover:text-green-500 transition-colors"
            >
              Company
            </a>
            <button className="text-gray-700 font-medium hover:text-green-500 transition-colors">
              Privacy
            </button>
          </div>
        </div>
      </footer>
      
      <WaitlistModal 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />
    </div>
  );
}

export default App;