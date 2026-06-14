import type { Announcement, Feedback } from '../types';

const today = new Date();
const formatDate = (offsetDays: number, hour = 9, minute = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const announcements: Announcement[] = [
  {
    id: 'a1',
    title: '🏊 游泳馆6月20日临时闭馆通知',
    content: '因泳池设备年度维护保养，游泳馆将于2026年6月20日（周六）全天闭馆，6月21日恢复正常营业。给您带来不便，敬请谅解！已预约6月20日游泳馆场地的会员，系统将自动办理全额退款，退款将在3个工作日内原路返回。',
    type: '闭馆通知',
    targetVenues: ['v3'],
    publishAt: formatDate(-3, 10),
    expireAt: formatDate(7, 23, 59),
    pinned: true
  },
  {
    id: 'a2',
    title: '🎉 端午特惠活动火热来袭',
    content: '端午节期间（6月18日-6月22日），全场场地预约享8折优惠！团课报名满200减50，更有端午限定礼包等你拿！活动期间每日前50名到场会员可获赠精美礼品一份，数量有限先到先得！',
    type: '活动公告',
    targetVenues: ['v1', 'v2', 'v3'],
    publishAt: formatDate(-1, 9),
    expireAt: formatDate(10, 23, 59),
    pinned: true
  },
  {
    id: 'a3',
    title: '🔧 羽毛球馆场地灯更新维护',
    content: '羽毛球馆1-4号场地照明系统将于2026年6月17日（周三）22:00-次日06:00进行LED灯光升级改造，届时相关场地将暂停预约。升级后将提供更明亮、舒适的运动灯光体验。',
    type: '设施维护',
    targetVenues: ['v2'],
    publishAt: formatDate(-2, 14),
    expireAt: formatDate(2, 23, 59),
    pinned: false
  },
  {
    id: 'a4',
    title: '📢 自助预约终端使用指引更新',
    content: '为提升会员使用体验，自助预约终端系统已升级至v2.0版本，新增功能包括：1）人脸识别快速登录；2）一键改签功能；3）电子入场码扫码入场。如您在使用过程中有任何问题，请咨询现场工作人员或拨打客服热线400-888-8888。',
    type: '系统公告',
    targetVenues: ['v1', 'v2', 'v3'],
    publishAt: formatDate(-5, 11),
    expireAt: formatDate(30, 23, 59),
    pinned: false
  },
  {
    id: 'a5',
    title: '🏆 馆内篮球联赛火热报名中',
    content: '2026夏季会员篮球联赛将于7月1日正式开赛！3V3对决，冠亚季军队伍可获得现金大奖及全年免费场地使用权！报名截止日期6月25日，名额限32支队伍。详情请前往篮球馆前台咨询或关注公众号「智慧体育场馆」查看报名指南。',
    type: '活动公告',
    targetVenues: ['v1'],
    publishAt: formatDate(-4, 16),
    expireAt: formatDate(15, 23, 59),
    pinned: false
  }
];

export const feedbacks: Feedback[] = [
  {
    id: 'f1',
    memberId: 'm2',
    memberName: '李娜',
    type: '表扬',
    rating: 5,
    content: '羽毛球馆的灯光升级效果太好了！新的LED灯非常明亮，晚上打球再也不用眯眼睛了，给场馆点赞！还有工作人员服务态度特别好，每次来都很亲切。',
    createdAt: formatDate(-7, 20),
    reply: '非常感谢您的认可！我们会继续努力，为会员提供更优质的运动环境和服务体验。'
  },
  {
    id: 'f2',
    memberId: 'm4',
    memberName: '陈美玲',
    type: '建议',
    rating: 4,
    content: '建议游泳馆可以增加一些储物柜，高峰期经常找不到柜子放东西。另外希望能够提供吹风机，冬天洗完头很容易着凉。',
    createdAt: formatDate(-10, 15),
    reply: '感谢您的宝贵建议！我们已计划在本月底新增20个储物柜，同时在淋浴区配备6台大功率吹风机，敬请期待！'
  },
  {
    id: 'f3',
    memberId: 'm5',
    memberName: '刘建国',
    type: '投诉',
    rating: 2,
    content: '上周六预约篮球VIP场地，到了以后发现场地地面有水渍，清理了很久才开始打球，耽误了半小时时间。希望工作人员能在开场前仔细检查场地状况。',
    createdAt: formatDate(-15, 21),
    reply: '非常抱歉给您带来了不好的体验！我们已加强场地巡检制度，每场开场前30分钟必须完成场地安全检查。同时为您补偿1小时VIP场地使用券，可在个人中心查看。'
  }
];

export const getActiveAnnouncements = () => {
  const now = new Date().toISOString();
  return announcements.filter(a => a.publishAt <= now && a.expireAt >= now);
};

export const getPinnedAnnouncements = () => announcements.filter(a => a.pinned);
export const getFeedbacksByMember = (memberId: string) => feedbacks.filter(f => f.memberId === memberId);
