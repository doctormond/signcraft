import { useState, useEffect, useCallback } from 'react'
import { loadLiveProject, decodeFromDisplay } from '../utils.js'

export default function DisplayExternal({ projectId, fallback }) {
  const [proj, setProj] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight })

  // Load project - prefer localStorage (has images, live updates)
  const loadProject = useCallback(() => {
    if (projectId) {
      const live = loadLiveProject(projectId)
      if (live) {
        setProj(live)
        setLastUpdated(new Date().toLocaleTimeString('ko-KR'))
        return
      }
    }
    // Fallback: use URL-encoded snapshot when no local live-store exists
    if (fallback) {
      setProj(fallback)
      setLastUpdated('QR 스냅샷')
    }
  }, [projectId, fallback])

  // Initial load
  useEffect(() => { loadProject() }, [loadProject])

  // Poll every 2 seconds for live updates and react immediately to localStorage changes
  useEffect(() => {
    const timer = setInterval(loadProject, 2000)
    const onStorage = (e) => {
      if (!projectId || e.key === `sc-live-${projectId}`) loadProject()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      clearInterval(timer)
      window.removeEventListener('storage', onStorage)
    }
  }, [loadProject, projectId])

  // Resize listener
  useEffect(() => {
    const fn = () => setDims({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  if (!proj) return (
    <div style={{ width: '100vw', height: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>📺</div>
      <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>콘텐츠를 불러오는 중...</div>
      <div style={{ color: '#666', fontSize: 13 }}>CMS에서 저장 후 새로고침하세요</div>
    </div>
  )

  const internalW = proj.w || (proj.widthCm || 120) * 20
  const internalH = proj.h || (proj.heightCm || 68) * 20
  const ratio = internalW / internalH
  let dW, dH
  if (dims.w / dims.h > ratio) { dH = dims.h; dW = dims.h * ratio }
  else { dW = dims.w; dH = dims.w / ratio }
  const sc = dW / internalW

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Top status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(0,0,0,0.7)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>LIVE</span>
          {lastUpdated && <span style={{ fontSize: 10, color: '#555' }}>· {lastUpdated} 업데이트</span>}
        </div>
        <button
          onClick={loadProject}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
          🔄 새로고침
        </button>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: dW, height: dH, background: proj.bg || '#1a1a2e', overflow: 'hidden' }}>
        {proj.els && proj.els.map(el => {
          if (el.type === 'text') return (
            <div key={el.id} style={{ position: 'absolute', left: el.x * sc, top: el.y * sc, fontSize: el.fontSize * sc, fontWeight: el.fontWeight || 'bold', color: el.color || '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.2, fontFamily: '-apple-system, sans-serif' }}>
              {el.text}
            </div>
          )
          if (el.type === 'emoji') return (
            <div key={el.id} style={{ position: 'absolute', left: el.x * sc, top: el.y * sc, fontSize: el.size * sc, lineHeight: 1 }}>
              {el.emoji}
            </div>
          )
          if (el.type === 'image' && el.src && el.src !== '__too_large__') return (
            <div key={el.id} style={{ position: 'absolute', left: el.x * sc, top: el.y * sc, width: el.w * sc, height: el.h * sc, overflow: 'hidden' }}>
              <img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
            </div>
          )
          return null
        })}
        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: Math.max(10, 13 * sc), color: 'rgba(255,255,255,0.1)' }}>
          SignCraft
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  )
}
