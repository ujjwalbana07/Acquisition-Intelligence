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

/**
 * Institutional Metric Resolver
 * Ensures all metrics are safely stringified with units OR nullified if invalid.
 */
export function resolveMetric(value, type = 'number', decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return null;
  
  switch (type) {
    case 'currency':
      return formatCurrency(value, false);
    case 'compactCurrency':
      return formatCurrency(value, true);
    case 'percent':
      return (value * 100).toFixed(decimals) + '%';
    case 'multiple':
      return value.toFixed(decimals) + 'x';
    default:
      return value.toFixed(decimals);
  }
}

/**
 * Creates a fully resolved, safe string manifest of all core metrics
 * for use in LLM payloads and fallback narratives.
 */
export function getResolvedMetrics(metrics, inputs) {
  return {
    noi: resolveMetric(metrics.noi, 'currency'),
    capRate: resolveMetric(metrics.capRate, 'percent'),
    dscr: resolveMetric(metrics.dscr, 'multiple'),
    cashOnCash: resolveMetric(metrics.cashOnCashReturn || metrics.cashOnCash, 'percent'),
    ltv: resolveMetric(metrics.ltv, 'percent'),
    breakEven: resolveMetric(metrics.breakEvenOccupancy, 'percent'),
    freeCashFlow: resolveMetric(metrics.annualCashFlow, 'currency'),
    noiFormatted: resolveMetric(metrics.noi, 'compactCurrency'),
    score: resolveMetric(metrics.score || 0, 'number', 0),
    price: resolveMetric(inputs?.askingPrice, 'currency'),
  };
}
