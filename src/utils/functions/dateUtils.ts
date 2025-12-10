

export function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Lấy giờ bắt đầu (HH:mm) từ chuỗi timeSlot dạng "07:00:00-08:00:00"
 */
export function getStartHour(timeSlot: string): string {
  if (!timeSlot) return "";
  const start = timeSlot.split('-')[0];
  return start.slice(0,5);
}