const https = require('https');

https.get('https://capstone-project-registration-tool.onrender.com/api/topic-reviewers/topic/64', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
}).on('error', err => console.error(err));
