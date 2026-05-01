const WORDMARK_ON_DARK = '/brand/fixfy-primary-white.png'
const WORDMARK_ON_LIGHT = '/brand/fixfy-primary-navy.png'
const ICON_ON_DARK = '/brand/fixfy-icon-white.png'
const ICON_ON_LIGHT = '/brand/fixfy-icon-navy.png'

/**
 * Brand logo with consistent responsive sizing (see fixfy-logo.css).
 * @param {'onDark'|'onLight'} variant — background behind the logo
 * @param {boolean} mark — use icon instead of wordmark (compact toolbars)
 */
export default function FixfyLogo({
  variant = 'onDark',
  mark = false,
  className = '',
  alt = 'Fixfy',
  ...rest
}) {
  const light = variant === 'onLight'
  const src = mark
    ? light
      ? ICON_ON_LIGHT
      : ICON_ON_DARK
    : light
      ? WORDMARK_ON_LIGHT
      : WORDMARK_ON_DARK

  const cls = ['fixfy-logo', mark ? 'fixfy-logo--mark' : '', className].filter(Boolean).join(' ')

  return <img src={src} alt={alt} className={cls} decoding="async" {...rest} />
}
