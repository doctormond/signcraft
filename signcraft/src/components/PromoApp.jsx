import { useState } from 'react'
import { PROMO_THEMES, STORE_TYPES, uid, genCouponCode } from '../constants.js'
import QRCode from './QRCode.jsx'

const STORAGE_KEY = 'sc-promo-v1'

function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function save(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {} }

export default function PromoApp() {
  const [promos, setPromos] = useState(() => load())
  const [cur, setCur] = useState(null)
  const [modal, setModal] = useState(null) // null | 'qr' | 'preview'

  function persist(ps) { setPromos(ps); save(ps) }
  function newPromo() {
    const p = { id: uid(), storeName: '', storeType: '카페', title: '', desc: '', couponCode: genCouponCode(), discount: '', expiry: '', themeId: 'gold', active: true, created: Date.now() }
    persist([...promos, p]); setCur(p)
  }
  function updatePromo(p) { persist(promos.map(x => x.id === p.id ? p : x)); setCur(p) }
  function deletePromo(id) { persist(promos.filter(p => p.id !== id)) }

  const th = cur ? PROMO_THEMES.find(t => t.id === cur.themeId) || PROMO_THEMES[0] : PROMO_THEMES[0]
  const url = cur ? `https://doctormond.github.io/signcraft/p/${cur.id}` : ''

  if (modal === 'qr' && cur)      return <QRView     promo={cur} url={url} theme={th} onClose={() => setModal(null)} />
  if (modal === 'preview' && cur) return <CustomerView promo={cur} theme={th} onClose={() => setModal(null)} />
  if (cur) return <PromoEditor promo={cur} onUpdate={p => { updatePromo(p); setCur(p) }} onBack={() => { setCur(null) }} onShowQR={() => setModal('qr')} onShowPreview={() => setModal('preview')} />
  return <PromoList promos={promos} onNew={newPromo} onOpen={p => { setCur(p) }} onDelete={deletePromo} />
}

// ── List ───────────────────────────────────────────────────────────────────
function PromoList({ promos, onNew, onOpen, onDelete }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#07070f', padding: '0 0 40px' }}>
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>QR 프로모션 관리</h1>
            <p style={{ fontSize: 13, color: '#444' }}>행인들에게 쿠폰과 이벤트를 QR 코드로 전달하세요</p>
          </div>
          <button onClick={onNew} style={{ marginLeft: 'auto', background: '#f5a623', color: '#000', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ 새 프로모션</button>
        </div>

        {/* Flow explanation */}
        <div style={{ background: '#0c0c1e', border: '1px solid #1a1a30', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 10 }}>📋 동작 방식</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            {['프로모션·쿠폰 제작', 'QR 자동 생성', '간판에 QR 표시', '행인이 스캔', '모바일 페이지 → 쿠폰 수령'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 7, padding: '5px 10px', fontSize: 11, color: '#777' }}>{s}</div>
                {i < 4 && <span style={{ color: '#2a2a3e', fontSize: 12 }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🎟</div>
          <div style={{ fontSize: 15, color: '#444', marginBottom: 6 }}>프로모션이 없어요</div>
          <div style={{ fontSize: 12, color: '#2a2a3e', marginBottom: 18 }}>첫 QR 프로모션을 만들어 고객을 유치하세요</div>
          <button onClick={onNew} style={{ background: '#1a1000', color: '#f5a623', border: '1px solid #2a1f00', borderRadius: 9, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>첫 프로모션 만들기 →</button>
        </div>
      ) : (
        <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {promos.map(p => <PromoCard key={p.id} promo={p} onOpen={onOpen} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

function PromoCard({ promo, onOpen, onDelete }) {
  const th = PROMO_THEMES.find(t => t.id === promo.themeId) || PROMO_THEMES[0]
  const url = `https://doctormond.github.io/signcraft/p/${promo.id}`
  return (
    <div style={{ background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 11, overflow: 'hidden' }}>
      <div style={{ background: th.bg, padding: '12px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ background: '#fff', padding: 8, borderRadius: 8, flexShrink: 0 }}>
          <QRCode value={url} size={60} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: th.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{promo.storeName || '(가게 이름 없음)'}</div>
          <div style={{ fontSize: 11, color: th.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{promo.title || '(이벤트 없음)'}</div>
          {promo.discount && <div style={{ fontSize: 10, color: th.sub }}>🎟 {promo.discount}</div>}
        </div>
      </div>
      <div style={{ padding: '8px 11px', display: 'flex', gap: 6 }}>
        <button style={{ flex: 1, background: '#1a1a2e', color: '#aaa', border: '1px solid #2a2a3e', borderRadius: 7, padding: '6px', fontSize: 12, cursor: 'pointer' }} onClick={() => onOpen(promo)}>편집</button>
        <button style={{ background: '#1f0a0a', color: '#c05555', border: '1px solid #2a1010', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }} onClick={() => { if (window.confirm('삭제할까요?')) onDelete(promo.id) }}>🗑</button>
      </div>
    </div>
  )
}

// ── Editor ─────────────────────────────────────────────────────────────────
function PromoEditor({ promo, onUpdate, onBack, onShowQR, onShowPreview }) {
  const [p, setP] = useState(promo)
  function up(u) { const n = { ...p, ...u }; setP(n); onUpdate(n) }
  const th = PROMO_THEMES.find(t => t.id === p.themeId) || PROMO_THEMES[0]

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#07070f', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0b0b18', borderBottom: '1px solid #1a1a2e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>←</button>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.storeName || '새 프로모션'}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={onShowPreview} style={{ background: '#091a09', color: '#2ecc71', border: '1px solid #163016', borderRadius: 7, padding: '6px 11px', fontSize: 12, cursor: 'pointer' }}>📱 고객 화면</button>
          <button onClick={onShowQR}      style={{ background: '#1a1000', color: '#f5a623', border: '1px solid #2a1f00', borderRadius: 7, padding: '6px 11px', fontSize: 12, cursor: 'pointer' }}>🔲 QR 보기</button>
          <button onClick={() => onUpdate(p)} style={{ background: '#f5a623', color: '#000', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>저장 ✓</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'auto' }}>
        {/* Form */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', maxWidth: 560 }}>
          <Sec title="🏪 가게 정보">
            <Row label="상호명"><input type="text" value={p.storeName} onChange={e => up({ storeName: e.target.value })} placeholder="예: 달콤 카페" /></Row>
            <Row label="업종"><select value={p.storeType} onChange={e => up({ storeType: e.target.value })}>{STORE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></Row>
          </Sec>
          <Sec title="🎉 이벤트 / 프로모션">
            <Row label="제목"><input type="text" value={p.title} onChange={e => up({ title: e.target.value })} placeholder="예: 오픈 기념 특가!" /></Row>
            <Row label="내용"><textarea value={p.desc} onChange={e => up({ desc: e.target.value })} placeholder="이벤트 내용을 입력하세요. 행인들에게 매력적인 문구를 써보세요 :)" style={{ minHeight: 72 }} /></Row>
          </Sec>
          <Sec title="🎟 쿠폰 설정">
            <Row label="할인 내용"><input type="text" value={p.discount} onChange={e => up({ discount: e.target.value })} placeholder="예: 아메리카노 30% 할인 / 1+1 / 무료 업그레이드" /></Row>
            <Row label="쿠폰 코드">
              <div style={{ display: 'flex', gap: 7 }}>
                <input type="text" value={p.couponCode} onChange={e => up({ couponCode: e.target.value })} style={{ flex: 1 }} />
                <button onClick={() => up({ couponCode: genCouponCode() })} style={{ background: '#1a1a2e', color: '#888', border: '1px solid #2a2a3e', borderRadius: 7, padding: '5px 10px', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>↻ 재생성</button>
              </div>
            </Row>
            <Row label="유효기간"><input type="date" value={p.expiry} onChange={e => up({ expiry: e.target.value })} /></Row>
          </Sec>
          <Sec title="🎨 테마 선택">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {PROMO_THEMES.map(t => (
                <button key={t.id} onClick={() => up({ themeId: t.id })} style={{ background: t.bg, border: `2px solid ${p.themeId === t.id ? '#f5a623' : '#1a1a2e'}`, borderRadius: 10, padding: '12px 6px', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 26, height: 26, background: t.accent, borderRadius: 7, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 10, color: t.text, opacity: 0.8 }}>{t.name}</div>
                </button>
              ))}
            </div>
          </Sec>
        </div>

        {/* Right: QR preview */}
        <div style={{ width: 200, background: '#090912', borderLeft: '1px solid #1a1a2e', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 }}>QR 미리보기</div>
          <div style={{ background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 0 0 3px #1a1a2e' }}>
            <QRCode value={`https://doctormond.github.io/signcraft/p/${p.id}`} size={130} />
          </div>
          <div style={{ fontSize: 10, color: '#2a2a4e', textAlign: 'center', lineHeight: 1.5 }}>간판·LED에 표시할 QR</div>
          <button onClick={onShowQR} style={{ width: '100%', background: '#1a1000', color: '#f5a623', border: '1px solid #2a1f00', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer' }}>🔲 크게 보기</button>
          <div style={{ width: '100%', height: 1, background: '#1a1a2e' }} />
          <div style={{ fontSize: 10, color: '#2a2a3e', textAlign: 'center' }}>고객이 스캔하면</div>
          <button onClick={onShowPreview} style={{ width: '100%', background: '#091a09', color: '#2ecc71', border: '1px solid #163016', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer' }}>📱 고객 화면 미리보기</button>
        </div>
      </div>
    </div>
  )
}

function Sec({ title, children }) {
  return <div style={{ marginBottom: 22 }}><div style={{ fontSize: 12, fontWeight: 600, color: '#666', borderBottom: '1px solid #1a1a2e', paddingBottom: 8, marginBottom: 12 }}>{title}</div>{children}</div>
}
function Row({ label, children }) {
  return <div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, color: '#444', marginBottom: 5 }}>{label}</div>{children}</div>
}

// ── QR View ────────────────────────────────────────────────────────────────
function QRView({ promo, url, theme, onClose }) {
  const th = theme
  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#07070f', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0b0b18', borderBottom: '1px solid #1a1a2e', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555' }}>QR 코드 — 디지털 사이니지에 표시하세요</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: '#1a1a2e', color: '#777', border: '1px solid #2a2a3e', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>← 돌아가기</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32 }}>
        <div style={{ background: th.bg, padding: 28, borderRadius: 20, border: `2px solid ${th.accent}33`, textAlign: 'center', maxWidth: 300, width: '100%' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: th.text, marginBottom: 4 }}>{promo.storeName || '가게 이름'}</div>
          {promo.title && <div style={{ fontSize: 12, color: th.accent, marginBottom: 14 }}>{promo.title}</div>}
          <div style={{ background: '#fff', borderRadius: 14, padding: 18, display: 'inline-block', marginBottom: 14 }}>
            <QRCode value={url} size={190} />
          </div>
          <div style={{ fontSize: 11, color: th.sub }}>📱 스캔하면 쿠폰을 드려요!</div>
        </div>
        <div style={{ fontSize: 11, color: '#333', fontFamily: 'monospace', background: '#111118', padding: '5px 12px', borderRadius: 7 }}>{url}</div>
      </div>
    </div>
  )
}

// ── Customer Preview ───────────────────────────────────────────────────────
function CustomerView({ promo, theme, onClose }) {
  const [claimed, setClaimed] = useState(false)
  const th = theme
  const icon = promo.storeType === '카페' ? '☕' : promo.storeType === '음식점' ? '🍽' : promo.storeType === '베이커리' ? '🥐' : promo.storeType === '학원' ? '📚' : promo.storeType === '헬스·필라' ? '💪' : '🏪'

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#07070f', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0b0b18', borderBottom: '1px solid #1a1a2e', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555' }}>📱 고객 화면 미리보기 (모바일 시뮬레이션)</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: '#1a1a2e', color: '#777', border: '1px solid #2a2a3e', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>← 에디터로</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: 300, background: '#141414', borderRadius: 40, padding: '14px 8px 10px', boxShadow: '0 0 0 2px #1a1a1a, 0 0 0 4px #0a0a0a, 0 20px 60px rgba(0,0,0,0.7)' }}>
          <div style={{ width: 72, height: 5, background: '#1e1e1e', borderRadius: 3, margin: '0 auto 10px' }} />
          <div style={{ borderRadius: 28, overflow: 'hidden', background: th.bg }}>
            <div style={{ background: th.card, padding: '28px 20px 20px', textAlign: 'center', borderBottom: `1px solid ${th.accent}22` }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: th.text, marginBottom: 4 }}>{promo.storeName || '가게 이름'}</div>
              <div style={{ display: 'inline-block', background: th.accent + '22', color: th.accent, fontSize: 10, padding: '2px 9px', borderRadius: 10 }}>{promo.storeType}</div>
            </div>
            <div style={{ padding: '16px 14px' }}>
              <div style={{ background: th.card, borderRadius: 13, padding: '14px', marginBottom: 12, border: `1px solid ${th.accent}22` }}>
                <div style={{ fontSize: 10, color: th.accent, marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>🎉 이벤트</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: th.text, marginBottom: 6, lineHeight: 1.3 }}>{promo.title || '이벤트 제목을 입력하세요'}</div>
                <div style={{ fontSize: 11, color: th.text, opacity: 0.65, lineHeight: 1.6 }}>{promo.desc || '이벤트 내용이 여기에 표시됩니다. 행인들에게 매력적인 문구를 작성해보세요!'}</div>
              </div>
              {(promo.discount || promo.couponCode) && (
                <div style={{ border: `2px dashed ${th.accent}88`, borderRadius: 13, padding: '14px', textAlign: 'center', background: th.accent + '0d', marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: th.accent, marginBottom: 6, fontWeight: 600 }}>🎟 나만의 쿠폰</div>
                  {promo.discount && <div style={{ fontSize: 16, fontWeight: 700, color: th.accent, marginBottom: 8 }}>{promo.discount}</div>}
                  {!claimed ? (
                    <>
                      <button onClick={() => setClaimed(true)} style={{ background: th.accent, color: '#000', border: 'none', borderRadius: 20, padding: '8px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 6 }}>쿠폰 받기 →</button>
                      {promo.expiry && <div style={{ fontSize: 10, color: th.text, opacity: 0.4 }}>~{promo.expiry}까지</div>}
                    </>
                  ) : (
                    <div>
                      <div style={{ background: th.accent + '22', border: `1px solid ${th.accent}`, borderRadius: 9, padding: '9px', marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: th.sub, marginBottom: 3 }}>쿠폰 코드</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: th.accent, letterSpacing: 3 }}>{promo.couponCode || 'SCABCD'}</div>
                      </div>
                      <div style={{ fontSize: 10, color: th.text, opacity: 0.5 }}>방문 시 이 코드를 제시하세요</div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ background: th.card, borderRadius: 9, padding: '10px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${th.accent}11` }}>
                <div style={{ width: 30, height: 30, background: th.accent + '22', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: th.text }}>{promo.storeName || '가게 이름'}</div>
                  <div style={{ fontSize: 9, color: th.sub }}>Powered by SignCraft QR</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 100, height: 3, background: '#1e1e1e', borderRadius: 2, margin: '0 auto' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
