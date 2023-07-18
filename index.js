require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();


const bodyParser = require('body-parser');
const dns = require('dns')
const { URL } = require('url')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urls = []

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  let count = urls.length + 1

  let original_url = req.body.url
  let short_url = count

  let regExp = /https:\/\/|http:\/\/|fpt:\/\//

  if (!regExp.test(original_url)) {
    res.json({ error: 'Invalid URL' })
    return
  }

  let existing = urls.filter(obj => obj.original_url === original_url)

  if (existing[0]) {
    res.json(existing[0])
    return
  }

  //No me pasaba las pruebas sin el uso de new URL()
  //Idea tomada de Gabriel Real

  try{
    let URLObject = new URL(original_url)

    dns.lookup(URLObject.hostname, (error, addresses) => {
      if (error || !addresses) {
        res.json({ error: 'Invalid URL' })
        return
      }

      let obj = {
        original_url,
        short_url
      }

      urls.push(obj)
      res.json(obj)
    })

  } catch {
    res.json({ error: 'Invalid URL' })
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  let { short_url } = req.params
  let existing = urls.filter(obj => obj.short_url === parseInt(short_url))

  if (!existing[0]) {
    res.json({ error: 'Short URL doesn\'t exist.' })
    return
  }

  res.redirect(existing[0].original_url)
})

app.listen(port, function() {
  console.log(`Listening on port http://localhost:${port}`);
});
