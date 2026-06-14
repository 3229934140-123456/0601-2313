import type { Venue, Court, TimeSlot, SlotStatus } from '../types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const dateStr = formatDate(today);

export const venues: Venue[] = [
  {
    id: 'v1',
    name: '篮球馆',
    type: 'basketball',
    icon: '🏀',
    status: '正常',
    description: '专业室内篮球场，国际标准木地板，可容纳50人观赛'
  },
  {
    id: 'v2',
    name: '羽毛球馆',
    type: 'badminton',
    icon: '🏸',
    status: '正常',
    description: '专业羽毛球场地，PU塑胶地板，防眩目照明系统'
  },
  {
    id: 'v3',
    name: '游泳馆',
    type: 'swimming',
    icon: '🏊',
    status: '正常',
    description: '恒温泳池，25米标准泳道，配备专业救生员'
  }
];

export const courts: Court[] = [
  { id: 'c1', venueId: 'v1', name: '篮球场地1号', pricePerHour: 120, facilities: '标准篮架、计分牌、休息座椅', capacity: 12 },
  { id: 'c2', venueId: 'v1', name: '篮球场地2号', pricePerHour: 120, facilities: '标准篮架、计分牌、休息座椅', capacity: 12 },
  { id: 'c3', venueId: 'v1', name: '篮球场地3号', pricePerHour: 100, facilities: '标准篮架、休息座椅', capacity: 12 },
  { id: 'c4', venueId: 'v1', name: '篮球场地4号', pricePerHour: 100, facilities: '标准篮架、休息座椅', capacity: 12 },
  { id: 'c5', venueId: 'v1', name: '篮球场地5号', pricePerHour: 80, facilities: '休闲篮架、休息座椅', capacity: 10 },
  { id: 'c6', venueId: 'v1', name: '篮球场地6号', pricePerHour: 80, facilities: '休闲篮架、休息座椅', capacity: 10 },
  { id: 'c7', venueId: 'v1', name: '篮球VIP场地', pricePerHour: 200, facilities: '专业篮架、VIP休息室、饮水供应', capacity: 15 },

  { id: 'c8', venueId: 'v2', name: '羽毛球场地1号', pricePerHour: 50, facilities: '专业地胶、灯光系统', capacity: 4 },
  { id: 'c9', venueId: 'v2', name: '羽毛球场地2号', pricePerHour: 50, facilities: '专业地胶、灯光系统', capacity: 4 },
  { id: 'c10', venueId: 'v2', name: '羽毛球场地3号', pricePerHour: 50, facilities: '专业地胶、灯光系统', capacity: 4 },
  { id: 'c11', venueId: 'v2', name: '羽毛球场地4号', pricePerHour: 50, facilities: '专业地胶、灯光系统', capacity: 4 },
  { id: 'c12', venueId: 'v2', name: '羽毛球场地5号', pricePerHour: 60, facilities: '专业地胶、VIP灯光、休息区', capacity: 4 },
  { id: 'c13', venueId: 'v2', name: '羽毛球场地6号', pricePerHour: 60, facilities: '专业地胶、VIP灯光、休息区', capacity: 4 },
  { id: 'c14', venueId: 'v2', name: '羽毛球VIP场地', pricePerHour: 100, facilities: '专业地胶、独立休息室、免费饮水', capacity: 6 },

  { id: 'c15', venueId: 'v3', name: '标准泳道1', pricePerHour: 40, facilities: '25米泳道、救生员', capacity: 8 },
  { id: 'c16', venueId: 'v3', name: '标准泳道2', pricePerHour: 40, facilities: '25米泳道、救生员', capacity: 8 },
  { id: 'c17', venueId: 'v3', name: '标准泳道3', pricePerHour: 40, facilities: '25米泳道、救生员', capacity: 8 },
  { id: 'c18', venueId: 'v3', name: '标准泳道4', pricePerHour: 40, facilities: '25米泳道、救生员', capacity: 8 },
  { id: 'c19', venueId: 'v3', name: '慢泳道', pricePerHour: 35, facilities: '初学者泳道、浮板', capacity: 10 },
  { id: 'c20', venueId: 'v3', name: '儿童戏水区', pricePerHour: 30, facilities: '浅水区域、儿童设施', capacity: 15 },
  { id: 'c21', venueId: 'v3', name: 'VIP泳道', pricePerHour: 80, facilities: '专属泳道、独立更衣室', capacity: 4 }
];

const generateTimeSlots = (courtId: string, date: string, statusPattern: SlotStatus[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let i = 9; i < 22; i++) {
    const hour = i.toString().padStart(2, '0');
    const endHour = (i + 1).toString().padStart(2, '0');
    const idx = i - 9;
    const status = statusPattern[idx] || 'free';
    slots.push({
      id: `${courtId}-${date}-${hour}`,
      courtId,
      date,
      startTime: `${hour}:00`,
      endTime: `${endHour}:00`,
      status,
      capacity: 10,
      bookedCount: status === 'free' ? 0 : status === 'busy' ? 5 : 10
    });
  }
  return slots;
};

const patterns: SlotStatus[][] = [
  ['free','free','free','busy','busy','free','free','busy','full','full','busy','free','free'],
  ['free','busy','free','free','busy','busy','free','free','free','busy','full','full','free'],
  ['busy','busy','free','free','free','busy','busy','free','free','free','busy','busy','free'],
  ['free','free','busy','busy','free','free','full','full','busy','free','free','free','free'],
  ['full','full','busy','free','free','free','busy','busy','free','free','busy','free','free'],
  ['free','busy','busy','free','busy','free','free','busy','busy','free','free','busy','free'],
  ['free','free','free','busy','busy','busy','free','free','free','busy','busy','busy','busy']
];

export const timeSlots: TimeSlot[] = courts.flatMap((court, idx) => {
  const patternIdx = idx % patterns.length;
  return generateTimeSlots(court.id, dateStr, patterns[patternIdx]);
});

export const getCourtsByVenue = (venueId: string) => courts.filter(c => c.venueId === venueId);
export const getSlotsByCourt = (courtId: string) => timeSlots.filter(s => s.courtId === courtId);
