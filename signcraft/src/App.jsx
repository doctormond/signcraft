import { useState, useEffect } from 'react'
import CmsApp from './components/CmsApp.jsx'
import PromoApp from './components/PromoApp.jsx'
import DisplayExternal from './components/DisplayExternal.jsx'
import { decodeFromDisplay } from './utils.js'
import './index.css'

export default function App() {
  const [tab, setTab] = useState('cms')
  const [displayState, setDisplayState] = useState(null) // { projectId, fallback }

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    // Format: #live=ID&snap=BASE64
    if (hash.startsWith('#live=')) {
      const params = new URLSearchParams(hash.slice(1))
      const projectId = params.get('live')
      const snap = params.get('snap')
      const fallback = snap ? decodeFromDisplay(snap) : null
      setDisplayState({ projectId, fallback })
      return
    }

    // Legacy format: #display=BASE64
    if (hash.startsWith('#display=')) {
      const proj = decodeFromDisplay(hash.slice(9))
      if (proj) setDisplayState({ projectId: proj.id, fallback: proj })
    }
  }, [])

  if (displayState) {
    return <DisplayExternal projectId={displayState.projectId} fallback={displayState.fallback} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3ef', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0ddd6', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 54, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, background: '#f5a623', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📺</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>SignCraft</span>
          <span style={{ fontSize: 11, color: '#f5a623', background: '#fff8ee', padding: '2px 8px', borderRadius: 10, border: '1px solid #f5a62333', fontWeight: 600 }}>Beta</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {[{ id: 'cms', icon: '🖊', label: 'CMS 에디터' }, { id: 'promo', icon: '📱', label: 'QR 프로모션' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? '#fff8ee' : 'none', border: tab === t.id ? '1.5px solid #f5a62344' : '1.5px solid transparent', color: tab === t.id ? '#e09000' : '#888', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#ccc' }}>MVP v0.1</div>
      </nav>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'cms' ? <CmsApp /> : <PromoApp />}
      </div>
    </div>
  )
}
