const https = require('https');
https.get('https://i.postimg.cc/prf5nQYN/Chat-GPT-Image-Apr-23-2026-09-52-51-AM-(1).png', (res) => {
  const data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    console.log("Image size: " + buffer.length + " bytes");
    // Just a quick heuristic since doing full image processing is hard without libs.
    // Let's print out the first 500 bytes to see if it's a real PNG and has some obvious palette in PLTE.
  });
});
