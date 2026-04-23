import React from 'react'

export default function Container({ narrow = false, className = '', children, ...rest }) {
  return (
    <div className={`${narrow ? 'fx-container-narrow' : 'fx-container'} ${className}`} {...rest}>
      {children}
    </div>
  )
}
