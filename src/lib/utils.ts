export function formatPrice(amount: number): string {
  return `\u20B9${amount.toFixed(0)}`;
}

export function formatPriceDecimal(amount: number): string {
  return `\u20B9${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function generateOrderId(): string {
  return 'FC' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(-2);
}

export const DELIVERY_SLOTS = [
  'Today 6-8 PM',
  'Today 8-10 PM',
  'Tomorrow 6-8 AM',
  'Tomorrow 8-10 AM',
  'Tomorrow 6-8 PM',
];

export const ORDER_STATUS_STEPS: { key: string; label: string }[] = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export const CANCELABLE_STATUSES = ['confirmed', 'packed'];

export function isCancelable(status: string): boolean {
  return CANCELABLE_STATUSES.includes(status);
}

export function statusLabel(status: string): string {
  if (status === 'cancelled') return 'Cancelled';
  const step = ORDER_STATUS_STEPS.find(s => s.key === status);
  return step?.label || status;
}
