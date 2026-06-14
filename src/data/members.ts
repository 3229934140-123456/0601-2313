import type { Member } from '../types';

export const members: Member[] = [
  {
    id: 'm1',
    name: '张伟',
    memberNo: 'SVIP20240001',
    level: '钻石卡',
    balance: 5680.50,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangwei',
    phone: '138****1234'
  },
  {
    id: 'm2',
    name: '李娜',
    memberNo: 'GOLD20240023',
    level: '金卡',
    balance: 2350.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina',
    phone: '139****5678'
  },
  {
    id: 'm3',
    name: '王强',
    memberNo: 'SILV20240156',
    level: '银卡',
    balance: 890.50,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangqiang',
    phone: '137****9012'
  },
  {
    id: 'm4',
    name: '陈美玲',
    memberNo: 'NRML20240890',
    level: '普通',
    balance: 156.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenmeiling',
    phone: '136****3456'
  },
  {
    id: 'm5',
    name: '刘建国',
    memberNo: 'SILV20240203',
    level: '银卡',
    balance: 1200.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liujianguo',
    phone: '135****7890'
  }
];

export const getMemberById = (id: string) => members.find(m => m.id === id);
export const getMemberByNo = (memberNo: string) => members.find(m => m.memberNo === memberNo);
