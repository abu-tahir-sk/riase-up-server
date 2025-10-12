const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://raise-up:raise-up@cluster0.qha6rup.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
