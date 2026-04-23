import React from 'react'

/** Fixfy marketing section wrapper.
 *  tone: 'navy' (default) | 'paper' | 'coral'
 *  size: 'default' | 'compact' | 'page-header'
 */
export default function Section({ tone = 'navy', size = 'default', className = '', children, ...rest }) {
  const base = size === 'compact'
    ? 'fx-section-compact'
    : size === 'page-header'
      ? 'fx-page-hdr'
      : 'fx-section'
  const toneClass = tone === 'paper' ? 'light' : tone === 'coral' ? 'coral' : ''
  return (
    <section className={`${base} ${toneClass} ${className}`.trim()} {...rest}>
      {children}
    </section>
  )
}
