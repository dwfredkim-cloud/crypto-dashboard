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

    } else if (source === 'etf_flow') {
      // Yahoo Finance: IBIT 7일 히스토리로 ETF 순유입 추정
      // period1 = 8일 전, period2 = 오늘 (unix timestamp)
      const now = Math.floor(Date.now() / 1000);
      const week = now - 8 * 86400;
      // 주요 BTC ETF 티커들
      const etfTickers = ['IBIT', 'FBTC', 'BITB', 'ARKB', 'BTCO'];
      const results = [];
      for (const ticker of etfTickers) {
        try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&period1=${week}&period2=${now}`;
          const r = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            }
          });
          const json = await r.json();
          const result = json?.chart?.result?.[0];
          if (!result) continue;
          const closes = result.indicators?.quote?.[0]?.close || [];
          const volumes = result.indicators?.quote?.[0]?.volume || [];
          const timestamps = result.timestamp || [];
          // 최근 7거래일 데이터만
          const days = Math.min(7, closes.length);
          let netFlow = 0;
          for (let i = closes.length - days; i < closes.length; i++) {
            if (!closes[i] || !volumes[i]) continue;
            // 순유입 추정: 전일 대비 가격 변화율 vs 거래량으로 방향 추정
            // 단순히 volume * price 합산 (양방향이지만 대략적 규모)
            netFlow += closes[i] * volumes[i];
          }
          results.push({ ticker, netFlow, days });
        } catch(e) {
          results.push({ ticker, error: e.message });
        }
      }
      // IBIT만 정확한 AUM 추정에 사용
      const ibit = results.find(r => r.ticker === 'IBIT');
      data = { results, ibit, source: 'yahoo_finance' };

    } else if (source === 'etf_ibit') {
      // IBIT 단일 - 최근 종가 기준 AUM 추정
      const now = Math.floor(Date.now() / 1000);
      const week = now - 10 * 86400;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/IBIT?interval=1d&period1=${week}&period2=${now}`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      data = await r.json();

    } else {
      return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Unknown source' }) };
    }

    return { statusCode: 200, headers: headers, body: JSON.stringify(data) };

  } catch (e) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: e.message }) };
  }
};
