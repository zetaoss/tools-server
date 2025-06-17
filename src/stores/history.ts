// stores/history.ts
import { defineStore } from 'pinia'
import { type Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export type EntryWithTimestamp = {
  value: string
  timestamp: number
}

export type HistoryType = 'key' | 'script' | 'docs' | 'result'

export const useHistoryStore = defineStore('history', () => {
  const store = {
    key: useLocalStorage<EntryWithTimestamp[]>('gpt-apiKey-history', []),
    script: useLocalStorage<EntryWithTimestamp[]>('gpt-script-history', []),
    docs: useLocalStorage<EntryWithTimestamp[]>('gpt-documents-history', []),
    result: useLocalStorage<EntryWithTimestamp[]>('gpt-result-history', []),
  }


  const sanitizeTimestamps = () => {
    const now = Date.now()
    for (const type of ['key', 'script', 'docs', 'result'] as HistoryType[]) {
      store[type].value.forEach((entry) => {
        if (!entry.timestamp || isNaN(new Date(entry.timestamp).getTime())) {
          entry.timestamp = now
        }
      })
    }
  }

  sanitizeTimestamps()

  const update = (type: HistoryType, value: string) => {
    const target = store[type]
    const existing = target.value.find((e) => e.value === value)

    if (existing) {
      existing.timestamp = Date.now() // ✅ timestamp 갱신
    } else {
      target.value.push({ value, timestamp: Date.now() }) // ✅ 새 항목 추가
    }
  }

  const remove = (type: HistoryType, index: number) => {
    store[type].value.splice(index, 1)
  }

  const latest = (type: HistoryType): string | null => {
    return store[type].value.at(-1)?.value ?? null
  }

  const apply = (
    type: HistoryType,
    value: string,
    context: {
      apiKey: Ref<string>,
      script: Ref<string>,
      documents: Ref<string[]>,
      documentCount: Ref<number>,
      result: Ref<string>
    }
  ) => {
    switch (type) {
      case 'key':
        context.apiKey.value = value
        break
      case 'script':
        context.script.value = value
        break
      case 'docs':
        try {
          const parsed = JSON.parse(value)
          if (Array.isArray(parsed)) {
            context.documents.value = parsed
            context.documentCount.value = parsed.length
          }
        } catch (e) {
          console.warn('문서 파싱 실패:', e)
        }
        break
      case 'result':
        context.result.value = value
        break
    }
  }

  const saveAll = (
    context: {
      apiKey: Ref<string>,
      script: Ref<string>,
      documents: Ref<string[]>,
      result: Ref<string>
    }
  ) => {
    update('key', context.apiKey.value)
    update('script', context.script.value)
    update('docs', JSON.stringify(context.documents.value))
    update('result', context.result.value)
  }

  return { ...store, update, remove, latest, apply, saveAll }
})
