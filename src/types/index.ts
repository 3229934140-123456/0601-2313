export type MemberLevel = '普通' | '银卡' | '金卡' | '钻石' | '钻石卡'

export interface Member {
  id: string
  name: string
  memberNo: string
  level: MemberLevel
  balance: number
  avatar: string
  phone: string
}

export interface Coupon {
  id: string
  memberId: string
  name: string
  discount: number
  type: '满减' | '折扣' | '立减' | '体验券'
  expireAt: string
  used: boolean
  minAmount?: number
  discountPercent?: number
}

export type VenueType = 'basketball' | 'badminton' | 'swimming' | '篮球' | '羽毛球' | '游泳'
export type VenueStatus = '开放' | '维护' | '关闭' | '正常'

export interface Venue {
  id: string
  name: string
  type: VenueType
  icon: string
  status: VenueStatus
  description?: string
}

export interface Court {
  id: string
  venueId: string
  name: string
  pricePerHour: number
  facilities: string | string[]
  capacity: number
}

export type SlotStatus = 'free' | 'busy' | 'full' | '空闲' | '繁忙' | '已满'

export interface TimeSlot {
  id: string
  courtId: string
  date: string
  startTime: string
  endTime: string
  status: SlotStatus
  capacity: number
  bookedCount?: number
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'checked_in' | '待使用' | '已完成' | '已取消' | '已入场'
export type PayStatus = 'unpaid' | 'paid' | 'refunded' | '未支付' | '已支付' | '已退款'

export interface Booking {
  id: string
  memberId: string
  courtId: string
  slotId?: string
  slotIds?: string[]
  status: BookingStatus
  peopleCount: number
  totalAmount: number
  discount: number
  payAmount: number
  payStatus: PayStatus
  entryCode: string | null
  createdAt: string
  venueName?: string
  courtName?: string
  date?: string
  startTime?: string
  endTime?: string
  timeRange?: string
}

export interface Coach {
  id: string
  name: string
  avatar: string
  specialty: string
  experience: number
  rating: number
  description?: string
}

export interface Course {
  id: string
  name: string
  coachId: string
  venueType: VenueType
  startTime: string
  duration: number
  capacity: number
  enrolled: number
  price: number
  description?: string
  level?: string
}

export interface Enrollment {
  id: string
  memberId: string
  courseId: string
  status: string
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: string
  targetVenues: string[]
  publishAt: string
  expireAt: string
  pinned?: boolean
}

export interface Feedback {
  id: string
  memberId: string
  memberName?: string
  type: string
  rating: number
  content: string
  createdAt: string
  reply?: string
}
