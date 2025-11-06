"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface UserImage {
  id: string;
  image: string;
  user: string;
}

interface UserImageCarouselSectionProps {
  images: UserImage[];
}

const UserImageItem = ({ src, user }: { src: string; user: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div className="flex-shrink-0">
      <div
        className="relative h-20 w-20 overflow-hidden rounded-lg bg-gray-100"
        style={{ width: "80px", height: "100px" }}
      >
        <Image
          src={src}
          alt={`${user}의 이미지`}
          fill
          className="object-cover"
          onError={() => setHasError(true)}
        />
        {/* 프로필 아이콘 */}
        <div className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-400">
          <svg
            className="h-4 w-4 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const UserImageCarouselSection = ({
  images,
}: UserImageCarouselSectionProps) => {
  return (
    <div className="mb-6">
      {images ? (
        <>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            이런 후기도 있어요! 👀
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((imageData) => (
              <UserImageItem
                key={imageData.id}
                src={imageData.image}
                user={imageData.user}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <Skeleton className="mb-3 h-5 w-40" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-shrink-0">
                <Skeleton
                  className="h-[100px] w-20 rounded-lg"
                  style={{ width: "80px", height: "100px" }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserImageCarouselSection;
