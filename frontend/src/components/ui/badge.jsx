import React from "react"

export function Badge({ children, variant = "default", className = "", ...props }) {
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-green-100 text-green-800",
    outline: "border border-gray-300 text-gray-700 bg-white",
  };
  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}

export default Badge;
