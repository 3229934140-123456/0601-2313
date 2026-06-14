import type { Coach, Course, Enrollment } from '../types';

const today = new Date();
const formatDateTime = (offsetDays: number, hour: number, minute: number = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const coaches: Coach[] = [
  {
    id: 'coach1',
    name: '李明轩',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach1',
    specialty: '篮球教学与战术分析',
    experience: 12,
    rating: 4.9,
    description: '前CBA职业球员，国家一级运动员，擅长青少年篮球启蒙和进阶训练'
  },
  {
    id: 'coach2',
    name: '张雪婷',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach2',
    specialty: '羽毛球专业训练',
    experience: 8,
    rating: 4.8,
    description: '国家健将级运动员，省队退役，擅长步法训练和网前技术'
  },
  {
    id: 'coach3',
    name: '王海洋',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach3',
    specialty: '游泳训练与水中康复',
    experience: 15,
    rating: 4.9,
    description: '前国家游泳队队员，国家级游泳裁判，四种泳姿全能教练'
  },
  {
    id: 'coach4',
    name: '陈慧琳',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach4',
    specialty: '瑜伽与动感单车',
    experience: 10,
    rating: 4.7,
    description: '国际瑜伽联盟认证教练，莱美动感单车认证，专注女性塑形训练'
  }
];

export const courses: Course[] = [
  {
    id: 'course1',
    name: '篮球基础入门班',
    coachId: 'coach1',
    venueType: 'basketball',
    startTime: formatDateTime(1, 18, 30),
    duration: 90,
    capacity: 15,
    enrolled: 8,
    price: 150,
    description: '适合零基础学员，从运球、投篮基本动作学起，培养篮球兴趣',
    level: '初级'
  },
  {
    id: 'course2',
    name: '羽毛球进阶提高班',
    coachId: 'coach2',
    venueType: 'badminton',
    startTime: formatDateTime(2, 19, 0),
    duration: 120,
    capacity: 12,
    enrolled: 10,
    price: 200,
    description: '针对有基础的学员，强化杀球、吊球技术，提升实战对抗能力',
    level: '中级'
  },
  {
    id: 'course3',
    name: '自由泳零基础训练',
    coachId: 'coach3',
    venueType: 'swimming',
    startTime: formatDateTime(1, 10, 0),
    duration: 60,
    capacity: 10,
    enrolled: 6,
    price: 180,
    description: '水性练习、呼吸技巧、自由泳分解动作，循序渐进掌握游泳技能',
    level: '初级'
  },
  {
    id: 'course4',
    name: '流瑜伽塑形课',
    coachId: 'coach4',
    venueType: 'badminton',
    startTime: formatDateTime(3, 20, 0),
    duration: 75,
    capacity: 20,
    enrolled: 18,
    price: 80,
    description: '流畅的体式串联配合呼吸，柔韧脊柱，美化线条，释放身心压力',
    level: '初级'
  },
  {
    id: 'course5',
    name: '动感单车燃脂课',
    coachId: 'coach4',
    venueType: 'basketball',
    startTime: formatDateTime(4, 19, 30),
    duration: 45,
    capacity: 25,
    enrolled: 22,
    price: 60,
    description: '高强度间歇骑行训练，音乐节奏带动，快速燃烧脂肪提升心肺',
    level: '中级'
  },
  {
    id: 'course6',
    name: '篮球战术精英班',
    coachId: 'coach1',
    venueType: 'basketball',
    startTime: formatDateTime(5, 18, 0),
    duration: 120,
    capacity: 10,
    enrolled: 7,
    price: 280,
    description: '针对高水平学员，系统学习挡拆、传切、联防等专业战术配合',
    level: '高级'
  },
  {
    id: 'course7',
    name: '综合体能训练营',
    coachId: 'coach4',
    venueType: 'basketball',
    startTime: formatDateTime(6, 16, 0),
    duration: 90,
    capacity: 15,
    enrolled: 11,
    price: 120,
    description: '力量、耐力、敏捷、爆发力全面提升，适合所有运动爱好者',
    level: '中级'
  },
  {
    id: 'course8',
    name: '蛙泳技术精修班',
    coachId: 'coach3',
    venueType: 'swimming',
    startTime: formatDateTime(2, 15, 30),
    duration: 75,
    capacity: 12,
    enrolled: 9,
    price: 220,
    description: '针对已会蛙泳但动作不标准的学员，矫正姿势，提升游进效率',
    level: '中级'
  }
];

export const enrollments: Enrollment[] = [
  { id: 'e1', memberId: 'm1', courseId: 'course1', status: '已报名', createdAt: '2026-06-10T10:00:00Z' },
  { id: 'e2', memberId: 'm2', courseId: 'course4', status: '已报名', createdAt: '2026-06-11T14:30:00Z' },
  { id: 'e3', memberId: 'm3', courseId: 'course5', status: '已完成', createdAt: '2026-06-08T09:00:00Z' },
  { id: 'e4', memberId: 'm5', courseId: 'course2', status: '已报名', createdAt: '2026-06-12T16:20:00Z' },
  { id: 'e5', memberId: 'm1', courseId: 'course7', status: '已报名', createdAt: '2026-06-13T11:40:00Z' }
];

export const getCoachById = (id: string) => coaches.find(c => c.id === id);
export const getCourseByCoach = (coachId: string) => courses.filter(c => c.coachId === coachId);
export const getEnrollmentsByMember = (memberId: string) => enrollments.filter(e => e.memberId === memberId);
