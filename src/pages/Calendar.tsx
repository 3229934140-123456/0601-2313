import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Wifi, Wind, ShowerHead, Users, Eye, CalendarDays, Zap } from 'lucide-react';
import { venues, courts, getCourtsByVenue } from '@/data/venues';
import { useBookingStore } from '@/store/useBookingStore';
import { useUiStore } from '@/store/useUiStore';
import { formatDate, getMonthDates, isToday, isSameDay } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { TimeSlot, SlotStatus } from '@/types';
import BigButton from '@/components/ui/BigButton';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9);
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const facilityIcons: Record<string, typeof Wifi> = { WiFi: Wifi, 空调: Wind, 淋浴: ShowerHead };
const dotColors = [
  ['bg-green-500', 'bg-green-500', 'bg-gray-200', 'bg-gray-200'],
  ['bg-green-500', 'bg-green-500', 'bg-green-500', 'bg-gray-200'],
  ['bg-yellow-400', 'bg-yellow-400', 'bg-yellow-400', 'bg-gray-200'],
  ['bg-orange-500', 'bg-orange-500', 'bg-orange-500', 'bg-orange-500'],
  ['bg-red-500', 'bg-red-500', 'bg-red-500', 'bg-red-500'],
];

const genSlots = (venueId: string, date: string, courtIds: string[]): TimeSlot[] => {
  const patterns: SlotStatus[][] = [
    ['free','free','free','busy','busy','free','free','busy','full','full','busy','free','free'],
    ['free','busy','free','free','busy','busy','free','free','free','busy','full','full','free'],
    ['busy','busy','free','free','free','busy','busy','free','free','free','busy','busy','free'],
    ['free','free','busy','busy','free','free','full','full','busy','free','free','free','free'],
    ['full','full','busy','free','free','free','busy','busy','free','free','busy','free','free'],
  ];
  return courtIds.flatMap((courtId, idx) => {
    const pat = patterns[idx % patterns.length];
    return HOURS.map((h, i) => {
      const hh = h.toString().padStart(2, '0'), eh = (h + 1).toString().padStart(2, '0');
      const st = pat[i] || 'free';
      return { id: `${courtId}-${date}-${hh}`, courtId, date, startTime: `${hh}:00`, endTime: `${eh}:00`, status: st, capacity: 10, bookedCount: st === 'free' ? 0 : st === 'busy' ? 5 : 10 };
    });
  });
};
const calcSat = (slots: TimeSlot[]) => {
  if (!slots.length) return 0;
  let s = 0; slots.forEach(x => { const t = x.status as string; s += (t === 'full' || t === '已满') ? 2 : (t === 'busy' || t === '繁忙') ? 1 : 0; });
  const r = s / (slots.length * 2);
  return r <= .2 ? 0 : r <= .4 ? 1 : r <= .65 ? 2 : r <= .85 ? 3 : 4;
};
const slotClass = (st: string, past: boolean, full: boolean, busy: boolean, sel: boolean) => cn(
  'aspect-square rounded-xl transition-all duration-200 relative',
  past ? 'bg-gray-200 cursor-not-allowed' :
  full ? 'bg-red-400/80 cursor-not-allowed' :
  busy ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-green-400 hover:bg-green-300',
  sel && 'ring-4 ring-accent-500 scale-105 z-10',
  !full && !past && 'active:scale-90 cursor-pointer'
);

export default function Calendar() {
  const navigate = useNavigate();
  const { selectedVenueId, selectedDate, selectedSlotId, selectedCourtId, setSelectedVenueId, setSelectedDate, setSelectedSlotId, setSelectedCourtId } = useBookingStore();
  const { showToast } = useUiStore();
  const [viewDate, setViewDate] = useState(new Date());
  const now = new Date();
  const isPastHour = (h: number) => formatDate(selectedDate) === formatDate(now) && h <= now.getHours();

  const venueCourts = useMemo(() => getCourtsByVenue(selectedVenueId), [selectedVenueId]);
  const courtIds = useMemo(() => venueCourts.map(c => c.id), [venueCourts]);
  const slotsByCourt = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();
    genSlots(selectedVenueId, selectedDate, courtIds).forEach(s => { const a = map.get(s.courtId) || []; a.push(s); map.set(s.courtId, a); });
    return map;
  }, [selectedVenueId, selectedDate, courtIds]);
  const monthDates = getMonthDates(viewDate.getFullYear(), viewDate.getMonth());
  const daySat = useMemo(() => {
    const m = new Map<string, number>();
    monthDates.forEach(d => { if (d) { const k = formatDate(d); m.set(k, calcSat(genSlots(selectedVenueId, k, courtIds.slice(0, 3)))); } });
    return m;
  }, [viewDate, selectedVenueId, courtIds]);

  const prevMonth = () => setViewDate(d => { const x = new Date(d); x.setMonth(x.getMonth() - 1); return x; });
  const nextMonth = () => setViewDate(d => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; });
  const handleVenueClick = (id: string) => { setSelectedVenueId(id); showToast('info', `已切换至${venues.find(v => v.id === id)?.name || ''}`); };
  const handleSlotClick = (slot: TimeSlot) => {
    const st = slot.status as string, h = parseInt(slot.startTime.split(':')[0]);
    if (st === 'full' || st === '已满') return showToast('warning', '该时段已满');
    if (isPastHour(h)) return showToast('warning', '该时段已过');
    setSelectedCourtId(slot.courtId); setSelectedSlotId(slot.id);
    showToast('success', `已选择 ${slot.startTime}-${slot.endTime}`);
  };
  const handleCourtClick = (id: string) => { setSelectedCourtId(id); showToast('info', `已选中${courts.find(c => c.id === id)?.name || ''}`); };
  const handleBooking = () => {
    if (!selectedCourtId || !selectedSlotId) return showToast('warning', '请先选择场地和时段');
    navigate('/booking');
  };

  return (
    <div className="h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="flex gap-4">
            {venues.map(v => {
              const active = v.id === selectedVenueId, isOpen = v.status === '正常' || v.status === '开放';
              return (
                <motion.button key={v.id} whileTap={{ scale: 0.97 }} onClick={() => handleVenueClick(v.id)}
                  className={cn('flex-1 min-h-[140px] rounded-3xl p-5 text-left bg-white shadow-card border-2 transition-all duration-300',
                    active ? 'border-accent-500 shadow-glow ring-2 ring-accent-500/30' : 'border-transparent hover:border-primary-200 hover:shadow-card-hover')}>
                  <div className="flex items-start justify-between">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br shadow-md', active ? 'from-accent-400 to-accent-600' : 'from-primary-300 to-primary-500')}>{v.icon}</div>
                    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600')}>{isOpen ? '营业中' : '已闭馆'}</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold text-primary-800">{v.name}</div>
                      <div className="text-xs text-primary-500 mt-1">{v.description?.slice(0, 12)}...</div>
                    </div>
                    <div className={cn('flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-xl transition-colors', active ? 'bg-accent-500 text-white' : 'bg-primary-50 text-primary-600 hover:bg-primary-100')}>
                      <Eye className="w-4 h-4" />查看场地
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="grid grid-cols-5 gap-5">
          <div className="col-span-2 bg-white rounded-3xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-accent-500" /><span className="text-lg font-bold text-primary-800">{viewDate.getFullYear()}年{viewDate.getMonth() + 1}月</span></div>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 active:scale-95 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={nextMonth} className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 active:scale-95 transition-all"><ChevronRight className="w-6 h-6" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEKDAYS.map((w, i) => <div key={w} className={cn('text-xs font-semibold py-2', (i === 0 || i === 6) ? 'text-red-400' : 'text-primary-400')}>{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map((d, idx) => {
                if (!d) return <div key={idx} />;
                const wd = d.getDay(), key = formatDate(d), sat = daySat.get(key) || 0, sel = isSameDay(d, selectedDate), tdy = isToday(d), dots = dotColors[sat];
                return (
                  <button key={idx} onClick={() => setSelectedDate(key)}
                    className={cn('aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 text-sm font-semibold transition-all duration-200',
                      sel ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/40' :
                      tdy ? 'border-2 border-primary-500 text-primary-600 bg-white' : 'text-primary-700 hover:bg-primary-50',
                      (wd === 0 || wd === 6) && !sel && 'text-red-400')}>
                    <span>{d.getDate()}</span>
                    <div className="flex gap-0.5">{dots.map((c, i) => <span key={i} className={cn('w-1 h-1 rounded-full', c)} />)}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-primary-500 border-t border-primary-100 pt-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />空闲</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" />一般</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />繁忙</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />爆满</span>
              </div>
              <span>{selectedDate}</span>
            </div>
          </div>

          <div className="col-span-3 bg-white rounded-3xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-accent-500" /><span className="text-lg font-bold text-primary-800">时段热力图</span></div>
              <div className="text-sm text-primary-500">{formatDate(selectedDate)} · 共 {venueCourts.length} 个场地</div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="flex mb-2">
                  <div className="w-32 shrink-0" />
                  <div className="flex-1 grid grid-cols-13 gap-1">{HOURS.map(h => <div key={h} className={cn('text-center text-xs font-semibold py-2 rounded-lg', isPastHour(h) ? 'text-gray-300' : 'text-primary-600')}>{h}:00</div>)}</div>
                </div>
                <div className="space-y-2">
                  {venueCourts.slice(0, 5).map(court => {
                    const cSlots = slotsByCourt.get(court.id) || [];
                    return (
                      <div key={court.id} className="flex items-center">
                        <div className="w-32 shrink-0 pr-3">
                          <div className="text-sm font-bold text-primary-700 truncate">{court.name.replace(/.*?(场地|泳道|区)(\d*号?|VIP)?/g, '$1$2') || court.name.slice(4)}</div>
                          <div className="text-xs text-primary-400">{formatCurrency(court.pricePerHour)}/h</div>
                        </div>
                        <div className="flex-1 grid grid-cols-13 gap-1">
                          {HOURS.map((h, i) => {
                            const slot = cSlots[i]; if (!slot) return <div key={h} />;
                            const st = slot.status as string, past = isPastHour(h), full = st === 'full' || st === '已满', busy = st === 'busy' || st === '繁忙', sel = selectedSlotId === slot.id;
                            return <button key={h} onClick={() => handleSlotClick(slot)} disabled={full || past} className={slotClass(st, past, full, busy, sel)}>{sel && <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-white" />}</button>;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-primary-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-5 text-primary-600">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-lg bg-green-400" />空闲</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-lg bg-yellow-400" />繁忙</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-lg bg-red-400/80" />已满</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-lg bg-gray-200" />已过</span>
              </div>
              <span className="text-primary-500">点击空闲时段进行选择</span>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }} className="bg-white rounded-3xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-lg font-bold text-primary-800">场地列表</span><span className="text-xs text-primary-500">共 {venueCourts.length} 个场地</span></div>
            <div className="text-xs text-primary-400">左右滑动查看更多 →</div>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {venueCourts.map(court => {
              const active = court.id === selectedCourtId, slots = slotsByCourt.get(court.id) || [];
              const freeCount = slots.filter(s => { const st = s.status as string; return (st === 'free' || st === '空闲') && !isPastHour(parseInt(s.startTime.split(':')[0])); }).length;
              const facList = typeof court.facilities === 'string' ? court.facilities.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : court.facilities;
              return (
                <motion.div key={court.id} whileTap={{ scale: 0.98 }} onClick={() => handleCourtClick(court.id)}
                  className={cn('snap-start shrink-0 w-[260px] rounded-3xl p-5 bg-gradient-to-br from-white to-primary-50 border-2 cursor-pointer transition-all duration-300',
                    active ? 'border-accent-500 shadow-glow ring-2 ring-accent-500/30' : 'border-transparent shadow-card hover:shadow-card-hover hover:border-primary-200')}>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {court.name.match(/\d+/)?.[0] || (court.name.includes('VIP') ? 'V' : '?')}
                    </div>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', freeCount > 5 ? 'bg-green-100 text-green-700' : freeCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                      {freeCount > 0 ? `余${freeCount}段` : '已满'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-lg font-bold text-primary-800">{court.name}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {facList.slice(0, 4).map(f => {
                        const Icon = facilityIcons[f];
                        return <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-600 rounded-lg text-xs">{Icon ? <Icon className="w-3 h-3" /> : null}{f}</span>;
                      })}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-primary-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-primary-400 flex items-center gap-1"><Users className="w-3 h-3" />容纳 {court.capacity} 人</div>
                      <div className="text-xl font-bold text-accent-500 mt-1">{formatCurrency(court.pricePerHour)}<span className="text-xs text-primary-400 font-normal"> /小时</span></div>
                    </div>
                    <BigButton size="md" variant={active ? 'accent' : 'primary'} className="h-14 px-5"
                      onClick={e => { e.stopPropagation(); handleCourtClick(court.id); handleBooking(); }}>立即预约</BigButton>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
        <div className="h-2" />
      </div>
      <style>{`.grid-cols-13 { grid-template-columns: repeat(13, minmax(0, 1fr)); }`}</style>
    </div>
  );
}
