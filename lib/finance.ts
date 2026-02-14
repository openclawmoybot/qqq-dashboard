import axios from 'axios';
import Parser from 'rss-parser';
import { z } from 'zod';

// --- Zod Schemas ---
export const YahooChartSchema = z.object({
  chart: z.object({
    result: z.array(
      z.object({
        timestamp: z.array(z.number()),
        indicators: z.object({
          quote: z.array(
            z.object({
              close: z.array(z.number().nullable())
            })
          )
        })
      })
    )
  })
});

// --- Types ---
export interface StockDataPoint {
  date: string;
  price: number | null;
  sma: number | null;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export interface DashboardData {
  symbol: string;
  updatedAt: string;
  currentPrice: number;
  currentSMA: number;
  history: StockDataPoint[];
  news: NewsItem[];
}

// --- Logic ---

export function calculateSMA(prices: (number | null)[], period: number): (number | null)[] {
  const sma: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(null);
      continue;
    }
    const slice = prices.slice(i - period + 1, i + 1);
    const validSlice = slice.filter((p): p is number => p !== null);
    
    if (validSlice.length > 0) {
      const sum = validSlice.reduce((a, b) => a + b, 0);
      sma.push(sum / validSlice.length);
    } else {
      sma.push(null);
    }
  }
  return sma;
}

export async function fetchStockData(symbol: string): Promise<{ history: StockDataPoint[], currentPrice: number, currentSMA: number }> {
  const response = await axios.get(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2y`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
  );

  const parsed = YahooChartSchema.parse(response.data);
  const result = parsed.chart.result[0];
  const timestamps = result.timestamp;
  const closes = result.indicators.quote[0].close;

  const sma30w = calculateSMA(closes, 150); // 150 days ~= 30 weeks

  const combined = timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().split('T')[0],
    price: closes[i] ? parseFloat(closes[i]!.toFixed(2)) : null,
    sma: sma30w[i] ? parseFloat(sma30w[i]!.toFixed(2)) : null
  })).filter(d => d.price !== null);

  // Filter last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const history = combined.filter(d => new Date(d.date) >= oneYearAgo);

  const latest = history[history.length - 1];

  return {
    history,
    currentPrice: latest.price!,
    currentSMA: latest.sma!
  };
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    const parser = new Parser();
    // Yahoo Finance QQQ News RSS
    const feed = await parser.parseURL('https://finance.yahoo.com/rss/headline?s=QQQ');
    
    return feed.items.slice(0, 5).map(item => ({
      title: item.title || 'No title',
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      source: 'Yahoo Finance'
    }));
  } catch (e) {
    console.error("Failed to fetch news", e);
    return [];
  }
}
