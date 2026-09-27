import { geneticPseudocode, runGA } from './engine'
import { knapsackConfig } from './problems/knapsack'
import { routeConfig } from './problems/route'
import type { GAExampleId, GAStep } from './types'

export { geneticPseudocode }

export interface GAExample {
  id: GAExampleId
  nameKey: string
}

export const gaExamples: GAExample[] = [
  { id: 'knapsack', nameKey: 'genetic.example.knapsack.name' },
  { id: 'route', nameKey: 'genetic.example.route.name' },
]

export function runGeneticAlgorithm(exampleId: GAExampleId = 'knapsack'): GAStep[] {
  switch (exampleId) {
    case 'knapsack':
      return runGA(knapsackConfig)
    case 'route':
      return runGA(routeConfig)
  }
}
