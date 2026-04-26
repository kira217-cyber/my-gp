import React from "react";
import loading from "../../assets/Loading.gif";
/**
 * Loading Component
 * Usage:
 *  <Loading open={loading} />
 *  <Loading open text="Processing..." />
 */
const Loading = ({ open = false, text = "" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      {/* Loader */}
      <div className="relative flex flex-col items-center justify-center">
        {/* ROUND WRAPPER */}
        <div className="loader-wrap">
          {/* pulse layers */}
          <span className="pulse-ring pulse-1" />
          <span className="pulse-ring pulse-2" />

          {/* main circle */}
          <div className="loader-core">
            <img
              src={loading}
              alt="Loading"
              className="h-full w-full select-none pointer-events-none rounded-full"
              draggable={false}
            />
          </div>
        </div>

        {/* Optional text */}
        {/* {text && (
          <div className="mt-5 text-[13px] font-extrabold text-yellow-200/90">
            {text}
          </div>
        )} */}
      </div>

      {/* Component CSS */}
      <style>{`
        /* wrapper keeps center, but MUST allow overflow so pulse can spread */
        .loader-wrap{
          position: relative;
          width: 240px;
          height: 240px;
          border-radius: 9999px;
          overflow: visible; /* ✅ allow pulse spread */
          display: flex;
          align-items: center;
          justify-content: center;
          isolation: isolate; /* ✅ keeps glow layering clean */
        }

        .loader-core{
          width: 200px;
          height: 200px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.95);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index: 2;

          border: 3px solid #f5c400;
          box-shadow:
            0 0 0 4px rgba(245,196,0,0.18),
            0 0 18px rgba(245,196,0,0.45),
            0 0 36px rgba(245,196,0,0.25);
        }

        /* Pulse rings start at core size then expand outward */
        .pulse-ring{
          position:absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%) scale(0.88);
          border-radius: 9999px;
          border: 2px solid rgba(245,196,0,0.65);
          opacity: 0;
          z-index: 1;
          pointer-events: none;

          /* extra glow for visibility */
          box-shadow:
            0 0 14px rgba(245,196,0,0.35),
            0 0 30px rgba(245,196,0,0.22);
          filter: blur(0.2px);
        }

        .pulse-1{
          animation: pulseSpread 1.35s ease-out infinite;
        }

        .pulse-2{
          animation: pulseSpread 1.35s ease-out infinite;
          animation-delay: 0.45s;
        }

        @keyframes pulseSpread{
          0% {
            transform: translate(-50%, -50%) scale(0.88);
            opacity: 0;
          }
          18% {
            opacity: 0.85;
          }
          55% {
            opacity: 0.28;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.32); /* ✅ spread outward */
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
