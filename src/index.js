const express = require('express')
const {MongoClient} = require('mongodb')
const app = express()
//load config from .env files
require('dotenv').config();

const port = process.env.SRV_PORT;

app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL}/<dbname>?retryWrites=true&w=majority`;

const client = new MongoClient(url,{useUnifiedTopology: true});

async function storeLink(data){
  
  await client.connect();
  
  const links = client.db("links").collection("link");
  const result = await links.insertOne(data);
  return result;
  
}

app.post("/shorten",(req,res) => {
  let data = {shortened: (Math.random() +1).toString(36).substr(2, 5), link: req.body.url};
  const result = storeLink(data);
  res.status(200);
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify(data));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

process.on('SIGTERM',async () => {
  if(client.isConnected()) await client.close();
});
