export const EMOJIS = [
  '☕','🍕','🍔','🍜','🍣','🍰','🥗','🍺','🎂','🥐',
  '🍩','🧋','🍱','🥩','🍦','🥤','🍷','🧁','🍗','🥞',
  '🫖','🍎','🍓','🌮','🍤','🌯','🥙','🍞','🧀','🥚',
  '⭐','❤️','✨','🎉','🔥','💫','🌟','👑','🎵','🏆',
  '💎','🎁','🎀','🎊',
]

export const SIGN_PRESETS = [
  { name: '가로형 Full HD (16:9)', w: 1920, h: 1080 },
  { name: '세로형 Full HD (9:16)', w: 1080, h: 1920 },
  { name: '정사각형 (1:1)', w: 1080, h: 1080 },
  { name: '가로형 4:3', w: 1024, h: 768 },
  { name: '소형 배너', w: 800, h: 400 },
]

export const BG_COLORS = [
  '#0d1117','#1a1a2e','#16213e','#0f3460',
  '#1b4332','#2d6a4f','#9b2226','#4a0e0e',
  '#1c1c1c','#ffffff','#f5f0eb','#ffd166',
  '#06d6a0','#118ab2','#ef476f','#8338ec',
]

export const PROMO_THEMES = [
  { id: 'gold',    name: '골든 나이트', bg: '#13100a', card: '#1e1800', accent: '#f5a623', text: '#fff', sub: '#a07820' },
  { id: 'navy',    name: '딥 네이비',   bg: '#050d1e', card: '#0c1830', accent: '#4fc3f7', text: '#fff', sub: '#2a6080' },
  { id: 'emerald', name: '에메랄드',    bg: '#021a0e', card: '#032814', accent: '#2ecc71', text: '#fff', sub: '#186040' },
  { id: 'rose',    name: '로즈',        bg: '#1a000e', card: '#260015', accent: '#ff6b9d', text: '#fff', sub: '#882040' },
  { id: 'white',   name: '화이트 클린', bg: '#f4f4f0', card: '#ffffff', accent: '#1a1a1a', text: '#111', sub: '#888' },
  { id: 'purple',  name: '딥 퍼플',     bg: '#08001a', card: '#12002a', accent: '#b07aff', text: '#fff', sub: '#6040a0' },
]

export const STORE_TYPES = [
  '카페','음식점','분식·간식','일식','중식','피자·치킨',
  '베이커리','학원','헬스·필라','미용실','기타',
]

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
}

export function genCouponCode() {
  return 'SC' + Math.random().toString(36).slice(2, 7).toUpperCase()
}
