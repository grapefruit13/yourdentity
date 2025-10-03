"use client";

import React from "react";

interface CommunityButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

const CommunityButton: React.FC<CommunityButtonProps> = ({
  onClick,
  children = "커뮤니티 버튼",
}) => {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
    >
      {children}
    </button>
  );
};

export default CommunityButton;
