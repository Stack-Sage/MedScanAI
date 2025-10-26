'use client'
import React, { useState } from "react"

export default function Tooltip({ children, text, position = "top" }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative group" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className={`absolute whitespace-nowrap z-50 px-2 py-1 rounded bg-blue-700 text-white text-xs shadow-lg animate-fade-in
          ${position === "top" ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : ""}
          ${position === "bottom" ? "top-full left-1/2 -translate-x-1/2 mt-2" : ""}
          ${position === "left" ? "right-full top-1/2 -translate-y-1/2 mr-2" : ""}
          ${position === "right" ? "left-full top-1/2 -translate-y-1/2 ml-2" : ""}
        `}>
          {text}
        </span>
      )}
    </span>
  )
}
