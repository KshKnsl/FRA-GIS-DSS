import React from "react"

export function Avatar({ className = "", children, ...props }) {
  return (
    <span
      className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-600 font-bold text-lg ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function AvatarFallback({ children, className = "", ...props }) {
  return (
    <span
      className={`flex items-center justify-center h-full w-full text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export default Avatar;
