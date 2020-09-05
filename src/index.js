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
  if(!client.isConnected()) await client.connect();
  const links = client.db("links").collection("link");
  const result = await links.insertOne(data);
  return result;
}

async function getLink(link){
  if(!client.isConnected()) await client.connect();
  const links = client.db("links").collection("link");
  const query = {link};
  const document = await links.findOne(query);
  return document;
}

app.post("/shorten",async (req,res) => {

  let response = {};
  const doc = await getLink(req.body.url);
  if(doc == null){
    response = {shortened: (Math.random() +1).toString(36).substr(2, 5), link: req.body.url};
    const result = await storeLink(response);
    response.success = result.insertedCount;
  }
  else{
    response = {...doc};
    response.success = "1";
  }
  delete response._id;

  res.status(200);
  res.setHeader('Content-Type','application/json');
  res.send(JSON.stringify(response));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});


process.on('SIGTERM',async () => {
  if(client.isConnected()) await client.close();
});

process.on('uncaughtException',(err,origin) => {
  console.error("Error: ",err);
  process.exitCode(1);
})

