<!-- GptView.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useHistoryStore, type HistoryType } from '@/stores/history'
import HistoryModal from './HistoryModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import { mdiRobotOutline, mdiThermometer, mdiContentSaveOutline } from '@mdi/js'

// ========== 상태 ==========
const availableModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o']
const selectedModel = useLocalStorage('gpt-model', 'gpt-3.5-turbo')
const temperature = ref(0.7)
const persist = useLocalStorage<boolean>('gpt-persist', false)
const apiKey = ref('')
const script = ref('')
const documentCount = ref(2)
const documents = ref<string[]>([])
const isLoading = ref(false)
const result = ref('')

const showPersistConfirm = ref(false)
const showHistoryModal = ref(false)
const historyType = ref<HistoryType | null>(null)

const historyStore = useHistoryStore()

// ========== 상수 ==========
const types = ['key', 'script', 'docs'] as const
const typeLabels: Record<HistoryType, string> = {
  key: 'OPENAPI KEY',
  script: 'Script',
  docs: '문서',
  result: '결과',
}

// ========== Computed ==========
const counts = computed(() => ({
  key: historyStore.key.length,
  script: historyStore.script.length,
  docs: historyStore.docs.length,
  result: historyStore.result.length,
}))


const currentHistory = computed(() => {
  return historyType.value ? historyStore[historyType.value] : []
})

// ========== Watch ==========
watch(documentCount, (newCount) => {
  while (documents.value.length < newCount) documents.value.push('')
  while (documents.value.length > newCount) documents.value.pop()
})

watch(persist, (newVal, oldVal) => {
  if (newVal && !oldVal) showPersistConfirm.value = true
})

// ========== 함수 ==========
function formatDocuments() {
  return documents.value.map((doc, i) => `-- 문서 ${i + 1} --\n${doc}`).join('\n\n')
}

async function run() {
  isLoading.value = true
  result.value = ''

  const prompt = `${script.value}\n\n${formatDocuments()}`
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.value.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel.value,
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature.value
      }),
    })

    const data = await res.json()
    result.value = data.choices?.[0]?.message?.content || '[응답 없음]'
  } catch (e) {
    result.value = `[에러 발생: ${e instanceof Error ? e.message : String(e)}]`
  } finally {
    isLoading.value = false
    if (persist.value) historyStore.saveAll({ apiKey, script, documents, result })
  }
}

function openHistory(type: HistoryType) {
  if (counts.value[type] > 0) {
    historyType.value = type
    showHistoryModal.value = true
  }
}

function closeHistory() {
  historyType.value = null
  showHistoryModal.value = false
}

function applyHistory(val: string, type: HistoryType) {
  historyStore.apply(type, val, { apiKey, script, documents, documentCount, result })
  closeHistory()
}

function deleteHistory(index: number, type: HistoryType) {
  historyStore.remove(type, index)
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    console.error('복사 실패:', e)
  }
}

// ========== 초기 로딩 ==========
onMounted(() => {
  if (persist.value) {
    apiKey.value = historyStore.latest('key') ?? ''
    script.value = historyStore.latest('script') ?? ''
    result.value = historyStore.latest('result') ?? ''

    const lastDocs = historyStore.latest('docs')
    if (lastDocs) {
      try {
        const parsed = JSON.parse(lastDocs)
        if (Array.isArray(parsed)) {
          documents.value = parsed
          documentCount.value = parsed.length
        }
      } catch (e) {
        console.warn('문서 불러오기 실패:', e)
      }
    }
  }

  while (documents.value.length < documentCount.value) documents.value.push('')
  while (documents.value.length > documentCount.value) documents.value.pop()
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 space-y-6">
    <div v-for="type in types" :key="type">
      <div class="flex justify-between items-center mb-1">
        <label class="font-medium dark:text-white">{{ typeLabels[type] }}</label>
        <div class="flex gap-2">
          <BaseButton :disabled="counts[type] === 0" @click="openHistory(type)">
            히스토리 ({{ counts[type] }})
          </BaseButton>
          <BaseButton
            @click="copy(type === 'key' ? apiKey : type === 'script' ? script : type === 'docs' ? formatDocuments() : result)">
            복사
          </BaseButton>
        </div>
      </div>

      <div v-if="type === 'key'">
        <input v-model="apiKey"
          class="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="sk-..." />
      </div>

      <div v-else-if="type === 'script'">
        <textarea v-model="script"
          class="border rounded w-full h-24 p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="스크립트를 입력하세요..."></textarea>
      </div>

      <div v-else-if="type === 'docs'">
        <div class="mb-2">
          <label class="font-medium dark:text-white">문서 수:</label>
          <select v-model="documentCount"
            class="border rounded p-1 ml-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <div v-for="(doc, index) in documents" :key="index" class="mb-2">
          <div class="flex justify-between items-center">
            <label class="dark:text-white">문서 {{ index + 1 }}</label>
            <BaseButton @click="copy(doc)">복사</BaseButton>
          </div>
          <textarea v-model="documents[index]"
            class="border rounded w-full h-24 p-2 mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="문서 내용을 입력하세요..."></textarea>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-4 my-4">
      <!-- 실행 버튼 -->
      <BaseButton size="md" variant="primary" @click="run" :disabled="isLoading">
        <span v-if="isLoading">실행 중...</span>
        <span v-else>실행</span>
      </BaseButton>

      <!-- 모델 선택 -->
      <div class="flex items-center gap-2">
        <BaseIcon :path="mdiRobotOutline" class="w-5 h-5"/>
        <select v-model="selectedModel"
          class="border rounded p-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white w-full max-w-xs">
          <option v-for="model in availableModels" :key="model" :value="model">{{ model }}</option>
        </select>
      </div>

      <!-- Temperature 선택 -->
      <div class="flex items-center gap-2">
        <BaseIcon :path="mdiThermometer" class="w-5 h-5" />
        <select id="temperature" v-model.number="temperature"
          class="border rounded p-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
          <option v-for="n in 11" :key="n" :value="(n - 1) / 10">
            {{ ((n - 1) / 10).toFixed(1) }}
          </option>
        </select>
      </div>

      <!-- 로컬스토리지 저장 여부 -->
      <div class="flex items-center gap-2">
        <BaseIcon :path="mdiContentSaveOutline" class="w-5 h-5" />
        <select v-model="persist" class="border rounded p-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
          <option :value="false">저장 안함</option>
          <option :value="true">저장함</option>
        </select>
      </div>
    </div>

    <div class="flex justify-between items-center mb-1">
      <label class="font-medium dark:text-white">결과</label>
      <div class="flex gap-2">
        <BaseButton :disabled="counts.result === 0" @click="openHistory('result')">
          히스토리 ({{ counts.result }})
        </BaseButton>
        <BaseButton @click="copy(result)">복사</BaseButton>
      </div>
    </div>

    <textarea v-model="result"
      class="border rounded w-full h-48 p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white" readonly
      placeholder="결과가 여기에 표시됩니다..."></textarea>

    <HistoryModal v-if="showHistoryModal && historyType" :title="{
      key: '🔑 API Key',
      script: '📜 Script',
      docs: '📄 문서',
      result: '📊 결과',
    }[historyType!]" :entries="currentHistory" :onApply="(val) => applyHistory(val.value, historyType!)"
      :onDelete="(i) => deleteHistory(i, historyType!)" :onClose="closeHistory" />

    <ConfirmModal :show="showPersistConfirm" :onCancel="() => { persist = false; showPersistConfirm = false }"
      :onConfirm="() => { showPersistConfirm = false }" />
  </div>
</template>
