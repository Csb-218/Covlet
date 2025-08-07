import React from 'react';
import { Leaf } from 'lucide-react';

interface HeaderProps {
  onAboutClick?: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  return (
    <header className="w-full bg-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Leaf className="w-8 h-8 text-green-500" />
          <span className="text-2xl font-bold text-gray-800">Covlet</span>
        </div>
        
        <nav className="flex items-center space-x-6">
          <button 
            onClick={onAboutClick}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            About
          </button>
        </nav>
      </div>
    </header>
  );
}