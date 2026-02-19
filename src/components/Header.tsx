import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
        {title}
      </h1>
      {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
    </div>
  );
};
