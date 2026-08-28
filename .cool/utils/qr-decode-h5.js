import jsQR from 'jsqr'

const ALBUM_SCALES = [1, 1.25, 1.5, 0.85, 0.7, 2, 2.5, 3]
const SCAN_INTERVAL = 70
const SCAN_INTERVAL_FAST = 40
const FAST_SCAN_DURATION_MS = 2500
const THOROUGH_EVERY_FAST = 4
const THOROUGH_EVERY_NORMAL = 8
const DECODE_TIMEOUT = 20000
const FIXED_THRESHOLDS = [90, 110, 128, 145, 165, 185]
const DOT_QR_THRESHOLDS = [55, 60, 65, 70, 75, 80, 85, 95, 105]
const TARGET_DECODE_SIZE = 1600
const ALBUM_CARD_CROPS = [
	{ sx: 0, sy: 0, sw: 1, sh: 1 },
	{ sx: 0.05, sy: 0.32, sw: 0.9, sh: 0.5 },
	{ sx: 0.08, sy: 0.35, sw: 0.84, sh: 0.45 },
	{ sx: 0.1, sy: 0.38, sw: 0.8, sh: 0.42 }
]

let videoVariantCursor = 0
let barcodeDetectorInstance = null
let barcodeDetectorSupported = null

export function createQrReader() {
	return null
}

export function isH5CameraSupported() {
	return typeof navigator !== 'undefined'
		&& !!navigator.mediaDevices
		&& typeof navigator.mediaDevices.getUserMedia === 'function'
}

export function mountNativeVideo(container) {
	if (!container) return null
	const el = container.$el || container
	if (!el || typeof el.appendChild !== 'function') return null
	el.innerHTML = ''
	const video = document.createElement('video')
	video.className = 'scanner-video-native'
	video.setAttribute('autoplay', 'true')
	video.setAttribute('muted', 'true')
	video.setAttribute('playsinline', 'true')
	video.setAttribute('webkit-playsinline', 'true')
	video.muted = true
	video.playsInline = true
	video.style.width = '100%'
	video.style.height = '100%'
	video.style.objectFit = 'cover'
	video.style.display = 'block'
	el.appendChild(video)
	return video
}

function createCanvas() {
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d', { willReadFrequently: true })
	return { canvas, ctx }
}

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image()
		if (!/^blob:|^data:/.test(src)) {
			img.crossOrigin = 'anonymous'
		}
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('图片加载失败'))
		img.src = src
	})
}

function toGrayVariants(imageData) {
	const { width, height, data } = imageData
	const len = width * height
	const standard = new Uint8ClampedArray(len)
	const minChannel = new Uint8ClampedArray(len)
	const maxChannel = new Uint8ClampedArray(len)

	for (let i = 0, j = 0; i < data.length; i += 4, j++) {
		const r = data[i]
		const g = data[i + 1]
		const b = data[i + 2]
		standard[j] = (r * 0.299 + g * 0.587 + b * 0.114) & 0xff
		minChannel[j] = Math.min(r, g, b)
		maxChannel[j] = Math.max(r, g, b)
	}

	return { standard, minChannel, maxChannel, width, height }
}

function grayToImageData(gray, width, height, invert) {
	const out = new Uint8ClampedArray(width * height * 4)
	for (let i = 0, j = 0; i < gray.length; i++, j += 4) {
		let v = gray[i]
		if (invert) v = 255 - v
		out[j] = out[j + 1] = out[j + 2] = v
		out[j + 3] = 255
	}
	return new ImageData(out, width, height)
}

function computeOtsuThreshold(gray) {
	const hist = new Uint32Array(256)
	for (let i = 0; i < gray.length; i++) hist[gray[i]]++

	let sum = 0
	for (let i = 0; i < 256; i++) sum += i * hist[i]

	let sumB = 0
	let wB = 0
	let maxVar = 0
	let threshold = 128
	const total = gray.length

	for (let t = 0; t < 256; t++) {
		wB += hist[t]
		if (!wB) continue
		const wF = total - wB
		if (!wF) break
		sumB += t * hist[t]
		const mB = sumB / wB
		const mF = (sum - sumB) / wF
		const varBetween = wB * wF * (mB - mF) * (mB - mF)
		if (varBetween > maxVar) {
			maxVar = varBetween
			threshold = t
		}
	}
	return threshold
}

function binarizeGray(gray, threshold, invert) {
	const binary = new Uint8ClampedArray(gray.length)
	for (let i = 0; i < gray.length; i++) {
		const dark = gray[i] < threshold
		binary[i] = (invert ? !dark : dark) ? 0 : 255
	}
	return binary
}

function dilateDark(binary, width, height, radius) {
	const out = new Uint8ClampedArray(binary.length)
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let minVal = 255
			for (let dy = -radius; dy <= radius; dy++) {
				for (let dx = -radius; dx <= radius; dx++) {
					const nx = x + dx
					const ny = y + dy
					if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
					minVal = Math.min(minVal, binary[ny * width + nx])
				}
			}
			out[y * width + x] = minVal
		}
	}
	return out
}

function adaptiveMeanBinary(gray, width, height, blockSize, offset) {
	const out = new Uint8ClampedArray(gray.length)
	const half = blockSize >> 1
	const integral = new Float64Array((width + 1) * (height + 1))

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = y * width + x
			const above = y > 0 ? integral[y * (width + 1) + x + 1] : 0
			const left = x > 0 ? integral[(y + 1) * (width + 1) + x] : 0
			const diag = (y > 0 && x > 0) ? integral[y * (width + 1) + x] : 0
			integral[(y + 1) * (width + 1) + x + 1] = gray[idx] + above + left - diag
		}
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const x1 = Math.max(0, x - half)
			const y1 = Math.max(0, y - half)
			const x2 = Math.min(width - 1, x + half)
			const y2 = Math.min(height - 1, y + half)
			const count = (x2 - x1 + 1) * (y2 - y1 + 1)
			const sum = integral[(y2 + 1) * (width + 1) + x2 + 1]
				- integral[y1 * (width + 1) + x2 + 1]
				- integral[(y2 + 1) * (width + 1) + x1]
				+ integral[y1 * (width + 1) + x1]
			const mean = sum / count
			out[y * width + x] = gray[y * width + x] < (mean - offset) ? 0 : 255
		}
	}
	return out
}

/** 弱化 TikTok 圆点码中的红/青装饰色点，避免干扰二值化 */
function suppressColorDots(imageData) {
	const { width, height, data } = imageData
	const out = new Uint8ClampedArray(data)
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i]
		const g = data[i + 1]
		const b = data[i + 2]
		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		const sat = max - min
		if (sat > 40 && max > 80) {
			const gray = (r * 0.299 + g * 0.587 + b * 0.114) | 0
			out[i] = out[i + 1] = out[i + 2] = gray
		}
	}
	return { width, height, data: out }
}

function contrastStretch(gray) {
	let min = 255
	let max = 0
	for (let i = 0; i < gray.length; i++) {
		if (gray[i] < min) min = gray[i]
		if (gray[i] > max) max = gray[i]
	}
	const range = max - min || 1
	const out = new Uint8ClampedArray(gray.length)
	for (let i = 0; i < gray.length; i++) {
		out[i] = Math.round(((gray[i] - min) * 255) / range)
	}
	return out
}

function decodeWithJsQR(imageData) {
	const result = jsQR(imageData.data, imageData.width, imageData.height, {
		inversionAttempts: 'attemptBoth'
	})
	return result ? result.data : null
}

async function decodeWithBarcodeDetector(canvas) {
	if (typeof window === 'undefined') {
		return null
	}

	if (barcodeDetectorSupported === false) return null

	if (barcodeDetectorInstance === null) {
		if (!('BarcodeDetector' in window)) {
			barcodeDetectorSupported = false
			return null
		}
		try {
			barcodeDetectorInstance = new window.BarcodeDetector({ formats: ['qr_code'] })
			barcodeDetectorSupported = true
		} catch (e) {
			barcodeDetectorSupported = false
			return null
		}
	}

	try {
		const codes = await barcodeDetectorInstance.detect(canvas)
		if (codes && codes.length && codes[0].rawValue) {
			return codes[0].rawValue
		}
	} catch (e) {}
	return null
}

function buildDotQrVariants(imageData, quick, lite = false) {
	const cleaned = suppressColorDots(imageData)
	const { minChannel, width, height } = toGrayVariants(cleaned)
	const thresholds = lite ? [65] : (quick ? [60, 70, 85] : DOT_QR_THRESHOLDS)
	const radii = lite ? [1] : (quick ? [1, 2] : [1, 2, 3, 4])
	const variants = []

	thresholds.forEach((t) => {
		const binary = binarizeGray(minChannel, t, false)
		variants.push(grayToImageData(binary, width, height, false))
		variants.push(grayToImageData(binary, width, height, true))
		radii.forEach((r) => {
			const dilated = dilateDark(binary, width, height, r)
			variants.push(grayToImageData(dilated, width, height, false))
			variants.push(grayToImageData(dilated, width, height, true))
		})
	})

	return variants
}

function decodeDotQrWithJsQR(imageData, quick, lite = false) {
	const variants = buildDotQrVariants(imageData, quick, lite)
	for (let i = 0; i < variants.length; i++) {
		const text = decodeWithJsQR(variants[i])
		if (text) return text
	}
	return null
}

function buildJsQRFastVariants(imageData) {
	const cleaned = suppressColorDots(imageData)
	const { minChannel, width, height } = toGrayVariants(cleaned)
	const stretched = contrastStretch(minChannel)
	const variants = [
		cleaned,
		imageData,
		grayToImageData(minChannel, width, height, false),
		grayToImageData(stretched, width, height, false)
	]

	const otsu = computeOtsuThreshold(minChannel)
	const binary = binarizeGray(minChannel, otsu, false)
	variants.push(grayToImageData(binary, width, height, false))
	variants.push(grayToImageData(binary, width, height, true))

	;[1, 2, 3, 4].forEach((r) => {
		const dilated = dilateDark(binary, width, height, r)
		variants.push(grayToImageData(dilated, width, height, false))
		variants.push(grayToImageData(dilated, width, height, true))
	})

	const adaptive = adaptiveMeanBinary(minChannel, width, height, 25, 7)
	variants.push(grayToImageData(adaptive, width, height, false))
	variants.push(grayToImageData(adaptive, width, height, true))

	;[128, 150].forEach((t) => {
		const b = binarizeGray(stretched, t, false)
		variants.push(grayToImageData(b, width, height, false))
		variants.push(grayToImageData(b, width, height, true))
	})

	return variants
}

function buildVideoRealtimeVariants(imageData, thorough) {
	const cleaned = suppressColorDots(imageData)
	const { minChannel, width, height } = toGrayVariants(cleaned)
	const variants = [
		imageData,
		cleaned,
		grayToImageData(minChannel, width, height, false)
	]

	const otsu = computeOtsuThreshold(minChannel)
	const binary = binarizeGray(minChannel, otsu, false)
	variants.push(grayToImageData(binary, width, height, false))
	variants.push(grayToImageData(binary, width, height, true))

	const dilated = dilateDark(binary, width, height, 1)
	variants.push(grayToImageData(dilated, width, height, false))

	if (thorough) {
		const adaptive = adaptiveMeanBinary(minChannel, width, height, 25, 7)
		variants.push(grayToImageData(adaptive, width, height, false))
		variants.push(grayToImageData(adaptive, width, height, true))
	}

	return variants
}

function buildJsQRThoroughVariants(imageData) {
	const variants = buildJsQRFastVariants(imageData)
	variants.push(...buildDotQrVariants(imageData, false))
	const { standard, minChannel, maxChannel, width, height } = toGrayVariants(suppressColorDots(imageData))
	const stretched = contrastStretch(minChannel)

	variants.push(grayToImageData(standard, width, height, false))

	const grays = [minChannel, stretched, standard]
	const thresholds = [
		computeOtsuThreshold(minChannel),
		computeOtsuThreshold(stretched),
		...FIXED_THRESHOLDS
	]

	grays.forEach((gray) => {
		thresholds.forEach((t) => {
			const binary = binarizeGray(gray, t, false)
			variants.push(grayToImageData(binary, width, height, false))
			variants.push(grayToImageData(binary, width, height, true))
			;[1, 2, 3].forEach((r) => {
				const dilated = dilateDark(binary, width, height, r)
				variants.push(grayToImageData(dilated, width, height, false))
				variants.push(grayToImageData(dilated, width, height, true))
			})
		})
	})

	variants.push(grayToImageData(maxChannel, width, height, true))
	return variants
}

function decodeFastWithJsQR(imageData) {
	const variants = buildJsQRFastVariants(imageData)
	for (let i = 0; i < variants.length; i++) {
		const text = decodeWithJsQR(variants[i])
		if (text) return text
	}
	return null
}

function pickVideoVariants(allVariants, batchSize) {
	if (!allVariants.length) return []
	const start = videoVariantCursor % allVariants.length
	videoVariantCursor = (start + batchSize) % allVariants.length
	const picked = []
	for (let i = 0; i < batchSize; i++) {
		picked.push(allVariants[(start + i) % allVariants.length])
	}
	return picked
}

function imageDataToCanvas(imageData, canvas, ctx) {
	canvas.width = imageData.width
	canvas.height = imageData.height
	ctx.putImageData(imageData, 0, 0)
}

async function tryDecodeImageData(imageData, canvas, ctx, skipNative, thorough) {
	const dotText = decodeDotQrWithJsQR(imageData, !thorough)
	if (dotText) return dotText

	const jsText = decodeFastWithJsQR(imageData)
	if (jsText) return jsText

	if (!skipNative) {
		imageDataToCanvas(imageData, canvas, ctx)
		const nativeText = await decodeWithBarcodeDetector(canvas)
		if (nativeText) return nativeText
	}

	return null
}

async function decodeImageDataVariants(imageData, canvas, ctx, thorough, realtime = false, quickOnly = false) {
	if (realtime) {
		let text = decodeWithJsQR(imageData)
		if (text) return text

		text = decodeDotQrWithJsQR(imageData, true, quickOnly)
		if (text) return text

		if (quickOnly) return null

		const variants = buildVideoRealtimeVariants(imageData, thorough)
		const list = pickVideoVariants(variants, thorough ? 6 : 4)
		for (let i = 0; i < list.length; i++) {
			text = decodeWithJsQR(list[i])
			if (text) return text
		}

		if (thorough) {
			imageDataToCanvas(imageData, canvas, ctx)
			return decodeWithBarcodeDetector(canvas)
		}

		return null
	}

	let text = decodeDotQrWithJsQR(imageData, !thorough)
	if (text) return text

	text = decodeWithJsQR(imageData)
	if (text) return text

	text = await tryDecodeImageData(imageData, canvas, ctx, false, thorough)
	if (text) return text

	if (thorough) {
		const variants = buildJsQRThoroughVariants(imageData)
		for (let i = 0; i < variants.length; i++) {
			text = decodeWithJsQR(variants[i])
			if (text) return text
			imageDataToCanvas(variants[i], canvas, ctx)
			text = await decodeWithBarcodeDetector(canvas)
			if (text) return text
		}
		imageDataToCanvas(imageData, canvas, ctx)
		return decodeWithBarcodeDetector(canvas)
	}

	const variants = buildJsQRFastVariants(imageData)
	const list = pickVideoVariants(variants, 4)
	for (let i = 0; i < list.length; i++) {
		text = decodeWithJsQR(list[i])
		if (text) return text
	}

	return null
}

async function decodeFromCanvas(canvas, ctx, thorough, realtime = false, quickOnly = false) {
	const w = canvas.width
	const h = canvas.height
	if (!w || !h) return null
	const rawData = ctx.getImageData(0, 0, w, h)
	return decodeImageDataVariants(rawData, canvas, ctx, thorough, realtime, quickOnly)
}

function drawVideoRegion(video, canvas, ctx, region, maxEdge) {
	const vw = video.videoWidth
	const vh = video.videoHeight
	if (!vw || !vh) return false

	const sx = Math.floor(region.sx * vw)
	const sy = Math.floor(region.sy * vh)
	const sw = Math.floor(region.sw * vw)
	const sh = Math.floor(region.sh * vh)
	if (sw <= 0 || sh <= 0) return false

	const longEdge = Math.max(sw, sh)
	const baseScale = TARGET_DECODE_SIZE / longEdge
	const edgeScale = maxEdge ? (maxEdge / longEdge) : baseScale
	let scale = Math.min(baseScale, edgeScale)
	if (!Number.isFinite(scale) || scale <= 0) scale = 1
	scale = Math.max(0.35, Math.min(2, scale))
	canvas.width = Math.max(1, Math.floor(sw * scale))
	canvas.height = Math.max(1, Math.floor(sh * scale))
	ctx.imageSmoothingEnabled = true
	ctx.imageSmoothingQuality = 'high'
	ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
	return true
}

const VIDEO_REGIONS = [
	{ sx: 0, sy: 0, sw: 1, sh: 1 }
]

async function decodeVideoFrame(video, canvas, ctx, thorough, quickOnly) {
	const regions = VIDEO_REGIONS

	for (let r = 0; r < regions.length; r++) {
		const edge = thorough ? 1100 : quickOnly ? 900 : 960
		if (!drawVideoRegion(video, canvas, ctx, regions[r], edge)) continue
		const text = await decodeFromCanvas(canvas, ctx, thorough, true, quickOnly)
		if (text) return text
	}
	return null
}

function cropImageToCanvas(img, canvas, ctx, crop, scale) {
	const baseWidth = img.naturalWidth || img.width
	const baseHeight = img.naturalHeight || img.height
	const sx = Math.floor(crop.sx * baseWidth)
	const sy = Math.floor(crop.sy * baseHeight)
	const sw = Math.floor(crop.sw * baseWidth)
	const sh = Math.floor(crop.sh * baseHeight)
	if (sw <= 0 || sh <= 0) return false

	canvas.width = Math.floor(sw * scale)
	canvas.height = Math.floor(sh * scale)
	ctx.imageSmoothingEnabled = true
	ctx.imageSmoothingQuality = 'high'
	ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
	return true
}

async function decodeFromImageElement(img) {
	const { canvas, ctx } = createCanvas()
	const baseWidth = img.naturalWidth || img.width
	const baseHeight = img.naturalHeight || img.height
	if (!baseWidth || !baseHeight) {
		throw new Error('图片尺寸无效')
	}

	const maxBase = Math.max(baseWidth, baseHeight)
	const autoUp = maxBase < 800 ? Math.min(4, 800 / maxBase) : 1
	const scales = autoUp > 1
		? [...ALBUM_SCALES.map((s) => s * autoUp), ...ALBUM_SCALES]
		: ALBUM_SCALES

	for (let c = 0; c < ALBUM_CARD_CROPS.length; c++) {
		for (let s = 0; s < scales.length; s++) {
			const scale = scales[s]
			if (!cropImageToCanvas(img, canvas, ctx, ALBUM_CARD_CROPS[c], scale)) continue
			const text = await decodeFromCanvas(canvas, ctx, true)
			if (text) return text
		}
	}

	throw new Error('未识别到二维码')
}

function withTimeout(promise, ms, message) {
	return Promise.race([
		promise,
		new Promise((_, reject) => {
			setTimeout(() => reject(new Error(message || '识别超时')), ms)
		})
	])
}

export async function decodeImageUrl(imageUrl) {
	return withTimeout(
		(async () => {
			const img = await loadImage(imageUrl)
			return decodeFromImageElement(img)
		})(),
		DECODE_TIMEOUT,
		'识别超时，请换一张清晰的二维码图片'
	)
}

function isVideoPreviewReady(videoElement) {
	if (!videoElement || videoElement.readyState < 2) return false
	if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) return true
	const stream = videoElement.srcObject
	if (stream && stream.getVideoTracks) {
		const tracks = stream.getVideoTracks()
		if (tracks.length && tracks[0].readyState === 'live') return true
	}
	return false
}

function waitForVideoReady(videoElement) {
	return new Promise((resolve, reject) => {
		let count = 0
		let done = false
		const cleanup = () => {
			videoElement.removeEventListener('loadedmetadata', check)
			videoElement.removeEventListener('loadeddata', check)
			videoElement.removeEventListener('playing', check)
		}
		const check = () => {
			if (done) return
			if (isVideoPreviewReady(videoElement)) {
				done = true
				cleanup()
				resolve()
				return
			}
			count++
			if (count >= 100) {
				done = true
				cleanup()
				reject(new Error('相机预览未就绪'))
				return
			}
			setTimeout(check, 50)
		}
		videoElement.addEventListener('loadedmetadata', check)
		videoElement.addEventListener('loadeddata', check)
		videoElement.addEventListener('playing', check)
		check()
	})
}

export async function startVideoScan(_reader, videoElement, onResult, onReady) {
	if (!(videoElement instanceof HTMLVideoElement)) {
		throw new Error('视频元素无效，请刷新后重试')
	}

	const stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			facingMode: { ideal: 'environment' },
			width: { ideal: 1280 },
			height: { ideal: 720 },
			frameRate: { ideal: 24, max: 30 }
		}
	})
	videoElement.srcObject = stream
	await videoElement.play().catch(() => {})

	const notifyReady = () => {
		if (typeof onReady === 'function') {
			onReady()
		}
	}

	if (isVideoPreviewReady(videoElement)) {
		notifyReady()
	}

	await waitForVideoReady(videoElement)
	notifyReady()

	const { canvas, ctx } = createCanvas()
	let stopped = false
	let decoding = false
	let frameId = 0
	let lastText = ''
	let lastAt = 0
	const scanStartedAt = Date.now()

	const scanLoop = () => {
		if (stopped) return
		frameId++
		const elapsed = Date.now() - scanStartedAt
		const fastStage = elapsed < FAST_SCAN_DURATION_MS
		const thoroughEvery = fastStage ? THOROUGH_EVERY_FAST : THOROUGH_EVERY_NORMAL
		const runThorough = frameId % thoroughEvery === 0
		const quickOnly = !runThorough && (fastStage ? frameId % 2 === 1 : frameId % 3 !== 0)

		if (!decoding && videoElement.readyState >= 2) {
			decoding = true
			decodeVideoFrame(videoElement, canvas, ctx, runThorough, quickOnly)
				.then((text) => {
					if (text && !stopped) {
						const now = Date.now()
						if (text !== lastText || now - lastAt > 800) {
							lastText = text
							lastAt = now
							onResult(text)
						}
					}
				})
				.catch(() => {})
				.finally(() => {
					decoding = false
				})
		}

		if (!stopped) {
			setTimeout(scanLoop, fastStage ? SCAN_INTERVAL_FAST : SCAN_INTERVAL)
		}
	}

	scanLoop()

	const session = {
		stream,
		stop() {
			stopped = true
		}
	}
	videoElement._scanSession = session
	return session
}

export function stopVideoScan(_reader, videoElement) {
	if (videoElement && videoElement._scanSession) {
		videoElement._scanSession.stop()
		delete videoElement._scanSession
	}
	if (videoElement) {
		const stream = videoElement.srcObject
		if (stream && stream.getTracks) {
			stream.getTracks().forEach((track) => track.stop())
		}
		videoElement.srcObject = null
	}
}
