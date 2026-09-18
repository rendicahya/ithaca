import type { Topic } from '@/components/layout/Sidebar.svelte'

const STORAGE_KEY = 'ithaca-last-topic'
const VALID_TOPICS: Topic[] = ['search', 'prolog', 'genetic', 'pso', 'aco', 'naiveBayes']

function isTopic(value: string): value is Topic {
  return (VALID_TOPICS as string[]).includes(value)
}

/** Remembers which topic the lecturer last had open, so reopening Ithaca resumes there. */
class LastTopicStore {
  topic = $state<Topic>('search')

  constructor() {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isTopic(stored)) this.topic = stored
  }

  set = (topic: Topic): void => {
    this.topic = topic
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, topic)
  }
}

export const lastTopicStore = new LastTopicStore()
