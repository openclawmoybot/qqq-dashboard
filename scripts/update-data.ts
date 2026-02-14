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
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
