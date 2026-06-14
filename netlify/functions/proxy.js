exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  };

  const { source, symbols, series_id, path } = event.queryStringParameters || {};
  const AV_KEY = process.env.ALPHA_VANTAGE_KEY || 'T44LJJ94IA9F2XPJ';

  try {
    let data;

    if (source === 'alphavantage') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbols}&apikey=${AV_KEY}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'fred') {
      const FRED_KEY = process.env.FRED_API_KEY || 'b3a3ce23c1a9fc13b4b87e8b4e3f5b6e';
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'binance_futures') {
      const url = `https://fapi.binance.com${path}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'binance_ls') {
      const url = 'https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=5m&limit=1';
      const r = await fetch(url);
      data = await r.json();

    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown source' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
