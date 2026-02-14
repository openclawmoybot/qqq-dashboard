import fs from 'fs';
import path from 'path';
import StockChart from './components/StockChart';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

async function getData() {
  const filePath = path.join(process.cwd(), 'app/data.json');
  const file = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(file);
}

export default async function Home() {
  const data = await getData();
  const { currentPrice, currentSMA, updatedAt, history } = data;
  
  const isBullish = currentPrice > currentSMA;
  const trendColor = isBullish ? 'text-green-500' : 'text-red-500';
  const trendIcon = isBullish ? <ArrowUp className="w-6 h-6" /> : <ArrowDown className="w-6 h-6" />;

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-1">QQQ Dashboard</h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Last updated: {new Date(updatedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-gray-900 p-4 rounded-xl border border-gray-800">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Current Price</p>
              <p className="text-3xl font-bold text-white">${currentPrice.toFixed(2)}</p>
            </div>
            <div className="h-10 w-px bg-gray-700"></div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">30-Week SMA</p>
              <p className="text-3xl font-bold text-yellow-500">${currentSMA.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isBullish ? 'bg-green-500/10' : 'bg-red-500/10'} ${trendColor}`}>
              {trendIcon}
              <span className="font-bold text-lg">{isBullish ? 'BULLISH' : 'BEARISH'}</span>
            </div>
          </div>
        </header>

        {/* Chart Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Price vs 30-Week SMA</h2>
          </div>
          <StockChart data={history} />
        </section>

        {/* News Section (Placeholder) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Market Events</h2>
            <div className="text-gray-400 text-sm">
              <p>No major market events fetched today.</p>
              {/* Future: Map over data.news */}
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
             <h2 className="text-xl font-semibold text-white mb-4">Trading Signals</h2>
             <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${isBullish ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-white font-medium">Trend Status</p>
                    <p className="text-gray-400 text-sm">
                      QQQ is currently trading <span className={trendColor}>{isBullish ? 'ABOVE' : 'BELOW'}</span> the 30-week moving average.
                    </p>
                  </div>
                </li>
             </ul>
          </div>
        </section>

      </div>
    </main>
  );
}
