import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  color?: 'indigo' | 'red' | 'blue';
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  color = 'indigo' 
}: LoadingSpinnerProps) {
  const colorClasses = {
    indigo: 'border-indigo-600',
    red: 'border-red-600',
    blue: 'border-blue-600'
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}
