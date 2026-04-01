import { ImageResponse } from "next/server";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Habit Tracker Icon";
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
          background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "100px",
          fontWeight: "bold",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.1)",
        }}
      >
        H
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
