const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qha6rup.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    //     await client.connect();
    //     await client.bd("raise-up").command({ ping: 1 });
    console.log("pinged .............");
  } finally {
    // await client.close()
  }
};
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Raise making server is running");
});

app.listen(port, () => {
  console.log(`${port}`);
});
