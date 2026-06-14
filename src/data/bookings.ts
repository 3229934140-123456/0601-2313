import type { Booking } from '../types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const dateStr = formatDate(today);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = formatDate(yesterday);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
const dayAfterTomorrowStr = formatDate(dayAfterTomorrow);

export const bookings: Booking[] = [
  {
    id: 'b1',
    memberId: 'm1',
    courtId: 'c1',
    slotIds: ['c1-' + dateStr + '-19', 'c1-' + dateStr + '-20'],
    status: 'confirmed',
    peopleCount: 8,
    totalAmount: 240,
    discount: 50,
    payAmount: 190,
    payStatus: 'paid',
    entryCode: 'SV8A2K9P',
    createdAt: '2026-06-14T15:30:00Z',
    venueName: '篮球馆',
    courtName: '篮球场地1号',
    date: dateStr,
    timeRange: '19:00 - 21:00'
  },
  {
    id: 'b2',
    memberId: 'm2',
    courtId: 'c8',
    slotIds: ['c8-' + dateStr + '-18'],
    status: 'pending',
    peopleCount: 4,
    totalAmount: 50,
    discount: 0,
    payAmount: 50,
    payStatus: 'unpaid',
    entryCode: '',
    createdAt: '2026-06-15T09:20:00Z',
    venueName: '羽毛球馆',
    courtName: '羽毛球场地1号',
    date: dateStr,
    timeRange: '18:00 - 19:00'
  },
  {
    id: 'b3',
    memberId: 'm3',
    courtId: 'c15',
    slotIds: ['c15-' + yesterdayStr + '-10', 'c15-' + yesterdayStr + '-11'],
    status: 'completed',
    peopleCount: 3,
    totalAmount: 80,
    discount: 10,
    payAmount: 70,
    payStatus: 'paid',
    entryCode: 'SW3B5H7X',
    createdAt: '2026-06-13T14:10:00Z',
    venueName: '游泳馆',
    courtName: '标准泳道1',
    date: yesterdayStr,
    timeRange: '10:00 - 12:00'
  },
  {
    id: 'b4',
    memberId: 'm1',
    courtId: 'c12',
    slotIds: ['c12-' + tomorrowStr + '-19', 'c12-' + tomorrowStr + '-20', 'c12-' + tomorrowStr + '-21'],
    status: 'confirmed',
    peopleCount: 6,
    totalAmount: 180,
    discount: 30,
    payAmount: 150,
    payStatus: 'paid',
    entryCode: 'BM7C9E2L',
    createdAt: '2026-06-14T20:45:00Z',
    venueName: '羽毛球馆',
    courtName: '羽毛球场地6号',
    date: tomorrowStr,
    timeRange: '19:00 - 22:00'
  },
  {
    id: 'b5',
    memberId: 'm4',
    courtId: 'c5',
    slotIds: ['c5-' + dateStr + '-15'],
    status: 'cancelled',
    peopleCount: 5,
    totalAmount: 80,
    discount: 0,
    payAmount: 80,
    payStatus: 'refunded',
    entryCode: '',
    createdAt: '2026-06-15T08:00:00Z',
    venueName: '篮球馆',
    courtName: '篮球场地5号',
    date: dateStr,
    timeRange: '15:00 - 16:00'
  },
  {
    id: 'b6',
    memberId: 'm2',
    courtId: 'c21',
    slotIds: ['c21-' + dayAfterTomorrowStr + '-14', 'c21-' + dayAfterTomorrowStr + '-15'],
    status: 'confirmed',
    peopleCount: 3,
    totalAmount: 160,
    discount: 40,
    payAmount: 120,
    payStatus: 'paid',
    entryCode: 'VIP4M8Q1',
    createdAt: '2026-06-15T10:30:00Z',
    venueName: '游泳馆',
    courtName: 'VIP泳道',
    date: dayAfterTomorrowStr,
    timeRange: '14:00 - 16:00'
  },
  {
    id: 'b7',
    memberId: 'm5',
    courtId: 'c3',
    slotIds: ['c3-' + yesterdayStr + '-18', 'c3-' + yesterdayStr + '-19'],
    status: 'completed',
    peopleCount: 10,
    totalAmount: 200,
    discount: 20,
    payAmount: 180,
    payStatus: 'paid',
    entryCode: 'BK9D4F6T',
    createdAt: '2026-06-12T16:20:00Z',
    venueName: '篮球馆',
    courtName: '篮球场地3号',
    date: yesterdayStr,
    timeRange: '18:00 - 20:00'
  },
  {
    id: 'b8',
    memberId: 'm3',
    courtId: 'c10',
    slotIds: ['c10-' + dateStr + '-21'],
    status: 'pending',
    peopleCount: 2,
    totalAmount: 50,
    discount: 10,
    payAmount: 40,
    payStatus: 'unpaid',
    entryCode: '',
    createdAt: '2026-06-15T11:00:00Z',
    venueName: '羽毛球馆',
    courtName: '羽毛球场地3号',
    date: dateStr,
    timeRange: '21:00 - 22:00'
  },
  {
    id: 'b9',
    memberId: 'm5',
    courtId: 'c19',
    slotIds: ['c19-' + tomorrowStr + '-09', 'c19-' + tomorrowStr + '-10', 'c19-' + tomorrowStr + '-11'],
    status: 'confirmed',
    peopleCount: 8,
    totalAmount: 105,
    discount: 15,
    payAmount: 90,
    payStatus: 'paid',
    entryCode: 'SW2N7R3Y',
    createdAt: '2026-06-14T19:15:00Z',
    venueName: '游泳馆',
    courtName: '慢泳道',
    date: tomorrowStr,
    timeRange: '09:00 - 12:00'
  },
  {
    id: 'b10',
    memberId: 'm4',
    courtId: 'c14',
    slotIds: ['c14-' + dayAfterTomorrowStr + '-19'],
    status: 'pending',
    peopleCount: 4,
    totalAmount: 100,
    discount: 0,
    payAmount: 100,
    payStatus: 'unpaid',
    entryCode: '',
    createdAt: '2026-06-15T12:40:00Z',
    venueName: '羽毛球馆',
    courtName: '羽毛球VIP场地',
    date: dayAfterTomorrowStr,
    timeRange: '19:00 - 20:00'
  }
];

export const getBookingsByMember = (memberId: string) => bookings.filter(b => b.memberId === memberId);
export const getBookingById = (id: string) => bookings.find(b => b.id === id);
