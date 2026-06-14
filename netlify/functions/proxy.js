exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  };

  const params = event.queryStringParameters || {};
  const source = params.source;
  const symbols = params.symbols;
  const series_id = params.series_id;
  const AV_KEY = process.env.ALPHA_VANTAGE_KEY || 'T44LJJ94IA9F2XPJ';
  const FRED_KEY = process.env.FRED_API_KEY || 'd280921a5171c25f9cf4d3a34cdfca1c';

  try {
    let data;

    if (source === 'alphavantage') {
      const url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbols + '&apikey=' + AV_KEY;
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'fred') {
      const url = 'https://api.stlouisfed.org/fred/series/observations?series_id=' + series_id + '&api_key=' + FRED_KEY + '&file_type=json&sort_order=desc&limit=1';
      const r = await fetch(url);
      data = await r.json();

    } else if (source === 'okx_futures') {
      const url = 'https://www.okx.com/api/v5/market/tickers?instType=SWAP';
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      data = await r.json();

    } else if (source === 'okx_funding') {
      const instId = params.instId || 'BTC-USDT-SWAP';
      const url = 'https://www.okx.com/api/v5/public/funding-rate?instId=' + instId;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      data = await r.json();

    } else if (source === 'okx_oi') {
      const instId = params.instId || 'BTC-USDT-SWAP';
      const url = 'https://www.okx.com/api/v5/rubik/stat/contracts/open-interest-volume?ccy=BTC&period=5m';
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      data = await r.json();

    } else if (source === 'okx_ls') {
      const url = 'https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=BTC&period=5m';
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      data = await r.json();

    } else {
      return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Unknown source' }) };
    }

    return { statusCode: 200, headers: headers, body: JSON.stringify(data) };

  } catch (e) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: e.message }) };
  }
};
