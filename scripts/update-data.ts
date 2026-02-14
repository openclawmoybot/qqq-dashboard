import fs from 'fs';
import path from 'path';
import { fetchStockData, fetchNews, DashboardData } from '../lib/finance';

const DATA_FILE = path.join(process.cwd(), 'app/data.json');
const SYMBOL = 'QQQ';

async function main() {
  try {
    console.log(`Fetching data for ${SYMBOL}...`);
    
    const [stockData, newsData] = await Promise.all([
      fetchStockData(SYMBOL),
      fetchNews()
    ]);

    const output: DashboardData = {
      symbol: SYMBOL,
      updatedAt: new Date().toISOString(),
      currentPrice: stockData.currentPrice,
      currentSMA: stockData.currentSMA,
      history: stockData.history,
      news: newsData
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));
    console.log(`Success! Saved to ${DATA_FILE}`);
    console.log(`Price: ${output.currentPrice}, SMA: ${output.currentSMA}`);
    console.log(`News items: ${output.news.length}`);

  } catch (error) {
    console.error('Error fetching data (likely network block or API change):', error);
    // Do NOT fail the build. Keep the old data.json (which is checked into git).
    // If the file doesn't exist (clean repo and first run failed), write mock data.
    if (!fs.existsSync(DATA_FILE)) {
        console.log('No existing data found. Writing fallback mock data.');
        const mockData: DashboardData = {
            symbol: SYMBOL,
            updatedAt: new Date().toISOString(),
            currentPrice: 0,
            currentSMA: 0,
            history: [],
            news: [{ title: 'Data Fetch Failed - Using Mock', link: '#', pubDate: new Date().toISOString(), source: 'System' }]
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(mockData, null, 2));
    } else {
        console.log('Using existing (stale) data from repository.');
    }
    process.exit(0); // Exit success so deployment continues
  }
}

main();
