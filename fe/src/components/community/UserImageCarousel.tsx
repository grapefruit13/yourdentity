"use client";

import React from "react";
import { UserImage } from "@/types/community";

interface UserImageCarouselProps {
  images: UserImage[];
}

const UserImageCarousel: React.FC<UserImageCarouselProps> = ({ images }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {images.map((imageData) => (
        <div key={imageData.id} className="flex-shrink-0">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100" style={{ width: '80px', height: '100px' }}>
            <img
              src={imageData.image}
              alt={`${imageData.user}의 이미지`}
              className="h-full w-full object-cover"
            />
            {/* 프로필 아이콘 */}
            <div className="absolute top-1 left-1 h-6 w-6 rounded-full bg-gray-400 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserImageCarousel;
