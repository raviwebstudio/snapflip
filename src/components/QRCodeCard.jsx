import { useRef, useState } from 'react'
import { Copy, Download } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

function QRCodeCard({ url }) {
  const qrRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) {
      return
    }

    const link = document.createElement('a')
    link.download = 'snapflip-qr.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
      <div ref={qrRef} className="mx-auto inline-block rounded-xl bg-white p-4">
        <QRCodeCanvas value={url} size={260} bgColor="#ffffff" fgColor="#141E30" level="H" />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={downloadQr} className="primary-button">
          <Download size={17} />
          Download QR
        </button>
        <button type="button" onClick={copyLink} className="secondary-button">
          <Copy size={16} />
          {copied ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

export default QRCodeCard
