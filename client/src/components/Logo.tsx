import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, variant = "light", size = "md" }: LogoProps) {
  const color = variant === "light" ? "#E6E6E6" : "#3D2852";
  const accent = variant === "light" ? "#5A3F73" : "#5A3F73";
  
  const sizes = {
    sm: "h-8",
    md: "h-14",
    lg: "h-20"
  };

  return (
    <div className={cn("flex flex-col", className || "items-center", sizes[size])}>
      <svg
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto overflow-visible"
      >
        {/* Gift Box Icon */}
        <g transform="translate(10, 0)">
          <rect x="35" y="30" width="50" height="40" stroke={color} strokeWidth="4" rx="4" />
          <path d="M35 45H85" stroke={color} strokeWidth="4" />
          <path d="M60 30V70" stroke={color} strokeWidth="4" />
          <path d="M45 30C45 20 55 15 60 25C65 15 75 20 75 30" stroke={color} strokeWidth="4" />
        </g>

        {/* Heart Icon */}
        <g transform="translate(140, 0)">
          <path
            d="M60 70C60 70 30 50 30 35C30 25 40 20 50 25C55 30 65 30 70 25C80 20 90 25 90 35C90 50 60 70 60 70Z"
            stroke={color}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        </g>

        {/* Tulip Icon */}
        <g transform="translate(280, 0)">
          <path
            d="M60 25C30 35 45 65 60 65C75 65 90 35 60 25Z"
            stroke={color}
            strokeWidth="4"
          />
          <path d="M60 25V65" stroke={color} strokeWidth="4" />
          <path d="M60 65V75" stroke={color} strokeWidth="4" />
          <path d="M60 75L45 65" stroke={color} strokeWidth="4" />
          <path d="M60 75L75 65" stroke={color} strokeWidth="4" />
        </g>

        {/* Connecting Line */}
        <path d="M10 75H100 M180 75H250 M320 75H390" stroke={color} strokeWidth="3" strokeLinecap="round" />

        {/* Main Text DIFIORI */}
        <text
          x="200"
          y="105"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 800,
            fontSize: "42px",
            letterSpacing: "0.1em"
          }}
        >
          DIFIORI
        </text>

        {/* Tagline FLORES • REGALOS • EVENTOS */}
        <text
          x="200"
          y="125"
          textAnchor="middle"
          fill={variant === "light" ? "#666666" : "#0D0717"}
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            letterSpacing: "0.2em",
            opacity: 1
          }}
        >
          FLORES • REGALOS • EVENTOS
        </text>
      </svg>
    </div>
  );
}
