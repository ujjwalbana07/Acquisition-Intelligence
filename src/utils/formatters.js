// ============================================================
// FORMATTING & STYLING UTILITIES (FINTECH GRADE)
// ============================================================

export function formatCurrency(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (compact && Math.abs(value) >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(2) + 'M';
  }
  if (compact && Math.abs(value) >= 1_000) {
    return '$' + (value / 1_000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return (value * 100).toFixed(decimals) + '%';
}

export function formatMultiple(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return value.toFixed(decimals) + 'x';
}

export function getMetricColor(value, goodThreshold, badThreshold, inverted = false) {
  if (value === null || value === undefined) return 'text-slate-400';
  const isGood = inverted ? value <= goodThreshold : value >= goodThreshold;
  const isBad = inverted ? value >= badThreshold : value <= badThreshold;
  if (isGood) return 'text-emerald-400';
  if (isBad) return 'text-rose-400';
  return 'text-amber-400';
}

export function getRecommendationStyle(recommendation) {
  const styles = {
    'Proceed': {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500',
      glow: 'shadow-emerald-500/10',
    },
    'Proceed with Caution': {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badge: 'bg-amber-500',
      glow: 'shadow-amber-500/10',
    },
    'Renegotiate': {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      badge: 'bg-orange-500',
      glow: 'shadow-orange-500/10',
    },
    'Reject': {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      badge: 'bg-rose-500',
      glow: 'shadow-rose-500/10',
    },
  };
  return styles[recommendation] || styles['Proceed with Caution'];
}

export function getSeverityStyle(severity) {
  const styles = {
    critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-l-rose-500', dot: 'bg-rose-400', label: 'Critical' },
    high: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500', dot: 'bg-amber-400', label: 'High' },
    medium: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-l-orange-500', dot: 'bg-orange-400', label: 'Medium' },
    low: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-l-sky-500', dot: 'bg-sky-400', label: 'Low' },
  };
  return styles[severity] || styles.medium;
}
