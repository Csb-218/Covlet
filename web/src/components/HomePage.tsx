import React from 'react';

interface HomePageProps {
  onJoinWaitlist: () => void;
  onLearnMore: () => void;
}

export default function HomePage({ onJoinWaitlist, onLearnMore }: HomePageProps) {
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Craft Job Applications in{' '}
                <span className="text-green-500">Seconds!</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Transform your job applications with our AI-powered Chrome extension.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onJoinWaitlist}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
                >
                  Join Waitlist
                </button>
                <button
                  onClick={onLearnMore}
                  className="border-2 border-green-500 text-green-500 hover:bg-green-50 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="/ezgif.com-video-to-gif-converter.gif" 
                  alt="Covlet Chrome Extension Demo"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}