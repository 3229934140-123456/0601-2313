import { create } from 'zustand'
import type { Feedback } from '../types'
import { feedbacks as initialFeedbacks } from '../data/announcements'

export interface RepairOrder {
  id: string
  memberId: string
  memberName?: string
  venueId: string
  venueName: string
  faultTypes: string[]
  location: string
  description: string
  phone: string
  urgency: number
  status: '已提交' | '处理中' | '已完成'
  stage: number
  createdAt: string
}

interface FeedbackState {
  feedbacks: Feedback[]
  repairOrders: RepairOrder[]
  addFeedback: (fb: Omit<Feedback, 'id' | 'createdAt'>) => Feedback
  addRepairOrder: (order: Omit<RepairOrder, 'id' | 'status' | 'stage' | 'createdAt'>) => RepairOrder
  getRepairOrdersByMember: (memberId: string) => RepairOrder[]
  getFeedbacks: () => Feedback[]
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedbacks: [...initialFeedbacks],
  repairOrders: [
    {
      id: 'BX245821',
      memberId: 'm1',
      memberName: '张伟',
      venueId: 'v2',
      venueName: '羽毛球馆·灯光',
      faultTypes: ['灯光'],
      location: '3号场地',
      description: '场地灯光闪烁',
      phone: '13800138000',
      urgency: 1,
      status: '处理中',
      stage: 2,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'BX245789',
      memberId: 'm2',
      memberName: '李娜',
      venueId: 'v1',
      venueName: '篮球馆·地面',
      faultTypes: ['地面'],
      location: '2号场地东北角',
      description: '地面有水渍未清理',
      phone: '13900139000',
      urgency: 0,
      status: '已完成',
      stage: 4,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'BX245673',
      memberId: 'm3',
      memberName: '王强',
      venueId: 'v3',
      venueName: '游泳馆·淋浴',
      faultTypes: ['淋浴'],
      location: '3号淋浴间',
      description: '花洒出水小',
      phone: '13700137000',
      urgency: 0,
      status: '已完成',
      stage: 4,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],

  addFeedback: (fb) => {
    const newFb: Feedback = {
      ...fb,
      id: `f${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ feedbacks: [newFb, ...state.feedbacks] }))
    return newFb
  },

  addRepairOrder: (order) => {
    const newOrder: RepairOrder = {
      ...order,
      id: `BX${Date.now().toString().slice(-6)}`,
      status: '已提交',
      stage: 1,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ repairOrders: [newOrder, ...state.repairOrders] }))
    return newOrder
  },

  getRepairOrdersByMember: (memberId: string) => {
    return get().repairOrders.filter((r) => r.memberId === memberId)
  },

  getFeedbacks: () => {
    return get().feedbacks
  },
}))
