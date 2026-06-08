import { ImageResponse } from "next/og";

export const alt = "Cultivr — From Blank Page to Big Impact";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ECE6E0",
          color: "#1F2433",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            fontSize: 150,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          <span>Cultivr</span>
          <span style={{ color: "#C97A5D" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 46,
            color: "rgba(31,36,51,0.82)",
          }}
        >
          From Blank Page to Big Impact.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 24,
            letterSpacing: "0.32em",
            color: "rgba(31,36,51,0.5)",
          }}
        >
          SPARK · SHARPEN · SHINE
        </div>
      </div>
    ),
    { ...size },
  );
}
