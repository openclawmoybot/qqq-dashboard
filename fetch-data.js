const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DATA_FILE = path.join(process.cwd(), 'app/data.json');
const SYMBOL = 'QQQ';
// 30 weeks * 5 trading days = 150 days
const SMA_PERIOD = 150; 

async function fetchData() {
  try {
    console.log(`Fetching data for ${SYMBOL}...`);
    
    // Yahoo Finance blocks requests without a User-Agent
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${SYMBOL}?interval=1d&range=2y`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }
    );

    const result = response.data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    const closes = quotes.close;

    // Calculate SMA
    const smaData = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < SMA_PERIOD - 1) {
        smaData.push(null);
        continue;
      }
      const slice = closes.slice(i - SMA_PERIOD + 1, i + 1);
      // Filter out nulls in the slice (e.g. market holidays if any, though usually not in close array)
      const validSlice = slice.filter(p => p !== null);
      
      if (validSlice.length > 0) {
        const sum = validSlice.reduce((a, b) => a + b, 0);
        smaData.push(sum / validSlice.length);
      } else {
        smaData.push(null);
      }
    }

    // Combine
    const history = timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      price: closes[i] ? parseFloat(closes[i].toFixed(2)) : null,
      sma: smaData[i] ? parseFloat(smaData[i].toFixed(2)) : null,
    })).filter(d => d.price !== null);

    // Keep last 365 days for the chart
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const filteredHistory = history.filter(d => new Date(d.date) >= oneYearAgo);

    const latest = filteredHistory[filteredHistory.length - 1];

    const output = {
      symbol: SYMBOL,
      updatedAt: new Date().toISOString(),
      currentPrice: latest.price,
      currentSMA: latest.sma,
      history: filteredHistory,
      news: [] // Placeholder for now
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));
    console.log(`Success! Saved to ${DATA_FILE}`);
    console.log(`Price: ${latest.price}, SMA: ${latest.sma}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) console.error(error.response.data);
  }
}

fetchData();
