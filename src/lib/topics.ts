export type Topic =
  | 'search'
  | 'prolog'
  | 'genetic'
  | 'selection'
  | 'pso'
  | 'aco'
  | 'esArchitecture'
  | 'expertSystem'
  | 'dss'
  | 'knn'
  | 'naiveBayes'
  | 'logreg'
  | 'linreg'
  | 'kmeans'
  | 'qlearning'

export type CategoryId =
  | 'search'
  | 'population'
  | 'logic'
  | 'expert'
  | 'classification'
  | 'regression'
  | 'clustering'
  | 'reinforcement'

export interface TopicCategory {
  id: CategoryId
  labelKey: string
  topics: Topic[]
  /** Planned topics, shown disabled so students see where they will appear. */
  upcomingKeys?: string[]
}

/**
 * Topics grouped by the family of AI technique they belong to, in course
 * order. Grouping tells students what kind of problem a topic solves before
 * they open it (e.g. KNN and Naïve Bayes are both classifiers).
 */
export const topicCategories: TopicCategory[] = [
  { id: 'search', labelKey: 'categories.search', topics: ['search'] },
  { id: 'population', labelKey: 'categories.population', topics: ['genetic', 'selection', 'pso', 'aco'] },
  {
    id: 'logic',
    labelKey: 'categories.logic',
    topics: ['prolog'],
    upcomingKeys: ['topics.propositional', 'topics.firstOrder'],
  },
  { id: 'expert', labelKey: 'categories.expert', topics: ['esArchitecture', 'expertSystem', 'dss'] },
  { id: 'classification', labelKey: 'categories.classification', topics: ['knn', 'naiveBayes', 'logreg'] },
  { id: 'regression', labelKey: 'categories.regression', topics: ['linreg'] },
  { id: 'clustering', labelKey: 'categories.clustering', topics: ['kmeans'] },
  { id: 'reinforcement', labelKey: 'categories.reinforcement', topics: ['qlearning'] },
]

export const allTopics: Topic[] = topicCategories.flatMap((c) => c.topics)

export function isTopic(value: string): value is Topic {
  return (allTopics as string[]).includes(value)
}

export function topicLabelKey(topic: Topic): string {
  return `topics.${topic}`
}
