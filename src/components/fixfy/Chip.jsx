import React from 'react'

export default function Chip({ dot = false, className = '', children, ...rest }) {
  return (
    <span className={`fx-chip ${className}`} {...rest}>
      {dot && <span className="fx-dot" />}
      {children}
    </span>
  )
}
