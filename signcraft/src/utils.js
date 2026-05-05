export const CM_TO_PX = 20
export function cmToW(cm) { return Math.round(cm * CM_TO_PX) }
export function cmToH(cm) { return Math.round(cm * CM_TO_PX) }

// Save full project (including image data URLs) to localStorage for live display.
// This is the MVP's local live-store. Cross-device live sync still needs a backend.
export function saveLiveProject(proj) {
  try {
    localStorage.setItem(`sc-live-${proj.id}`, JSON.stringify({ ...proj, updatedAt: Date.now() }))
  } catch(e) {
    // If storage is full, keep the layout and mark oversized images explicitly.
    try {
      const slim = {
        ...proj,
        updatedAt: Date.now(),
        els: proj.els.map(el => el.type === 'image' ? { ...el, src: '__too_large__' } : el),
      }
      localStorage.setItem(`sc-live-${proj.id}`, JSON.stringify(slim))
    } catch {}
  }
}

export function loadLiveProject(id) {
  try {
    const raw = localStorage.getItem(`sc-live-${id}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// Encode text/emoji snapshot (no images) for QR URL fallback
export function encodeForDisplay(proj) {
  const d = {
    id: proj.id,
    name: proj.name, bg: proj.bg,
    w: proj.w, h: proj.h,
    widthCm: proj.widthCm || 120,
    heightCm: proj.heightCm || 68,
    els: proj.els
      .filter(e => e.type !== 'image')
      .map(({ id, type, text, emoji, x, y, fontSize, color, fontWeight, size }) =>
        ({ id, type, text, emoji, x, y, fontSize, color, fontWeight, size })
      )
  }
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(d)))) }
  catch { return '' }
}

export function decodeFromDisplay(encoded) {
  try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))) }
  catch { return null }
}
