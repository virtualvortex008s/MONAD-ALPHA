import React from 'react';

interface MetaMaskLogoProps {
  className?: string;
  size?: number;
}

export const MetaMaskLogo: React.FC<MetaMaskLogoProps> = ({ 
  className = "w-5 h-5", 
  size = 20 
}) => {
  return (
    <svg
      viewBox="0 0 318.6 315.9"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MetaMask Fox Logo"
    >
      <polygon fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" points="274.1 35.5 174.6 109.4 193 65.8" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="44.4 35.5 125.6 65.8 144.1 109.4" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="238.3 206.8 211.8 247.4 268.5 263 284.8 207.7" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="33.9 207.7 50.1 263 106.8 247.4 80.3 206.8" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="103.6 138.2 87.8 162.1 144.1 164.6 142.1 104.1" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="214.9 138.2 176.4 103.5 174.4 164.6 230.8 162.1" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="106.8 247.4 140.6 230.9 111.4 208.1" />
      <polygon fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" points="177.9 230.9 211.8 247.4 207.1 208.1" />
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="211.8 247.4 177.9 230.9 180.6 253 180.3 262.3 268.5 263" />
      <polygon fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" points="50.1 263 138.3 262.3 137.9 253 140.6 230.9 106.8 247.4" />
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="135.8 206.4 105.4 197.6 120 183.3" />
      <polygon fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" points="182.8 206.4 198.6 183.3 213.2 197.6" />
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="106.8 247.4 111.6 206.8 80.3 206.8" />
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="207 206.8 211.8 247.4 238.3 206.8" />
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="230.8 162.1 174.4 164.6 179.8 206.7 182.8 206.3 198.6 183.3 213.2 197.6" />
      <polygon fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" points="87.8 162.1 105.4 197.6 120 183.3 123.1 206.3 126.1 206.7 144.1 164.6" />
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="144.1 164.6 126.1 206.7 135.8 206.4 140.6 230.9 141.4 185.3" />
      <polygon fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" points="174.4 164.6 177.2 185.3 177.9 230.9 182.8 206.4 192.5 206.7" />
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="177.9 230.9 177.2 185.3 174.4 164.6 214.9 138.2 230.8 162.1 207 206.8" />
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="106.8 247.4 111.4 206.8 87.8 162.1 103.6 138.2 144.1 164.6 141.4 185.3" />
      <polygon fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" points="180.3 262.3 180.6 253 177.9 230.9 140.6 230.9 137.9 253 138.3 262.3 106.8 247.4 117.8 256.4 140.1 271.9 178.4 271.9 200.8 256.4 211.8 247.4" />
      <polygon fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" points="177.9 230.9 140.6 230.9 143.7 253 174.9 253" />
      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="278.3 114.2 286.8 73.4 274.1 35.5 177.9 106.9 214.9 138.2 267.2 153.5 278.8 140 274.7 135.9 281.3 129.4 275.9 124 282.5 117.5" />
      <polygon fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" points="31.8 73.4 40.3 114.2 44.5 117.5 36.1 124 42.7 129.4 37.3 135.9 43.8 140 51.4 153.5 103.6 138.2 140.6 106.9 44.4 35.5" />
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="267.2 153.5 214.9 138.2 230.8 162.1 207 206.8 238.3 206.8 284.8 207.7" />
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="103.6 138.2 51.4 153.5 33.9 207.7 80.3 206.8 111.4 206.8 87.8 162.1" />
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="174.6 109.4 274.1 35.5 286.8 73.4 278.3 114.2 267.2 153.5 214.9 138.2 176.4 103.5" />
      <polygon fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" points="44.4 35.5 144.1 109.4 142.1 103.5 103.6 138.2 51.4 153.5 40.3 114.2 31.8 73.4" />
    </svg>
  );
};

export default MetaMaskLogo;
