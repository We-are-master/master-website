import React, { useEffect, useRef, useState } from 'react'
import './hero-portal-motion.css'

/**
 * Scripted hero animation: a faux portal showing "log a request in 15s"
 * — cursor moves, clicks, advances steps, fires a toast, loops.
 *
 * Rebuilt from hero-motion.js (Fixfy design system reference) as a
 * self-contained React component. Steps render as three CSS mockups
 * (not screenshots) so no external image assets are needed yet.
 */

const SCRIPT = [
  { at: 200,   cursor: [0.62, 0.40], step: 1, timer: 0.2 },
  { at: 1600,  cursor: [0.42, 0.82], step: 1, timer: 1.6 },
  { at: 2400,  cursor: [0.42, 0.82], step: 1, timer: 2.4, click: true },
  { at: 3000,  cursor: [0.60, 0.40], step: 2, timer: 3.0 },
  { at: 5200,  cursor: [0.55, 0.80], step: 2, timer: 5.2 },
  { at: 7200,  cursor: [0.80, 0.90], step: 2, timer: 7.2, click: true },
  { at: 8000,  cursor: [0.60, 0.55], step: 3, timer: 8.0 },
  { at: 11000, cursor: [0.80, 0.90], step: 3, timer: 11.0 },
  { at: 12000, cursor: [0.80, 0.90], step: 3, timer: 12.0, click: true },
  { at: 12400, cursor: [0.80, 0.90], step: 3, timer: 12.4, toast: true },
  { at: 14200, cursor: [0.80, 0.90], step: 3, timer: 14.2, toast: true },
  { at: 16800, cursor: [0.62, 0.40], step: 1, timer: 0.0, toast: false, reset: true },
]

export default function HeroPortalMotion() {
  const stageRef = useRef(null)
  const cursorRef = useRef(null)
  const rafRef = useRef(0)
  const startRef = useRef(0)
  const lastFrameRef = useRef(null)
  const [step, setStep] = useState(1)
  const [click, setClick] = useState(false)
  const [toast, setToast] = useState(false)
  const [timer, setTimer] = useState('0.0')

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const applyCursor = (xRatio, yRatio) => {
      const stage = stageRef.current
      const cursor = cursorRef.current
      if (!stage || !cursor) return
      const r = stage.getBoundingClientRect()
      cursor.style.transform = `translate(${xRatio * r.width}px, ${yRatio * r.height}px)`
    }

    startRef.current = performance.now()
    lastFrameRef.current = null

    const loop = (now) => {
      const t = now - startRef.current
      const cur = [...SCRIPT].reverse().find((k) => k.at <= t) || SCRIPT[0]
      const next = SCRIPT.find((k) => k.at > t)
      const lerpT = next ? (t - cur.at) / (next.at - cur.at) : 1
      const tv = cur.timer + (next ? (next.timer - cur.timer) * lerpT : 0)
      setTimer(tv.toFixed(1))

      if (cur !== lastFrameRef.current) {
        lastFrameRef.current = cur
        setStep(cur.step)
        applyCursor(cur.cursor[0], cur.cursor[1])
        if (cur.click) {
          setClick(true)
          setTimeout(() => setClick(false), 220)
        }
        if (cur.toast === true) setToast(true)
        else if (cur.toast === false) setToast(false)
        if (cur.reset) {
          setToast(false)
          startRef.current = performance.now()
          lastFrameRef.current = null
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="fxhpm-root">
      <div className="fxhpm-chrome">
        <div className="fxhpm-dots">
          <span className="fxhpm-dot" style={{ background: '#ff5f57' }} />
          <span className="fxhpm-dot" style={{ background: '#febc2e' }} />
          <span className="fxhpm-dot" style={{ background: '#28c840' }} />
        </div>
        <div className="fxhpm-url">
          <span className="fxhpm-url-dot" />
          <span className="fxhpm-lock">🔒</span>
          app.getfixfy.com
        </div>
        <div className="fxhpm-timer">
          <span className="fxhpm-timer-dot" />
          <span>{timer}s</span>
        </div>
      </div>

      <div className="fxhpm-stage" ref={stageRef}>
        {/* step 1 — pick service */}
        <div className={`fxhpm-scene ${step === 1 ? 'is-active' : ''}`}>
          <div className="fxhpm-scene-head">
            <div className="fxhpm-scene-kicker">Step 1 · Pick a trade</div>
            <div className="fxhpm-scene-title">What needs fixing?</div>
          </div>
          <div className="fxhpm-tile-grid">
            {['Plumbing', 'Electrical', 'Gas Safe', 'HVAC', 'Carpentry', 'Locksmith', 'Fire safety', 'Pest'].map((t) => (
              <div key={t} className={`fxhpm-tile ${t === 'Plumbing' ? 'is-hover' : ''}`}>
                <div className="fxhpm-tile-mark" />
                <div>{t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* step 2 — describe + site */}
        <div className={`fxhpm-scene ${step === 2 ? 'is-active' : ''}`}>
          <div className="fxhpm-scene-head">
            <div className="fxhpm-scene-kicker">Step 2 · Describe the issue</div>
            <div className="fxhpm-scene-title">Leak under sink · Camden HQ</div>
          </div>
          <div className="fxhpm-form">
            <div className="fxhpm-row">
              <span className="fxhpm-lbl">Site</span>
              <span className="fxhpm-val">Camden HQ · 14 Dalmeny Road</span>
            </div>
            <div className="fxhpm-row">
              <span className="fxhpm-lbl">Priority</span>
              <span className="fxhpm-pill fxhpm-pill-coral">P1 · Reactive</span>
            </div>
            <div className="fxhpm-textarea">
              <p>Water pooling in kitchen cabinet base — spreading. Isolated the valve, need plumber on site this afternoon.</p>
            </div>
            <div className="fxhpm-row">
              <span className="fxhpm-lbl">Photos</span>
              <span className="fxhpm-thumbs"><i /><i /><i /></span>
            </div>
          </div>
        </div>

        {/* step 3 — review + submit */}
        <div className={`fxhpm-scene ${step === 3 ? 'is-active' : ''}`}>
          <div className="fxhpm-scene-head">
            <div className="fxhpm-scene-kicker">Step 3 · Review</div>
            <div className="fxhpm-scene-title">Ready to post</div>
          </div>
          <div className="fxhpm-review">
            <div className="fxhpm-review-row"><b>Trade</b><span>Plumbing · P1</span></div>
            <div className="fxhpm-review-row"><b>Site</b><span>Camden HQ</span></div>
            <div className="fxhpm-review-row"><b>SLA</b><span>Arrive within 4h · £95 call-out</span></div>
            <div className="fxhpm-review-row"><b>Nearest trade</b><span>B. Whitaker · 1.2 mi · ★ 4.9 · Gas Safe</span></div>
            <div className="fxhpm-review-cta">Submit job →</div>
          </div>
        </div>

        {/* cursor */}
        <div ref={cursorRef} className={`fxhpm-cursor ${click ? 'is-click' : ''}`}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L1 17L5 13L7.5 19L10 18L7.5 12L13 12L1 1Z" fill="white" stroke="#020040" strokeWidth="1.2" />
          </svg>
        </div>

        {/* toast */}
        <div className={`fxhpm-toast ${toast ? 'is-visible' : ''}`}>
          <span className="fxhpm-toast-check">✓</span>
          <div>
            <b>Job posted</b>
            <span>JOB-2841 · B. Whitaker acknowledged</span>
          </div>
        </div>
      </div>

      <div className="fxhpm-cap">
        <div className="fxhpm-cap-label">Log a request — 15 seconds</div>
        <div className="fxhpm-cap-steps">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`fxhpm-cap-step ${step === n ? 'is-active' : ''}`}>
              <em>0{n}</em>
              <span>{n === 1 ? 'Pick trade' : n === 2 ? 'Describe' : 'Submit'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
