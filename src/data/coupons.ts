import type { Coupon } from '../types';

const today = new Date();
const formatExpire = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const coupons: Coupon[] = [
  { id: 'cp1', memberId: 'm1', name: '全场满500减100', discount: 100, type: '满减', expireAt: formatExpire(30), used: false, minAmount: 500 },
  { id: 'cp2', memberId: 'm1', name: '篮球场地8折券', discount: 0, type: '折扣', expireAt: formatExpire(15), used: false, discountPercent: 0.8 },
  { id: 'cp3', memberId: 'm1', name: '游泳体验券1小时', discount: 40, type: '体验券', expireAt: formatExpire(45), used: false },
  { id: 'cp4', memberId: 'm1', name: '团课满300减80', discount: 80, type: '满减', expireAt: formatExpire(20), used: true, minAmount: 300 },
  { id: 'cp5', memberId: 'm1', name: '羽毛球VIP场地7折券', discount: 0, type: '折扣', expireAt: formatExpire(10), used: false, discountPercent: 0.7 },

  { id: 'cp6', memberId: 'm2', name: '全场满300减60', discount: 60, type: '满减', expireAt: formatExpire(25), used: false, minAmount: 300 },
  { id: 'cp7', memberId: 'm2', name: '瑜伽体验券', discount: 80, type: '体验券', expireAt: formatExpire(15), used: false },
  { id: 'cp8', memberId: 'm2', name: '游泳场地8.5折券', discount: 0, type: '折扣', expireAt: formatExpire(30), used: false, discountPercent: 0.85 },
  { id: 'cp9', memberId: 'm2', name: '满200减50通用券', discount: 50, type: '满减', expireAt: formatExpire(7), used: false, minAmount: 200 },

  { id: 'cp10', memberId: 'm3', name: '篮球体验券1小时', discount: 120, type: '体验券', expireAt: formatExpire(20), used: false },
  { id: 'cp11', memberId: 'm3', name: '满200减40', discount: 40, type: '满减', expireAt: formatExpire(15), used: true, minAmount: 200 },
  { id: 'cp12', memberId: 'm3', name: '动感单车体验券', discount: 60, type: '体验券', expireAt: formatExpire(10), used: false },
  { id: 'cp13', memberId: 'm3', name: '羽毛球场地9折券', discount: 0, type: '折扣', expireAt: formatExpire(25), used: false, discountPercent: 0.9 },

  { id: 'cp14', memberId: 'm4', name: '新人专享满100减30', discount: 30, type: '满减', expireAt: formatExpire(7), used: false, minAmount: 100 },
  { id: 'cp15', memberId: 'm4', name: '游泳体验券30分钟', discount: 20, type: '体验券', expireAt: formatExpire(15), used: true },
  { id: 'cp16', memberId: 'm4', name: '羽毛球基础体验券', discount: 50, type: '体验券', expireAt: formatExpire(20), used: false },

  { id: 'cp17', memberId: 'm5', name: '全场满400减80', discount: 80, type: '满减', expireAt: formatExpire(30), used: false, minAmount: 400 },
  { id: 'cp18', memberId: 'm5', name: '篮球进阶课程体验券', discount: 150, type: '体验券', expireAt: formatExpire(25), used: false },
  { id: 'cp19', memberId: 'm5', name: '综合体能课8折券', discount: 0, type: '折扣', expireAt: formatExpire(15), used: false, discountPercent: 0.8 },
  { id: 'cp20', memberId: 'm5', name: '满150减30券', discount: 30, type: '满减', expireAt: formatExpire(10), used: true, minAmount: 150 },
  { id: 'cp21', memberId: 'm5', name: '羽毛球场地1小时体验', discount: 50, type: '体验券', expireAt: formatExpire(12), used: false }
];

export const getCouponsByMember = (memberId: string, includeUsed = true) => {
  const filtered = coupons.filter(c => c.memberId === memberId);
  return includeUsed ? filtered : filtered.filter(c => !c.used);
};

export const getAvailableCoupons = (memberId: string, amount: number) => {
  const now = formatExpire(0);
  return coupons.filter(c =>
    c.memberId === memberId &&
    !c.used &&
    c.expireAt >= now &&
    (!c.minAmount || amount >= c.minAmount)
  );
};
