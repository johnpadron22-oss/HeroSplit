import React, { useRef, useState } from "react";

export interface InfoCardProps {
  image: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
  imageHeight?: number;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  borderPadding?: number;
  cardBgColor?: string;
  patternColor1?: string;
  patternColor2?: string;
  textColor?: string;
  hoverTextColor?: string;
  effectBgColor?: string;
  contentPadding?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  description,
  width = 300,
  height = 360,
  imageHeight = 158,
  borderColor = "#22d3ee",
  borderBgColor = "#09090b",
  borderWidth = 2,
  borderPadding = 12,
  cardBgColor = "#09090b",
  patternColor1 = "rgba(230,230,230,0.035)",
  patternColor2 = "rgba(240,240,240,0.035)",
  textColor = "#f5f5f5",
  hoverTextColor = "#09090b",
  effectBgColor = "#22d3ee",
  contentPadding = "12px 14px",
}) => {
  const [hovered, setHovered] = useState(false);
  const borderRef = useRef<HTMLDivElement>(null);

  // Track mouse angle for rotating conic border
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const border = borderRef.current;
    if (!border) return;
    const rect = border.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    border.style.setProperty("--rotation", `${Math.atan2(y, x)}rad`);
  };

  // Inner dimensions derived from outer props
  const innerWidth = width - 2 * borderWidth - 2 * borderPadding;
  const innerHeight = height - 2 * borderWidth - 2 * borderPadding;

  const pattern =
    `linear-gradient(45deg, ${patternColor1} 25%, transparent 25%, transparent 75%, ${patternColor2} 75%),` +
    `linear-gradient(-45deg, ${patternColor2} 25%, transparent 25%, transparent 75%, ${patternColor1} 75%)`;

  const borderGradient = `conic-gradient(from var(--rotation,0deg), ${borderColor} 0deg, ${borderColor} 90deg, ${borderBgColor} 90deg, ${borderBgColor} 360deg)`;

  return (
    <div
      ref={borderRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        borderRef.current?.style.setProperty("--rotation", "0deg");
      }}
      style={{
        width,
        height,
        border: `${borderWidth}px solid transparent`,
        borderRadius: "1rem",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backgroundImage: `linear-gradient(${cardBgColor}, ${cardBgColor}), ${borderGradient}`,
        padding: borderPadding,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        userSelect: "none",
        position: "relative",
      } as React.CSSProperties}
    >
      <div
        style={{
          width: innerWidth,
          height: innerHeight,
          borderRadius: "0.75rem",
          background: cardBgColor,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundImage: pattern,
          backgroundSize: "20px 20px",
        }}
      >
        {/* Image — fixed height so it never collapses */}
        <div style={{ width: "100%", height: imageHeight, flexShrink: 0, overflow: "hidden" }}>
          <img
            src={image}
            alt={title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Text content */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: contentPadding,
            minHeight: 0,
          }}
        >
          {/* Title with color-fill hover effect */}
          <h3
            style={{
              fontSize: 15,
              fontWeight: "bold",
              letterSpacing: "-0.01em",
              lineHeight: "normal",
              marginBottom: 6,
              color: hovered ? hoverTextColor : textColor,
              transition: "color 0.3s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ position: "relative", zIndex: 10, padding: "2px 4px", display: "inline-block" }}>
              {title}
            </span>
            <span
              style={{
                clipPath: hovered
                  ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
                  : "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
                transition: "clip-path cubic-bezier(.1,.5,.5,1) 0.4s",
                position: "absolute",
                inset: -4,
                zIndex: 0,
                backgroundColor: effectBgColor,
              }}
            />
          </h3>

          <p
            style={{
              fontSize: 12,
              color: textColor,
              opacity: 0.6,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
