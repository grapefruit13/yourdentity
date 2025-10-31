"use client";

import { ChevronRight } from "lucide-react";
import { Typography } from "@/components/shared/typography";

interface SettingsItemProps {
  text: string;
  onClick?: () => void;
  showArrow?: boolean;
}

const SettingsItem = ({
  text,
  onClick,
  showArrow = false,
}: SettingsItemProps) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between p-4 transition-colors hover:bg-gray-50"
    >
      <Typography font="noto" variant="body1R" className="text-black">
        {text}
      </Typography>
      {showArrow && <ChevronRight className="h-5 w-5 text-gray-400" />}
    </button>
  );
};

interface SettingsSectionProps {
  title: string;
  items: SettingsItemProps[];
}

const SettingsSection = ({ title, items }: SettingsSectionProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Typography
        as="h3"
        font="noto"
        variant="body2B"
        className="px-4 text-gray-500"
      >
        {title}
      </Typography>
      <div className="overflow-hidden rounded-2xl bg-white">
        {items.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0">
            <SettingsItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsSection;
