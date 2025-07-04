<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const svgSourceText = ref('')
const pngDataUrl = ref<string | null>(null)
const imgTagText = ref('')
const originalWidth = ref(0)
const originalHeight = ref(0)
const outputMode = ref<'original' | 'scale' | 'custom'>('original')
const scalePercent = ref(200)
const customWidth = ref(500)
const customHeight = ref(500)
const keepAspectRatio = ref(true)
const invertColor = ref(false)
const aspectRatio = ref(1)

const copiedDownload = ref(false)
const copiedClipboard = ref(false)
const copiedImgTag = ref(false)

const fileName = ref('converted')

const scaleOptions = [25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000]
const scaleWidth = computed(() => Math.round(originalWidth.value * scalePercent.value / 100))
const scaleHeight = computed(() => Math.round(originalHeight.value * scalePercent.value / 100))

const targetWidth = computed(() => outputMode.value === 'original' ? originalWidth.value :
  outputMode.value === 'scale' ? scaleWidth.value : customWidth.value)

const targetHeight = computed(() => outputMode.value === 'original' ? originalHeight.value :
  outputMode.value === 'scale' ? scaleHeight.value : customHeight.value)

watch(customWidth, w => {
  if (keepAspectRatio.value && outputMode.value === 'custom') {
    customHeight.value = Math.round(w / aspectRatio.value)
  }
})

watch(customHeight, h => {
  if (keepAspectRatio.value && outputMode.value === 'custom') {
    customWidth.value = Math.round(h * aspectRatio.value)
  }
})

function normalizeSvgContent(svg: string): string {
  return svg.includes('xmlns=') ? svg : svg.replace(/<svg\b/, '<svg xmlns="http://www.w3.org/2000/svg"')
}

function extractSvgDimensions(svg: string): { width: number, height: number } {
  let width = 300, height = 150
  const viewBox = svg.match(/viewBox=["']([^"']+)["']/)?.[1]?.split(/\s+/).map(Number)
  if (viewBox && viewBox.length === 4) [, , width, height] = viewBox
  const w = parseFloat(svg.match(/width=["']([^"']+)["']/)?.[1] || '')
  const h = parseFloat(svg.match(/height=["']([^"']+)["']/)?.[1] || '')
  return { width: isNaN(w) ? width : w, height: isNaN(h) ? height : h }
}

function renderSvgToCanvas(callback: (canvas: HTMLCanvasElement) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth.value
  canvas.height = targetHeight.value

  const ctx = canvas.getContext('2d')
  if (!ctx || !svgSourceText.value.trim()) return

  ctx.setTransform(1, 0, 0, 1, 0, 0) // 실제 크기 그대로

  const svgContent = normalizeSvgContent(svgSourceText.value)
  const url = URL.createObjectURL(new Blob([svgContent], { type: 'image/svg+xml' }))
  const img = new Image()

  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.filter = invertColor.value ? 'invert(1)' : 'none'
    ctx.drawImage(img, 0, 0, targetWidth.value, targetHeight.value) // 논리적 크기로 그리기
    callback(canvas)
    URL.revokeObjectURL(url)
  }

  img.onerror = () => {
    console.error('SVG 로드 오류')
    URL.revokeObjectURL(url)
  }

  img.src = url
}

function convertSvgToPng(svg: string) {
  const { width, height } = extractSvgDimensions(svg)
  originalWidth.value = width
  originalHeight.value = height
  aspectRatio.value = width / height
  customHeight.value = Math.round(customWidth.value / aspectRatio.value)
  drawToCanvas()
}

function drawToCanvas() {
  renderSvgToCanvas(canvas => {
    const pngUrl = canvas.toDataURL('image/png')
    pngDataUrl.value = pngUrl
    imgTagText.value = `<img src="${pngUrl}" width="${targetWidth.value}" height="${targetHeight.value}" alt="Converted SVG" />`
  })
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file?.name.endsWith('.svg')) {
    const reader = new FileReader()
    reader.onload = () => {
      svgSourceText.value = reader.result as string
      fileName.value = file.name.replace(/\.svg$/i, '')
      convertSvgToPng(svgSourceText.value)
    }
    reader.readAsText(file)
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (file?.name.endsWith('.svg')) {
    const reader = new FileReader()
    reader.onload = () => {
      svgSourceText.value = reader.result as string
      fileName.value = file.name.replace(/\.svg$/i, '')
      convertSvgToPng(svgSourceText.value)
    }
    reader.readAsText(file)
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

function downloadPng() {
  if (pngDataUrl.value) {
    const a = document.createElement('a')
    a.href = pngDataUrl.value
    a.download = `${fileName.value || 'converted'}.png`
    a.click()
    copiedDownload.value = true
    setTimeout(() => copiedDownload.value = false, 3000)
  }
}

function copyImageToClipboard() {
  renderSvgToCanvas(canvas => {
    canvas.toBlob(blob => {
      if (blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(() => {
            copiedClipboard.value = true
            setTimeout(() => copiedClipboard.value = false, 3000)
          })
      }
    }, 'image/png')
  })
}

function copyImgTag() {
  navigator.clipboard.writeText(imgTagText.value).then(() => {
    copiedImgTag.value = true
    setTimeout(() => copiedImgTag.value = false, 3000)
  })
}

watch(svgSourceText, val => {
  if (val.trim().startsWith('<svg')) convertSvgToPng(val)
})

watch([outputMode, scalePercent, customWidth, customHeight, invertColor], () => {
  if (svgSourceText.value && originalWidth.value && originalHeight.value) {
    drawToCanvas()
  }
})

function activateScaleMode() { outputMode.value = 'scale' }
function activateCustomMode() { outputMode.value = 'custom' }
</script>


<template>
  <div class="p-4 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
    <div class="flex flex-col lg:flex-row items-stretch gap-6 w-full">
      <!-- Left Section: SVG Input -->
      <section class="flex flex-col flex-1 space-y-4">
        <h2 class="text-xl font-semibold border-b pb-1">📝 SVG Input</h2>

        <textarea v-model="svgSourceText" rows="6"
          class="w-full p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          placeholder="<svg ...>...</svg>"></textarea>

        <div
          class="border-2 border-dashed rounded p-6 text-center text-gray-500 dark:text-gray-400 dark:border-gray-600"
          @drop="onDrop" @dragover="onDragOver">
          Drag and drop your SVG file here
        </div>

        <input type="file" accept=".svg" @change="onFileChange"
          class="block w-full text-sm file:mr-4 file:px-4 file:py-2 file:border file:rounded file:bg-gray-100 dark:file:bg-gray-700 file:text-sm" />
      </section>

      <!-- Right Section: PNG Output -->
      <section class="flex flex-col flex-1 space-y-4">
        <h2 class="text-xl font-semibold border-b pb-1">📤 PNG Output</h2>

        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input type="radio" v-model="outputMode" value="original" />
            Original ({{ originalWidth }}×{{ originalHeight }})
          </label>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input type="radio" v-model="outputMode" value="scale" />
              Scale
            </label>
            <select @focus="activateScaleMode" v-model.number="scalePercent"
              class="w-24 px-1 py-1 border rounded dark:bg-gray-800 dark:border-gray-600">
              <option v-for="option in scaleOptions" :key="option" :value="option">{{ option }}%</option>
            </select>
            <span>({{ scaleWidth }}×{{ scaleHeight }})</span>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <label class="flex items-center gap-2">
              <input type="radio" v-model="outputMode" value="custom" />
              Custom size
            </label>
            <div class="flex items-center">
              <input type="number" @focus="activateCustomMode" v-model.number="customWidth" min="1"
                class="w-20 px-1 border rounded dark:bg-gray-800 dark:border-gray-600" />
              <span class="mx-1">×</span>
              <input type="number" @focus="activateCustomMode" v-model.number="customHeight" min="1"
                class="w-20 px-1 border rounded dark:bg-gray-800 dark:border-gray-600" />
            </div>
            <label class="flex items-center gap-2">
              <input type="checkbox" @focus="activateCustomMode" v-model="keepAspectRatio" />
              Keep aspect ratio
            </label>
          </div>

          <hr>
          <label class="flex items-center gap-3">
            <span>🌓 Invert</span>
            <button @click="invertColor = !invertColor" type="button"
              :class="['relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none', invertColor ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600']">
              <span
                :class="['inline-block w-4 h-4 transform bg-white rounded-full transition-transform', invertColor ? 'translate-x-6' : 'translate-x-1']"></span>
            </button>
          </label>
        </div>

        <!-- Preview -->
        <div v-if="pngDataUrl">
          <div>
            <div class="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3 class="font-semibold m-0">📷 Preview</h3>
              <button @click="copyImageToClipboard"
                class="text-xs px-2 py-0.5 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600">
                {{ copiedClipboard ? '✔ Copied!' : '📋 Copy' }}
              </button>
              <button @click="downloadPng"
                class="text-xs px-2 py-0.5 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600">
                {{ copiedDownload ? '✔ Downloaded!' : '⬇ Download' }}
              </button>
              <label class="flex items-center gap-1 text-sm">
                Filename
                <input v-model="fileName" type="text" placeholder="converted"
                  class="w-40 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100" />
              </label>
            </div>
            <div class="inline-block overflow-hidden rounded border shadow bg-checkerboard">
              <img :src="pngDataUrl" :width="targetWidth" :height="targetHeight" alt="PNG Preview" />
            </div>
          </div>
        </div>

        <!-- <img> Tag -->
        <div v-if="pngDataUrl">
          <div class="flex items-baseline gap-2 mb-1 flex-wrap">
            <h3 class="font-semibold m-0">🧾 &lt;img&gt; Tag (Base64)</h3>
            <button @click="copyImgTag"
              class="text-xs px-2 py-0.5 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600">
              {{ copiedImgTag ? '✔ Copied!' : '📋 Copy' }}
            </button>
          </div>
          <textarea v-model="imgTagText" rows="4" readonly
            class="w-full p-2 border rounded font-mono text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"></textarea>
        </div>
      </section>
    </div>
  </div>
</template>


<style>
.bg-checkerboard {
  background-color: white;
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
    linear-gradient(45deg, #ccc 25%, white 25%, white 75%, #ccc 75%, #ccc);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}
</style>
