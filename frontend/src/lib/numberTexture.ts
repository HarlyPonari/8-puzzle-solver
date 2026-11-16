import { CanvasTexture, SRGBColorSpace } from 'three'

const cache = new Map<number, CanvasTexture>()

export function getNumberTexture(value: number): CanvasTexture {
  const cached = cache.get(value)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256)
    ctx.fillStyle = '#2b2438'
    ctx.font = '800 180px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillText(String(value), 128, 136)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  cache.set(value, texture)
  return texture
}
