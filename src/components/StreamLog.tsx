import React from 'react'
import type { StreamLine } from '../types'

interface StreamLogProps {
  lines: StreamLine[]
  scrollRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Reusable terminal-style streaming log.
 * Renders each line with a colour matching its type.
 */
export function StreamLog({ lines, scrollRef }: StreamLogProps) {
  return (
    <div className="stream-log" ref={scrollRef}>
      {lines.map((line, i) => (
        <span key={i} className={`stream-line ${line.type}`}>
          {line.text || '\u00A0'}
          {'\n'}
        </span>
      ))}
      <span className="stream-cursor" />
    </div>
  )
}
