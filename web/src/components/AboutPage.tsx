import React from 'react';
import { ArrowLeft, Chrome, Zap, Target } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
  onJoinWaitlist: () => void;
}

export default function AboutPage({ onBack, onJoinWaitlist }: AboutPageProps) {
  return (
    <div className="flex-grow">
      {/* Header with back button */}
      <div className="pt-8 pb-4 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-green-500 hover:text-green-600 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-green-500 font-medium mb-2">
            # Initial Launch stage 1
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Say goodbye to generic cover letters and email templates !
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Our Chrome extension reads job descriptions on platforms like 
                LinkedIn, Wellfound, and Internshala, then generates 
                personalized cover letters designed to get you noticed.
              </p>
              
              <button
                onClick={onJoinWaitlist}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
              >
                Join Waitlist
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gray-100 p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Chrome className="w-8 h-8 text-blue-500" />
                    <span className="font-semibold text-gray-800">Covlet Extension</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-700">Job Analysis</span>
                      </div>
                      <div className="w-full h-2 bg-green-200 rounded-full">
                        <div className="w-4/5 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-700">AI Generation</span>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-1 bg-blue-200 rounded"></div>
                        <div className="w-3/4 h-1 bg-blue-200 rounded"></div>
                        <div className="w-5/6 h-1 bg-blue-200 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-green-700 font-medium mb-2">✓ Cover Letter Ready</div>
                      <div className="text-sm text-green-600">
                        Personalized content generated successfully
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Explore all our features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <Chrome className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Chrome Integration</h3>
              <p className="text-gray-600">Seamlessly works with job platforms</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Advanced AI creates personalized content</p>
            </div>
            
            <div className="p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Targeted Results</h3>
              <p className="text-gray-600">Tailored to each job description</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}