import React from "react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/hooks/useCompany";
import { toPublicImageUrl } from "@/lib/media";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  useCompanyData?: boolean;
}

export function Logo({
  className,
  variant = "light",
  size = "md",
  useCompanyData = false,
}: LogoProps) {
  const { data: company } = useCompany(useCompanyData);
  const color = variant === "light" ? "#E6E6E6" : "#3D2852";
  const sizes = {
    sm: "h-9",
    md: "h-16",
    lg: "h-20",
  };

  const logoUrl = getCompanyLogoUrl(company?.logo);

  if (logoUrl) {
    return (
      <div className={cn("flex flex-col", className || "items-center", sizes[size])}>
        <img
          src={logoUrl}
          alt={company?.name || "Logo del negocio"}
          className="h-full w-auto max-w-full object-contain"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className || "items-center", sizes[size])}>
      <svg
        viewBox="0 0 400 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto max-w-full overflow-visible"
      >
        <text
          x="200"
          y="43"
          textAnchor="middle"
          fill={color}
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 800,
            fontSize: "52px",
            letterSpacing: "0.12em",
          }}
        >
          DIFIORI
        </text>

        <text
          x="200"
          y="68"
          textAnchor="middle"
          fill={variant === "light" ? "#666666" : "#0D0717"}
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            letterSpacing: "0.22em",
            opacity: 1,
          }}
        >
          FLORES • REGALOS • EVENTOS
        </text>
      </svg>
    </div>
  );
}

function getCompanyLogoUrl(logoPath?: string | null) {
  const url = toPublicImageUrl(logoPath);
  return url || null;
}
