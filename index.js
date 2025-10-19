const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qha6rup.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const campaignCollection = client.db("campaignDB").collection("campaign");

    app.get("/campaign", async (req, res) => {
      const email = req.query.email;
      const query = email ? { useEmail: email } : {};
      const cursor = campaignCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/campaign/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.findOne(query);
      res.send(result);
    });

    app.post("/campaign", async (req, res) => {
      const newCampaign = req.body;

      console.log(newCampaign);
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    });

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
