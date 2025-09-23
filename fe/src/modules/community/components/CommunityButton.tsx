'use client';

import React from 'react';

interface CommunityButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

const CommunityButton: React.FC<CommunityButtonProps> = ({ 
  onClick, 
  children = "커뮤니티 버튼" 
}) => {
  return (
    <button 
      onClick={onClick}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      {children}
    </button>
  );
};

export default CommunityButton;
