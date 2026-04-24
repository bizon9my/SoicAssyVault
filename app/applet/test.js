import getColors from 'get-image-colors';
import https from 'https';

https.get('https://i.postimg.cc/prf5nQYN/Chat-GPT-Image-Apr-23-2026-09-52-51-AM-(1).png', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    const data = [];
    res.on('data', c => data.push(c));
    res.on('end', () => {
        const buffer = Buffer.concat(data);
        getColors(buffer, 'image/png').then(colors => {
            console.log("Colors:", colors.map(color => color.hex()));
        }).catch(e => console.error(e));
    });
});
