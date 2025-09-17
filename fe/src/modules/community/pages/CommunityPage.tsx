'use client';

import React, { useState } from 'react';
import CommunityButton from '../components/CommunityButton';
import CommunityModal from '../components/CommunityModal';

/**
 * @description 커뮤니티 페이지
 */
const CommunityPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <CommunityButton onClick={handleButtonClick} />
      <CommunityModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default CommunityPage;
