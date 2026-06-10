export type Channel = 'WhatsApp' | 'Gmail' | 'Slack' | 'MS Teams' | 'Asana' | 'Notion' | 'Manual'

export type DueStatus = 'Overdue' | 'Today' | 'Tomorrow' | 'This week' | 'Done'

export type AppMode = 'personal' | 'team'

export interface Commitment {
  id: string
  text: string
  channel: Channel
  due: DueStatus
  done: boolean
  person?: string
  createdAt: Date
  updatedAt: Date
}

export interface JiraIssue {
  id: string
  key: string
  summary: string
  status: string
  issueType: string
  priority: string
  assignee?: string
}

export interface SprintSummary {
  topPriorities: string[]
  blockers: string[]
  stalledWork: string[]
  nextActions: string[]
  rawAnalysis: string
}

export interface MetricPoint {
  name: string
  current: number
  previous: number
  unit?: string
}

export interface AnomalyReport {
  healthScore: number
  summary: string
  anomalies: {
    metric: string
    severity: 'CRITICAL' | 'WARNING' | 'POSITIVE'
    change: number
    cause: string
    action: string
  }[]
}

export interface DraftedTicket {
  title: string
  issueType: string
  priority: string
  priorityReason: string
  description: string
  acceptanceCriteria: string[]
}

export interface DigestSection {
  title: string
  content: string
  type: 'ai' | 'stats' | 'channels' | 'priority'
}
