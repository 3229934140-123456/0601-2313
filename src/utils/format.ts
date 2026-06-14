export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export function formatPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

export function maskName(name: string): string {
  if (name.length <= 1) return name
  if (name.length === 2) return `${name[0]}*`
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`
}

export function generateEntryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function statusText(status: string): string {
  const map: Record<string, string> = {
    待使用: '待使用',
    已完成: '已完成',
    已取消: '已取消',
    未支付: '未支付',
    已支付: '已支付',
    已退款: '已退款',
    空闲: '空闲',
    繁忙: '繁忙',
    已满: '已满',
    开放: '开放中',
    维护: '维护中',
    关闭: '已关闭',
  }
  return map[status] || status
}
