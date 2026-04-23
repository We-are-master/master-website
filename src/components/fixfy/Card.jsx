import React from 'react'

export default function Card({ icon, title, body, className = '', children, ...rest }) {
  return (
    <div className={`fx-card ${className}`} {...rest}>
      {icon && <div className="fx-card-icon">{icon}</div>}
      {title && <h3 className="fx-h3 fx-mt-16">{title}</h3>}
      {body && <p className="fx-body fx-mt-8">{body}</p>}
      {children}
    </div>
  )
}
