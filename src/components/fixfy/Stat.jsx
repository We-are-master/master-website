import React from 'react'

export default function Stat({ kicker, number, unit, label }) {
  return (
    <div className="fx-stat">
      {kicker && <div className="fx-stat-kl">{kicker}</div>}
      <div className="fx-stat-num">
        {number}
        {unit && <span className="fx-unit">{unit}</span>}
      </div>
      {label && <div className="fx-stat-lbl">{label}</div>}
    </div>
  )
}
