import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppMode, Commitment, Channel, DueStatus } from '@/types'

interface AppStore {
  mode: AppMode
  setMode: (mode: AppMode) => void

  commitments: Commitment[]
  addCommitment: (text: string, channel: Channel, due: DueStatus, person?: string) => void
  toggleCommitment: (id: string) => void
  deleteCommitment: (id: string) => void
  updateCommitment: (id: string, updates: Partial<Commitment>) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      mode: 'personal',
      setMode: (mode) => set({ mode }),

      commitments: [
        {
          id: '1',
          text: 'Send revised proposal to Raj by end of day',
          channel: 'WhatsApp',
          due: 'Overdue',
          done: false,
          person: 'Raj',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          text: 'Share sprint retrospective notes with Priya',
          channel: 'Slack',
          due: 'Today',
          done: false,
          person: 'Priya',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          text: 'Follow up on investor intro from Ankit',
          channel: 'Gmail',
          due: 'Today',
          done: false,
          person: 'Ankit',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          text: "Review Neha's design mockups and give feedback",
          channel: 'WhatsApp',
          due: 'This week',
          done: false,
          person: 'Neha',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],

      addCommitment: (text, channel, due, person) =>
        set((state) => ({
          commitments: [
            {
              id: crypto.randomUUID(),
              text,
              channel,
              due,
              done: false,
              person,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            ...state.commitments,
          ],
        })),

      toggleCommitment: (id) =>
        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id ? { ...c, done: !c.done, updatedAt: new Date() } : c
          ),
        })),

      deleteCommitment: (id) =>
        set((state) => ({
          commitments: state.commitments.filter((c) => c.id !== id),
        })),

      updateCommitment: (id, updates) =>
        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        })),
    }),
    { name: 'pm-copilot-store' }
  )
)
