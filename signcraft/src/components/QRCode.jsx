import { QRCodeSVG } from 'qrcode.react'

export default function QRCode({ value, size = 150, bgColor = '#ffffff', fgColor = '#000000' }) {
  if (!value) return (
    <div style={{
      width: size, height: size,
      background: bgColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 4,
      fontSize: 11, color: '#aaa',
    }}>
      QR 준비 중
    </div>
  )
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      level="M"
      includeMargin={false}
    />
  )
}
