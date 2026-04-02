import { ImageResponse } from "next/server";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Forme Habits Icon";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse 
      <div
        style={{
          fontSize: 300,
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "128px",
          border: "2px solid rgba(16, 185, 129, 0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        
        {/* Simple Dumbbell Icon SVG */}
        <svg
          width="280"
          height="280"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.4))",
          }}
        >
          <path d="M14.4 14.4 9.6 9.6" />
          <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.767a2 2 0 1 1-2.829-2.828l-1.767 1.767a2 2 0 1 1-2.829-2.828l1.767-1.767a2 2 0 1 1-2.829-2.828l2.829-2.828a2 2 0 1 1 2.828 2.829l1.768-1.768a2 2 0 1 1 2.828 2.829l1.768-1.768a2 2 0 1 1 2.828 2.829l-1.768 1.768a2 2 0 1 1 2.828 2.829l-2.828 2.828Z" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
