// Currency formatters for Pakistani Rupee (PKR)

export function formatPkr(amount: number): string {
  if (isNaN(amount)) return 'PKR 0';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  // Format in Lakhs / Crores for clear Pakistani automotive context
  if (absAmount >= 10000000) {
    const crores = (absAmount / 10000000).toFixed(2);
    return `${sign}PKR ${crores} Crore (${sign}PKR ${absAmount.toLocaleString()})`;
  } else if (absAmount >= 100000) {
    const lakhs = (absAmount / 100000).toFixed(2);
    return `${sign}PKR ${lakhs} Lakhs (${sign}PKR ${absAmount.toLocaleString()})`;
  }

  return `${sign}PKR ${absAmount.toLocaleString()}`;
}

export function formatPkrShort(amount: number): string {
  if (isNaN(amount)) return 'PKR 0';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    return `${sign}PKR ${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    return `${sign}PKR ${(absAmount / 100000).toFixed(2)} Lacs`;
  }

  return `${sign}PKR ${absAmount.toLocaleString()}`;
}

export function getLiquidityBadgeColor(liquidity: string): { bg: string; text: string; border: string } {
  if (liquidity.includes('High')) {
    return { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30' };
  } else if (liquidity.includes('Moderate')) {
    return { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30' };
  } else {
    return { bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-500/30' };
  }
}

export function getPanelStateBadge(state: string): { label: string; colorClass: string } {
  switch (state) {
    case 'clean':
      return { label: 'Original Paint', colorClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
    case 'touchup':
      return { label: 'Minor Touchup', colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
    case 'repaint':
      return { label: 'Full Repaint', colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
    case 'replaced':
      return { label: 'Panel Replaced', colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' };
    case 'damaged':
      return { label: 'Frame / Structural Impact', colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
    default:
      return { label: 'Unknown', colorClass: 'bg-slate-100 text-slate-800' };
  }
}
