// 统一时间工具：全系统使用北京时间（UTC+8）存储，格式 YYYY-MM-DD HH:MM:SS
const TZ_OFFSET_MS = 8 * 60 * 60 * 1000;

// 当前北京时间，格式 YYYY-MM-DD HH:MM:SS
export function nowBeijing(): string {
  return toBeijingString(new Date());
}

// Date 对象转北京时间字符串
export function toBeijingString(date: Date): string {
  return new Date(date.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 19).replace('T', ' ');
}

// 指定毫秒偏移后的北京时间字符串（用于计算到期时间）
export function beijingAfter(msOffset: number): string {
  return toBeijingString(new Date(Date.now() + msOffset));
}

// 北京时间字符串转回真实 Date 对象（与 nowBeijing/toBeijingString 互逆）
export function beijingStringToDate(str: string): Date {
  return new Date(str.replace(' ', 'T') + '+08:00');
}
