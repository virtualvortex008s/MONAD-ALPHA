import React from "react";

interface MonadLogoProps {
  className?: string;
  size?: number;
}

export const MonadLogo: React.FC<MonadLogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Official Monad Purple Circular Badge */}
      <circle cx="50" cy="50" r="48" fill="#7053F5" />
      
      {/* Official Monad White Curved Torus / Squircle Emblem */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 20C42.5 20 30 26.5 24 32.5C18 38.5 11.5 51 11.5 58.5C11.5 66 18 78.5 24 84.5C30 90.5 42.5 97 50 97C57.5 97 70 90.5 76 84.5C82 78.5 88.5 66 88.5 58.5C88.5 51 82 38.5 76 32.5C70 26.5 57.5 20 50 20ZM50 36C54 36 61 39.5 64.5 43C68 46.5 71.5 53.5 71.5 57.5C71.5 61.5 68 68.5 64.5 72C61 75.5 54 79 50 79C46 79 39 75.5 35.5 72C32 68.5 28.5 61.5 28.5 57.5C28.5 53.5 32 46.5 35.5 43C39 39.5 46 36 50 36Z"
        fill="white"
        transform="rotate(-45 50 50)"
      />
    </svg>
  );
};

export default MonadLogo;
