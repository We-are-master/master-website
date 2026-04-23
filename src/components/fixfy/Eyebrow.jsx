import React from 'react'

export default function Eyebrow({ className = '', style, children, ...rest }) {
  return (
    <div className={`fx-eyebrow ${className}`} style={style} {...rest}>
      {children}
    </div>
  )
}
