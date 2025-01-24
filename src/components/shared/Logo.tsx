import React from 'react';

interface LogoProps {
  className?: string;
  fill?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-6 w-6", fill = "currentColor" }) => {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 1080 1080"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(0.000000,1080.000000) scale(0.100000,-0.100000)" fill={fill} stroke="none">
        <path d="M4048 7893 c-2 -1038 -3 -1889 -3 -1890 1 -1 379 300 842 671 l841 673 6 -341 c3 -188 8 -1439 11 -2781 3 -1342 8 -2612 11 -2823 l6 -382 1684 0 1684 0 0 2553 0 2552 -2532 1825 c-1392 1004 -2535 1826 -2539 1828 -4 2 -9 -846 -11 -1885z" />
        <path d="M2852 5042 l-1181 -947 -1 -1537 0 -1538 1179 0 1178 0 8 2481 c4 1364 5 2482 3 2484 -2 3 -536 -422 -1186 -943z" />
      </g>
    </svg>
  );
};

export default Logo; 