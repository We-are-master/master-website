import React from 'react'
import { Link } from 'react-router-dom'

/** Fixfy button / link.
 *  variant: 'primary' (coral, default) | 'ghost'
 *  If `to` is provided, renders a React Router Link. If `href`, renders <a>.
 *  Otherwise <button>.
 */
export default function Button({
  variant = 'primary',
  to,
  href,
  arrow = false,
  className = '',
  children,
  ...rest
}) {
  const cls = `fx-btn fx-btn-${variant} ${className}`.trim()
  const content = (
    <>
      {children}
      {arrow && <span className="fx-arr">→</span>}
    </>
  )
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>
  if (href) return <a href={href} className={cls} {...rest}>{content}</a>
  return <button className={cls} {...rest}>{content}</button>
}
