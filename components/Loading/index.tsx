import React from 'react';

export const Loading = () => {
  return (
    <span className="gaianetLoader">
      <style jsx>{`
        .gaianetLoader {
          width: 36px;
          height: 36px;
          border: 3px solid #d43327;
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </span>
  );
};
