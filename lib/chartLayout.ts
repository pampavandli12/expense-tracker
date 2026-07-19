const AXIS_SECTIONS = 4;
const CHART_EDGE_INSET = 12;
const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: "A$",
  CAD: "C$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  USD: "$",
};

function currencySymbol(currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  if (CURRENCY_SYMBOLS[normalizedCurrency]) {
    return CURRENCY_SYMBOLS[normalizedCurrency];
  }
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: normalizedCurrency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value ??
      `${normalizedCurrency} `
    );
  } catch {
    return `${normalizedCurrency} `;
  }
}

function compactNumber(value: number) {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => {
    const divided = absolute / divisor;
    const digits = divided < 10 && !Number.isInteger(divided) ? 1 : 0;
    return `${divided.toFixed(digits)}${suffix}`;
  };

  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "k");
  if (absolute >= 10) return String(Math.round(absolute));
  return String(Math.round(absolute * 10) / 10);
}

export function formatChartAxisValue(value: number, currency: string) {
  const sign = value < 0 ? "−" : "";
  return `${sign}${currencySymbol(currency)}${compactNumber(value)}`;
}

function niceStep(rawStep: number) {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const nice =
    normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 2.5
          ? 2.5
          : normalized <= 5
            ? 5
            : 10;
  return nice * magnitude;
}

export function getChartScale(values: number[], currency: string) {
  const largest = Math.max(0, ...values);
  const stepValue = niceStep(largest / AXIS_SECTIONS);
  const maxValue = stepValue * AXIS_SECTIONS;
  const longestLabel = Array.from({ length: AXIS_SECTIONS + 1 }, (_, index) =>
    formatChartAxisValue(stepValue * index, currency),
  ).reduce((longest, label) =>
    label.length > longest.length ? label : longest,
  );

  return {
    maxValue,
    stepValue,
    noOfSections: AXIS_SECTIONS,
    yAxisLabelWidth: Math.min(64, Math.max(42, longestLabel.length * 7 + 4)),
  };
}

export function getBarChartLayout(pointCount: number, plotWidth: number) {
  const count = Math.max(1, pointCount);
  const availablePerGroup =
    (plotWidth - CHART_EDGE_INSET * 2) / Math.max(1, count);
  const groupWidth = Math.max(40, availablePerGroup);
  const barWidth = Math.min(16, Math.max(10, groupWidth * 0.24));
  const pairSpacing = Math.min(7, Math.max(4, groupWidth * 0.1));
  const groupSpacing = Math.max(10, groupWidth - barWidth * 2 - pairSpacing);
  const actualGroupWidth = barWidth * 2 + pairSpacing + groupSpacing;
  const contentWidth = CHART_EDGE_INSET * 2 + actualGroupWidth * count;

  return {
    initialSpacing: CHART_EDGE_INSET,
    endSpacing: CHART_EDGE_INSET,
    groupWidth: actualGroupWidth,
    barWidth,
    pairSpacing,
    groupSpacing,
    scrollEnabled: contentWidth > plotWidth + 1,
  };
}

export function getLineChartLayout(pointCount: number, plotWidth: number) {
  const count = Math.max(1, pointCount);
  const fittedSpacing =
    count === 1 ? 0 : (plotWidth - CHART_EDGE_INSET * 2) / (count - 1);
  const spacing = count === 1 ? 0 : Math.max(40, fittedSpacing);
  const contentWidth = CHART_EDGE_INSET * 2 + spacing * Math.max(0, count - 1);

  return {
    initialSpacing: CHART_EDGE_INSET,
    endSpacing: CHART_EDGE_INSET,
    spacing,
    scrollEnabled: contentWidth > plotWidth + 1,
  };
}
