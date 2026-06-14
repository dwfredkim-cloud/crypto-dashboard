export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { source } = req.query;

  try {
    if (source === 'yahoo') {
      const { symbols } = req.query;
      const url = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbols}&range=1d&interval=5m`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = await r.json();
      res.json(data);

    } else if (source === 'yahoo_quote') {
      const { symbols } = req.query;
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = await r.json();
      res.json(data);

    } else if (source === 'fred') {
      const { series_id } = req.query;
      const FRED_KEY = process.env.FRED_API_KEY || 'b3a3ce23c1a9fc13b4b87e8b4e3f5b6e';
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`;
      const r = await fetch(url);
      const data = await r.json();
      res.json(data);

    } else if (source === 'coinglass_etf') {
      const url = 'https://open-api.coinglass.com/public/v2/etf/bitcoin/flow';
      const r = await fetch(url, { headers: { 'coinglassSecret': process.env.COINGLASS_KEY || '' } });
      const data = await r.json();
      res.json(data);

    } else if (source === 'binance_futures') {
      const { path } = req.query;
      const url = `https://fapi.binance.com${path}`;
      const r = await fetch(url);
      const data = await r.json();
      res.json(data);

    } else if (source === 'binance_ls') {
      const url = 'https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1';
      const r = await fetch(url);
      const data = await r.json();
      res.json(data);

    } else {
      res.status(400).json({ error: 'Unknown source' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
