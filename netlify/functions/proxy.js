exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  };

  const { source, symbols, series_id, path } = event.queryStringParameters || {};
  const AV_KEY = process.env.ALPHA_VANTAGE_KEY || 'T44LJJ94IA9F2XPJ';
  const FRED_KEY = process.env.FRED_API_KEY || 'd280921a5171c25f9cf4d3a34cdfca1c';

  try {
    let data;

    if (source === 'alphavantage') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbols}&apikey=${AV_KEY}`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'fred') {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series_id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=1`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'bybit_futures') {
      const url = `https://api.bybit.com/v5/market/tickers?category=linear`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'bybit_oi') {
      const url = `https://api.bybit.com/v5/market/open-interest?category=linear&symbol=${symbols}&intervalTime=5min&limit=1`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'bybit_ls') {
      const url = `https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=1h&limit=1`;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'bybit_funding') {
      const url = `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbols}&limit=1`;
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
