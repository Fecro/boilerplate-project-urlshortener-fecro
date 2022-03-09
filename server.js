/* Importing Event Variables */
require('dotenv').config();
/* Importing Modules */
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortId = require('shortid');
const validUrl = require('valid-url');
const dns = require('dns');

const app = express();

/* Port Configuration */
const port = process.env.PORT || 3000;
/* Mongo Connection */
mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection: error'));
connection.once('open', () => {
  console.log("MongoDB connected")
});
/* DB Schema */
const { Schema } = mongoose;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
let Url = mongoose.model('Url', urlSchema);

/* App Use */
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/', async (req, res) => {
  const url = req.body.url;
  const urlShort = shortId.generate();

  if (!validUrl.isWebUri(url)) {
    res.json({
      error: "invalid url"
    });
  } else {
    let findUrl = await Url.findOne({
      original_url: url
    });
    if(findUrl){
      res.json({
        original_url: findUrl.original_url,
        short_url: findUrl.short_url
      });
    } else {
      findOne = new Url({
        original_url: url,
        short_url: urlShort
      });
      await findOne.save();
      res.json({
        original_url: findOne.original_url,
        short_url: findOne.short_url
      });
    }
  }
});

app.get("/api/shorturl/:id?", async (req, res) => {
  const url = await Url.findOne({
    short_url: req.params.id
  });
  if (url) {
    res.redirect(url.original_url);
  } else {
    res.status(404).json({error: 'No URL found'});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
