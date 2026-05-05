import { useState, useRef, useEffect } from 'react'
import { EMOJIS, BG_COLORS, uid } from '../constants.js'
import { encodeForDisplay, cmToW, cmToH, saveLiveProject } from '../utils.js'
import QRCode from './QRCode.jsx'

const STORAGE_KEY = 'sc-cms-v2'
const SITE_URL = 'https://doctormond.github.io/signcraft'

const CM_PRESETS = [
  { name: '표준 TV (120×68cm)', w: 120, h: 68 },
  { name: '세로형 (68×120cm)', w: 68, h: 120 },
  { name: '정사각형 (80×80cm)', w: 80, h: 80 },
  { name: '가로 배너 (150×50cm)', w: 150, h: 50 },
  { name: '소형 안내판 (40×30cm)', w: 40, h: 30 },
]

function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function save(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }

function makeProject(n, count) {
  const widthCm = 120, heightCm = 68
  return {
    id: uid(), name: `새 콘텐츠 ${count}`,
    widthCm, heightCm,
    w: cmToW(widthCm), h: cmToH(heightCm),
    bg: '#1a1a2e', els: [], created: Date.now(),
  }
}

export default function CmsApp() {
  const [projects, setProjects] = useState(() => load())
  const [cur, setCur] = useState(null)
  const [modal, setModal] = useState(null)

  function persist(ps) { setProjects(ps); save(ps) }
  function newProject() { const p = makeProject('', projects.length + 1); persist([...projects, p]); setCur(p) }
  function updateProject(p) { persist(projects.map(x => x.id === p.id ? p : x)); setCur(p) }
  function deleteProject(id) { persist(projects.filter(p => p.id !== id)) }

  if (modal === 'display' && cur)   return <DisplaySim     proj={cur} onClose={() => setModal(null)} />
  if (modal === 'displayQR' && cur) return <DisplayQRView  proj={cur} onClose={() => setModal(null)} onSimulate={() => setModal('display')} />
  if (modal === 'promoQR' && cur)   return <PromoQRView    proj={cur} onClose={() => setModal(null)} />
  if (cur) return <Editor proj={cur} onUpdate={updateProject} onBack={() => setCur(null)} onDisplayQR={() => setModal('displayQR')} onPromoQR={() => setModal('promoQR')} />
  return <Home projects={projects} onNew={newProject} onOpen={setCur} onDelete={deleteProject} />
}

// ── Home ───────────────────────────────────────────────────────────────────
function Home({ projects, onNew, onOpen, onDelete }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 54px)', background: '#f4f3ef', padding: '0 0 48px' }}>
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 4 }}>콘텐츠 관리</h1>
            <p style={{ fontSize: 14, color: '#888' }}>디지털 사이니지에 표시할 콘텐츠를 만들고 관리하세요</p>
          </div>
          <button onClick={onNew} style={{ marginLeft: 'auto', background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,166,35,0.3)' }}>+ 새 콘텐츠</button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e5de', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {[
            { icon: '🖊', t: '콘텐츠 제작', d: '텍스트·이미지·이모지 배치' },
            { icon: '📺', t: '기기 연결 QR', d: '다른 기기에서 스캔 → 콘텐츠 표시' },
            { icon: '📱', t: '프로모션 QR', d: '행인 스캔 → 쿠폰·이벤트 페이지' },
          ].map((i, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 180 }}>
              <div style={{ width: 36, height: 36, background: '#fff8ee', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{i.icon}</div>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{i.t}</div><div style={{ fontSize: 12, color: '#aaa' }}>{i.d}</div></div>
            </div>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📺</div>
          <div style={{ fontSize: 16, color: '#888', marginBottom: 6 }}>아직 콘텐츠가 없어요</div>
          <div style={{ fontSize: 13, color: '#bbb', marginBottom: 20 }}>새 콘텐츠를 만들어 디지털 사이니지를 시작하세요</div>
          <button onClick={onNew} style={{ background: '#f5a623', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>첫 콘텐츠 만들기 →</button>
        </div>
      ) : (
        <div style={{ padding: '0 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
          {projects.map(p => <ProjectCard key={p.id} proj={p} onOpen={onOpen} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ proj, onOpen, onDelete }) {
  const ratio = proj.w / proj.h
  const ph = Math.min(210 / ratio, 120)
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e5de', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }} onClick={() => onOpen(proj)}>
      <div style={{ width: '100%', height: ph, background: proj.bg, position: 'relative', overflow: 'hidden' }}>
        {proj.els.length === 0
          ? <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>빈 캔버스</div>
          : proj.els.slice(0, 6).map(el => (
            <div key={el.id} style={{ position: 'absolute', left: `${Math.max(0, Math.min(75, (el.x / proj.w) * 100))}%`, top: `${Math.max(0, Math.min(75, (el.y / proj.h) * 100))}%`, fontSize: el.type === 'emoji' ? 13 : 9, color: el.color || '#fff', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '55%' }}>
              {el.type === 'text' ? el.text : el.type === 'emoji' ? el.emoji : '🖼'}
            </div>
          ))
        }
      </div>
      <div style={{ padding: '11px 14px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{proj.name}</div>
        <div style={{ fontSize: 12, color: '#aaa' }}>{proj.widthCm || Math.round(proj.w/20)}×{proj.heightCm || Math.round(proj.h/20)}cm · {proj.els.length}개 요소</div>
      </div>
      <div style={{ padding: '0 12px 12px', display: 'flex', gap: 7 }}>
        <button style={{ flex: 1, background: '#f7f6f2', color: '#555', border: '1px solid #e8e5de', borderRadius: 7, padding: '7px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }} onClick={e => { e.stopPropagation(); onOpen(proj) }}>편집</button>
        <button style={{ background: '#fff5f5', color: '#e05555', border: '1px solid #fde0e0', borderRadius: 7, padding: '7px 11px', fontSize: 13, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); if (window.confirm('삭제할까요?')) onDelete(proj.id) }}>🗑</button>
      </div>
    </div>
  )
}

// ── Editor ─────────────────────────────────────────────────────────────────
function Editor({ proj, onUpdate, onBack, onDisplayQR, onPromoQR }) {
  const [p, setP] = useState({ widthCm: 120, heightCm: 68, ...proj })
  const [rightTab, setRightTab] = useState('layers')
  const [sel, setSel] = useState(null)
  const dragRef = useRef(null)
  const fileRef = useRef(null)
  const canvasRef = useRef(null)

  // Canvas display sizing - use available container width
  const [canvasArea, setCanvasArea] = useState({ w: 560, h: 360 })
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setCanvasArea({ w: width, h: height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const ratio = p.w / p.h
  const maxW = canvasArea.w - 32
  const maxH = canvasArea.h - 40
  const scale = Math.min(maxW / p.w, maxH / p.h, 0.6)
  const cW = Math.round(p.w * scale)
  const cH = Math.round(p.h * scale)

  function save(u) { setP(u); onUpdate(u); saveLiveProject(u) }

  function addText() {
    const el = { id: uid(), type: 'text', text: '텍스트 입력', x: p.w * 0.05, y: p.h * 0.3, fontSize: 120, color: '#ffffff', fontWeight: 'bold' }
    save({ ...p, els: [...p.els, el] }); setSel(el.id)
  }
  function addEmoji(em) {
    const el = { id: uid(), type: 'emoji', emoji: em, x: p.w * 0.35, y: p.h * 0.25, size: 200 }
    save({ ...p, els: [...p.els, el] }); setSel(el.id); setRightTab('layers')
  }
  function addImage(e) {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const maxSide = 1600
        const resizeRatio = Math.min(maxSide / img.width, maxSide / img.height, 1)
        const src = resizeRatio < 1 ? resizeImageDataUrl(img, resizeRatio) : ev.target.result
        const naturalW = Math.round(img.width * resizeRatio)
        const naturalH = Math.round(img.height * resizeRatio)
        const s = Math.min((p.w * 0.5) / naturalW, (p.h * 0.5) / naturalH, 1)
        save({ ...p, els: [...p.els, { id: uid(), type: 'image', src, x: p.w * 0.15, y: p.h * 0.15, w: naturalW * s, h: naturalH * s }] })
      }
      img.src = ev.target.result
    }
    r.readAsDataURL(f); e.target.value = ''
  }
  function updateEl(id, upd) {
    const u = { ...p, els: p.els.map(e => e.id === id ? { ...e, ...upd } : e) }
    save(u)
  }
  function deleteEl(id) { save({ ...p, els: p.els.filter(e => e.id !== id) }); setSel(null) }
  function bringUp(id) { const i = p.els.findIndex(e => e.id === id); if (i < p.els.length - 1) { const es = [...p.els];[es[i], es[i + 1]] = [es[i + 1], es[i]]; save({ ...p, els: es }) } }
  function sendBack(id) { const i = p.els.findIndex(e => e.id === id); if (i > 0) { const es = [...p.els];[es[i], es[i - 1]] = [es[i - 1], es[i]]; save({ ...p, els: es }) } }

  function startDrag(e, elId) {
    e.preventDefault(); e.stopPropagation(); setSel(elId)
    const el = p.els.find(x => x.id === elId)
    dragRef.current = { elId, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y }
    const mm = ev => {
      if (!dragRef.current) return
      const { elId, sx, sy, ox, oy } = dragRef.current
      setP(prev => ({ ...prev, els: prev.els.map(x => x.id === elId ? { ...x, x: ox + (ev.clientX - sx) / scale, y: oy + (ev.clientY - sy) / scale } : x) }))
    }
    const mu = ev => {
      if (dragRef.current) {
        const { elId, sx, sy, ox, oy } = dragRef.current
        save({ ...p, els: p.els.map(x => x.id === elId ? { ...x, x: ox + (ev.clientX - sx) / scale, y: oy + (ev.clientY - sy) / scale } : x) })
        dragRef.current = null
      }
      document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu)
    }
    document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu)
  }

  const selEl = p.els.find(e => e.id === sel)

  return (
    <div style={{ height: 'calc(100vh - 54px)', background: '#f4f3ef', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0ddd6', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20, padding: '0 4px' }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
        <span style={{ fontSize: 12, color: '#aaa', background: '#f7f6f2', padding: '2px 8px', borderRadius: 8, border: '1px solid #e8e5de' }}>{p.widthCm}×{p.heightCm}cm</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={onDisplayQR} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, padding: '7px 13px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>📺 기기 연결 QR</button>
          <button onClick={onPromoQR}   style={{ background: '#fff8ee', color: '#e09000', border: '1px solid #f5a62344', borderRadius: 8, padding: '7px 13px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>📱 프로모션 QR</button>
          <button onClick={() => save(p)} style={{ background: '#f5a623', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(245,166,35,0.25)' }}>저장 ✓</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left tools */}
        <div style={{ width: 54, background: '#fff', borderRight: '1px solid #e0ddd6', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 2, flexShrink: 0 }}>
          {[
            { icon: 'T', label: '텍스트 추가', fn: addText },
            { icon: '🖼', label: '이미지 업로드', fn: () => fileRef.current?.click() },
            { icon: '☺', label: '이모지 추가', fn: () => setRightTab(t => t === 'emoji' ? 'layers' : 'emoji'), active: rightTab === 'emoji' },
            { icon: '⚙', label: '간판 설정', fn: () => setRightTab(t => t === 'settings' ? 'layers' : 'settings'), active: rightTab === 'settings' },
          ].map(t => (
            <button key={t.label} onClick={t.fn} title={t.label} style={{ width: 40, height: 40, background: t.active ? '#fff8ee' : 'none', border: t.active ? '1.5px solid #f5a62344' : '1.5px solid transparent', borderRadius: 9, color: t.active ? '#e09000' : '#aaa', cursor: 'pointer', fontSize: t.icon.length > 1 ? 18 : 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>{t.icon}</button>
          ))}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={addImage} />
        </div>

        {/* Canvas area */}
        <div ref={canvasRef} style={{ flex: 1, background: '#e8e7e2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Grid dots */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.4 }} />

          {/* Canvas */}
          <div style={{ position: 'relative', zIndex: 1, width: cW, height: cH, background: p.bg, boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)', overflow: 'hidden', cursor: 'crosshair' }}
            onClick={e => { e.stopPropagation(); setSel(null) }}>
            {p.els.map(el => <CanvasEl key={el.id} el={el} scale={scale} selected={sel === el.id} onMouseDown={startDrag} />)}
          </div>

          {/* Size label */}
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#aaa', background: '#fff', padding: '3px 10px', borderRadius: 20, border: '1px solid #e8e5de', zIndex: 1 }}>
            {p.widthCm}cm × {p.heightCm}cm &nbsp;·&nbsp; {Math.round(scale * 100)}% 보기
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 224, background: '#fff', borderLeft: '1px solid #e0ddd6', overflow: 'auto', flexShrink: 0 }}>
          {rightTab === 'emoji'    ? <EmojiPanel    onAdd={addEmoji} onClose={() => setRightTab('layers')} />
          : rightTab === 'settings' ? <SettingsPanel  proj={p} onUpdate={u => save({ ...p, ...u })} onClose={() => setRightTab('layers')} />
          : selEl                   ? <PropPanel      el={selEl} onUpdate={u => updateEl(sel, u)} onDelete={() => deleteEl(sel)} onUp={() => bringUp(sel)} onDown={() => sendBack(sel)} />
          :                           <LayersPanel    els={p.els} sel={sel} onSel={setSel} />}
        </div>
      </div>
    </div>
  )
}


function resizeImageDataUrl(img, ratio) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.width * ratio))
  canvas.height = Math.max(1, Math.round(img.height * ratio))
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.86)
}

function CanvasEl({ el, scale, selected, onMouseDown }) {
  const border = selected ? '2px solid #f5a623' : '2px solid transparent'
  const base = { position: 'absolute', left: el.x * scale, top: el.y * scale, border, borderRadius: 3, cursor: 'move', userSelect: 'none' }
  if (el.type === 'text')  return <div style={{ ...base, padding: '2px 5px', fontSize: el.fontSize * scale, fontWeight: el.fontWeight || 'bold', color: el.color || '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.2 }} onMouseDown={e => onMouseDown(e, el.id)}>{el.text}</div>
  if (el.type === 'emoji') return <div style={{ ...base, padding: 3, fontSize: el.size * scale, lineHeight: 1 }} onMouseDown={e => onMouseDown(e, el.id)}>{el.emoji}</div>
  if (el.type === 'image') return <div style={{ ...base, width: el.w * scale, height: el.h * scale, overflow: 'hidden' }} onMouseDown={e => onMouseDown(e, el.id)}><img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} draggable={false} /></div>
  return null
}

// ── Panels ─────────────────────────────────────────────────────────────────
const PLabel = ({ children }) => <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>{children}</div>
const PSection = ({ children }) => <div style={{ marginBottom: 16 }}>{children}</div>

function LayersPanel({ els, sel, onSel }) {
  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>레이어</div>
      {els.length === 0
        ? <div style={{ fontSize: 13, color: '#bbb', textAlign: 'center', paddingTop: 28, lineHeight: 1.6 }}>좌측 도구로<br/>요소를 추가하세요</div>
        : [...els].reverse().map(el => (
          <div key={el.id} onClick={() => onSel(el.id)} style={{ padding: '8px 10px', borderRadius: 8, marginBottom: 4, background: sel === el.id ? '#fff8ee' : '#f7f6f2', border: sel === el.id ? '1.5px solid #f5a62333' : '1.5px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ fontSize: 15 }}>{el.type === 'text' ? 'T' : el.type === 'emoji' ? el.emoji : '🖼'}</span>
            <span style={{ fontSize: 12, color: sel === el.id ? '#e09000' : '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{el.type === 'text' ? el.text : el.type === 'emoji' ? '이모지' : '이미지'}</span>
          </div>
        ))
      }
    </div>
  )
}

function EmojiPanel({ onAdd, onClose }) {
  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>이모지 추가</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
        {EMOJIS.map(em => (
          <button key={em} onClick={() => onAdd(em)} style={{ background: '#f7f6f2', border: '1px solid #e8e5de', borderRadius: 8, padding: '8px', fontSize: 22, cursor: 'pointer', lineHeight: 1, transition: 'background 0.1s' }}>{em}</button>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel({ proj, onUpdate, onClose }) {
  const [wInput, setWInput] = useState(String(proj.widthCm || 120))
  const [hInput, setHInput] = useState(String(proj.heightCm || 68))

  useEffect(() => {
    setWInput(String(proj.widthCm || 120))
    setHInput(String(proj.heightCm || 68))
  }, [proj.widthCm, proj.heightCm])

  function parseCm(value, fallback) {
    const n = Number(value)
    if (!Number.isFinite(n)) return fallback
    return Math.max(10, Math.min(1000, Math.round(n)))
  }

  function updateCm(widthCm, heightCm) {
    const wCm = parseCm(widthCm, proj.widthCm || 120)
    const hCm = parseCm(heightCm, proj.heightCm || 68)
    setWInput(String(wCm))
    setHInput(String(hCm))
    onUpdate({ widthCm: wCm, heightCm: hCm, w: cmToW(wCm), h: cmToH(hCm) })
  }

  function applyW(val) { updateCm(val, proj.heightCm || 68) }
  function applyH(val) { updateCm(proj.widthCm || 120, val) }
  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 }}>간판 설정</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 16 }}>✕</button>
      </div>

      <PSection>
        <PLabel>간판 사이즈 프리셋</PLabel>
        {CM_PRESETS.map(pr => (
          <button key={pr.name} onClick={() => updateCm(pr.w, pr.h)} style={{ width: '100%', background: proj.widthCm === pr.w && proj.heightCm === pr.h ? '#fff8ee' : '#f7f6f2', color: proj.widthCm === pr.w && proj.heightCm === pr.h ? '#e09000' : '#555', border: `1.5px solid ${proj.widthCm === pr.w && proj.heightCm === pr.h ? '#f5a62355' : '#e8e5de'}`, borderRadius: 8, padding: '7px 10px', fontSize: 12, cursor: 'pointer', marginBottom: 5, textAlign: 'left', display: 'flex', justifyContent: 'space-between', fontWeight: proj.widthCm === pr.w && proj.heightCm === pr.h ? 600 : 400 }}>
            <span>{pr.name}</span>
          </button>
        ))}
      </PSection>

      <PSection>
        <PLabel>직접 입력 (cm)</PLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>가로(cm)</div>
            <input
              type="number" value={wInput} min="10" max="1000"
              onChange={e => setWInput(e.target.value)}
              onBlur={e => applyW(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { applyW(e.target.value); e.target.blur() } }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>세로(cm)</div>
            <input
              type="number" value={hInput} min="10" max="1000"
              onChange={e => setHInput(e.target.value)}
              onBlur={e => applyH(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { applyH(e.target.value); e.target.blur() } }}
            />
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: '#bbb', textAlign: 'center' }}>
          현재 간판: {proj.widthCm}cm × {proj.heightCm}cm · 입력 후 Enter 또는 클릭 밖
        </div>
      </PSection>

      <PSection>
        <PLabel>배경색</PLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 8 }}>
          {BG_COLORS.map(bg => (
            <button key={bg} onClick={() => onUpdate({ bg })} style={{ width: 22, height: 22, background: bg, border: proj.bg === bg ? '2.5px solid #f5a623' : '1px solid #ddd', borderRadius: 5, cursor: 'pointer' }} />
          ))}
        </div>
        <input type="color" value={proj.bg} onChange={e => onUpdate({ bg: e.target.value })} />
      </PSection>
    </div>
  )
}

function PropPanel({ el, onUpdate, onDelete, onUp, onDown }) {
  return (
    <div style={{ padding: '16px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>속성 편집</div>
      {el.type === 'text' && <>
        <PSection><PLabel>텍스트</PLabel><textarea value={el.text} onChange={e => onUpdate({ text: e.target.value })} style={{ minHeight: 60 }} /></PSection>
        <PSection><PLabel>크기: {el.fontSize}px</PLabel><input type="range" min="40" max="600" value={el.fontSize} onChange={e => onUpdate({ fontSize: +e.target.value })} /></PSection>
        <PSection><PLabel>글자색</PLabel><input type="color" value={el.color || '#ffffff'} onChange={e => onUpdate({ color: e.target.value })} /></PSection>
        <PSection><PLabel>굵기</PLabel><select value={el.fontWeight || 'bold'} onChange={e => onUpdate({ fontWeight: e.target.value })}><option value="normal">보통</option><option value="bold">굵게</option></select></PSection>
      </>}
      {el.type === 'emoji' && <PSection><PLabel>크기: {el.size}px</PLabel><input type="range" min="60" max="800" value={el.size} onChange={e => onUpdate({ size: +e.target.value })} /></PSection>}
      {el.type === 'image' && <PSection><PLabel>너비: {Math.round(el.w)}px</PLabel><input type="range" min="100" max="4000" value={el.w} onChange={e => { const nw = +e.target.value; onUpdate({ w: nw, h: el.h * (nw / el.w) }) }} /></PSection>}
      <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
        <button onClick={onUp}   style={{ flex: 1, background: '#f7f6f2', color: '#666', border: '1px solid #e8e5de', borderRadius: 7, padding: '7px', fontSize: 12, cursor: 'pointer' }}>↑ 앞으로</button>
        <button onClick={onDown} style={{ flex: 1, background: '#f7f6f2', color: '#666', border: '1px solid #e8e5de', borderRadius: 7, padding: '7px', fontSize: 12, cursor: 'pointer' }}>↓ 뒤로</button>
      </div>
      <button onClick={() => { if (window.confirm('삭제할까요?')) onDelete() }} style={{ width: '100%', background: '#fff5f5', color: '#e05555', border: '1px solid #fde0e0', borderRadius: 8, padding: '8px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>요소 삭제</button>
    </div>
  )
}

// ── Display QR View ────────────────────────────────────────────────────────
function DisplayQRView({ proj, onClose, onSimulate }) {
  useEffect(() => { saveLiveProject(proj) }, [proj])
  const encoded = encodeForDisplay(proj)
  const url = `${SITE_URL}/#live=${proj.id}&snap=${encoded}`
  return (
    <div style={{ minHeight: 'calc(100vh - 54px)', background: '#f4f3ef', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e0ddd6', padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#2563eb' }}>📺 디스플레이 기기 연결 QR</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>다른 기기에서 스캔하면 콘텐츠가 전체화면으로 표시됩니다</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #e0ddd6', borderRadius: 20, padding: 28, textAlign: 'center', maxWidth: 300, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 16 }}>📺 {proj.name}</div>
            <div style={{ background: '#fff', border: '2px solid #e8e5de', borderRadius: 12, padding: 14, display: 'inline-block', marginBottom: 14 }}>
              <QRCode value={url} size={190} />
            </div>
            <div style={{ fontSize: 11, color: '#bbb', wordBreak: 'break-all', background: '#f7f6f2', padding: '6px 10px', borderRadius: 7, marginBottom: 10 }}>{SITE_URL}/#live={proj.id}</div>
            <div style={{ fontSize: 12, color: '#888' }}>태블릿·핸드폰·TV에서 카메라로 스캔하세요</div>
          </div>
          <button onClick={onSimulate} style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 10, padding: '11px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>▶ 이 화면에서 시뮬레이션 보기</button>
        </div>
        <div style={{ width: 250, background: '#fff', borderLeft: '1px solid #e0ddd6', padding: '24px 20px', overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 18 }}>연결 방법</div>
          {[
            { n: '1', t: '스마트폰·태블릿 카메라 앱 실행', c: '#2563eb' },
            { n: '2', t: 'QR 코드 스캔', c: '#2563eb' },
            { n: '3', t: '브라우저가 열리며 콘텐츠 전체화면 표시', c: '#2563eb' },
            { n: '4', t: '블루투스·LAN 자동 연결은 정식 버전에서 제공', c: '#bbb' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 3 ? '#f7f6f2' : '#eff6ff', border: `1.5px solid ${i === 3 ? '#e8e5de' : '#bfdbfe'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: s.c, flexShrink: 0, fontWeight: 700 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: i === 3 ? '#ccc' : '#555', lineHeight: 1.5, paddingTop: 4 }}>{s.t}</div>
            </div>
          ))}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 5 }}>⚠️ 참고</div>
            <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.6 }}>QR 접속 화면은 저장된 최신 콘텐츠를 우선 불러옵니다. 단, GitHub Pages 정적 배포에서는 서로 다른 기기 간 실시간 동기화를 위해 Firebase/Supabase 같은 백엔드 연결이 추가로 필요합니다.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Promo QR View ──────────────────────────────────────────────────────────
function PromoQRView({ proj, onClose }) {
  const url = `${SITE_URL}/promo/${proj.id}`
  return (
    <div style={{ minHeight: 'calc(100vh - 54px)', background: '#f4f3ef', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e0ddd6', padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e09000' }}>📱 프로모션 QR</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>행인이 스캔하면 쿠폰·이벤트 페이지로 이동합니다</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e0ddd6', borderRadius: 20, padding: 28, textAlign: 'center', maxWidth: 300, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e09000', marginBottom: 16 }}>🎁 {proj.name} · 프로모션</div>
          <div style={{ background: '#fff', border: '2px solid #e8e5de', borderRadius: 12, padding: 14, display: 'inline-block', marginBottom: 14 }}>
            <QRCode value={`https://doctormond.github.io/signcraft/promo/${proj.id}`} size={190} />
          </div>
          <div style={{ fontSize: 11, color: '#bbb', wordBreak: 'break-all', background: '#f7f6f2', padding: '6px 10px', borderRadius: 7 }}>doctormond.github.io/signcraft/promo/{proj.id}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e8e5de', borderRadius: 12, padding: '16px 20px', maxWidth: 300, width: '100%' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e09000', marginBottom: 10 }}>📋 활용 방법</div>
          {['간판 콘텐츠에 이 QR 이미지 배치', 'LED·LCD 사이니지에 콘텐츠 표시', '행인이 QR 스캔 → 이벤트·쿠폰 확인', '쿠폰 코드로 재방문 유도'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, color: '#f5a623', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Display Simulation ─────────────────────────────────────────────────────
function DisplaySim({ proj, onClose }) {
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight - 54 })
  useEffect(() => {
    const fn = () => setDims({ w: window.innerWidth, h: window.innerHeight - 54 })
    window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn)
  }, [])
  const sc = Math.min(dims.w / proj.w, (dims.h - 48) / proj.h)
  const dW = Math.round(proj.w * sc), dH = Math.round(proj.h * sc)
  return (
    <div style={{ height: 'calc(100vh - 54px)', background: '#111', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>LIVE</span>
        </div>
        <span style={{ fontSize: 11, color: '#666' }}>시뮬레이션 · {proj.name} · {proj.widthCm}×{proj.heightCm}cm</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>← 에디터로</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: dW, height: dH, background: proj.bg, boxShadow: '0 0 60px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
          {proj.els.map(el => {
            const base = { position: 'absolute', left: el.x * sc, top: el.y * sc }
            if (el.type === 'text')  return <div key={el.id} style={{ ...base, fontSize: el.fontSize * sc, fontWeight: el.fontWeight || 'bold', color: el.color || '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.2 }}>{el.text}</div>
            if (el.type === 'emoji') return <div key={el.id} style={{ ...base, fontSize: el.size * sc, lineHeight: 1 }}>{el.emoji}</div>
            if (el.type === 'image') return <div key={el.id} style={{ ...base, width: el.w * sc, height: el.h * sc, overflow: 'hidden' }}><img src={el.src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" /></div>
            return null
          })}
          <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 11, color: 'rgba(255,255,255,0.1)' }}>SignCraft</div>
        </div>
      </div>
    </div>
  )
}
