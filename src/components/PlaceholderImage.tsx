import React from 'react';

interface PlaceholderImageProps {
  className?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  className = '', 
  alt = 'Image placeholder',
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-1 flex items-center justify-center">
          <span className="text-white text-sm">🍽️</span>
        </div>
        <p className="text-xs text-gray-500">{alt}</p>
      </div>
    </div>
  );
};

export default PlaceholderImage; 