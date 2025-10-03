"use client";

import { ChevronRight } from "lucide-react";

interface SettingsItemProps {
  text: string;
  onClick?: () => void;
  showArrow?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  text, 
  onClick, 
  showArrow = false 
}) => {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <span className="text-black">{text}</span>
      {showArrow && <ChevronRight className="h-5 w-5 text-gray-400" />}
    </button>
  );
};

interface SettingsSectionProps {
  title: string;
  items: SettingsItemProps[];
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, items }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="px-4 text-sm text-gray-500">{title}</h3>
      <div className="rounded-2xl bg-white overflow-hidden">
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
