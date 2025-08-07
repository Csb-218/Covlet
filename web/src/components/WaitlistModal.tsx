import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !agreed) {
      setMessage('Please fill in all fields and agree to the terms.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email,
            agreed_to_terms: agreed
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage('This email is already on our waitlist!');
        } else {
          setMessage('Something went wrong. Please try again.');
        }
      } else {
        setMessage('Successfully joined the waitlist!');
        setTimeout(() => {
          onClose();
          setEmail('');
          setAgreed(false);
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Join the waitlist
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreement"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
              required
              disabled={isLoading}
            />
            <label htmlFor="agreement" className="text-sm text-gray-600 leading-relaxed">
              By subscribing to our email list, you agree to receive periodic emails from 
              CoverAI containing news, updates, promotions, and other relevant 
              information related to our products and services.
            </label>
          </div>
          
          {message && (
            <div className={`text-sm text-center ${
              message.includes('Successfully') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
}