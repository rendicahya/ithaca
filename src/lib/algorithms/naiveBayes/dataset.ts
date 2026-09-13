export interface NBExample {
  outlook: string
  temperature: string
  humidity: string
  wind: string
  play: string
}

export const featureNames = ['outlook', 'temperature', 'humidity', 'wind'] as const
export type FeatureName = (typeof featureNames)[number]

/**
 * The classic "Play Tennis" dataset (Mitchell, Machine Learning). Chosen
 * because it is a standard AI-course example, small enough for a projector,
 * and its usual query (Sunny, Cool, High, Strong) has no zero counts, so the
 * demonstration needs no smoothing to stay meaningful.
 */
export const playTennisDataset: NBExample[] = [
  { outlook: 'Sunny', temperature: 'Hot', humidity: 'High', wind: 'Weak', play: 'No' },
  { outlook: 'Sunny', temperature: 'Hot', humidity: 'High', wind: 'Strong', play: 'No' },
  { outlook: 'Overcast', temperature: 'Hot', humidity: 'High', wind: 'Weak', play: 'Yes' },
  { outlook: 'Rain', temperature: 'Mild', humidity: 'High', wind: 'Weak', play: 'Yes' },
  { outlook: 'Rain', temperature: 'Cool', humidity: 'Normal', wind: 'Weak', play: 'Yes' },
  { outlook: 'Rain', temperature: 'Cool', humidity: 'Normal', wind: 'Strong', play: 'No' },
  { outlook: 'Overcast', temperature: 'Cool', humidity: 'Normal', wind: 'Strong', play: 'Yes' },
  { outlook: 'Sunny', temperature: 'Mild', humidity: 'High', wind: 'Weak', play: 'No' },
  { outlook: 'Sunny', temperature: 'Cool', humidity: 'Normal', wind: 'Weak', play: 'Yes' },
  { outlook: 'Rain', temperature: 'Mild', humidity: 'Normal', wind: 'Weak', play: 'Yes' },
  { outlook: 'Sunny', temperature: 'Mild', humidity: 'Normal', wind: 'Strong', play: 'Yes' },
  { outlook: 'Overcast', temperature: 'Mild', humidity: 'High', wind: 'Strong', play: 'Yes' },
  { outlook: 'Overcast', temperature: 'Hot', humidity: 'Normal', wind: 'Weak', play: 'Yes' },
  { outlook: 'Rain', temperature: 'Mild', humidity: 'High', wind: 'Strong', play: 'No' },
]

export const classNames: string[] = ['Yes', 'No']

export const defaultQuery: Record<FeatureName, string> = {
  outlook: 'Sunny',
  temperature: 'Cool',
  humidity: 'High',
  wind: 'Strong',
}
