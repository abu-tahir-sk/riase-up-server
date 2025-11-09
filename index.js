require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//  MongoDB URI
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
    //  Connect MongoDB 
    // await client.connect();
    // console.log(" MongoDB Connected");

    const campaignCollection = client.db("campaignDB").collection("campaign");
    const donationCollection = client.db("campaignDB").collection("donations");

    // Donate API
    app.post("/donate/:id", async (req, res) => {
      try {
        const campaignId = req.params.id;
        const campaign = await campaignCollection.findOne({ _id: new ObjectId(campaignId) });

        if (!campaign) {
          return res.status(404).send({ message: "Campaign not found" });
        }

        //  Deadline Check Fix
        if (!campaign.deadline) {
          return res.status(400).send({ message: "Campaign has no deadline set." });
        }

        const now = new Date();
        const deadline = new Date(campaign.deadline);

        if (deadline.getTime() < now.getTime()) {
          return res.status(400).send({ message: "This campaign's deadline is over. Donation not allowed." });
        }

        const donationData = {
          campaignId: new ObjectId(campaignId),
          campaignTitle: campaign.title,
          ...req.body,
          donatedAt: new Date(),
        };

        const result = await donationCollection.insertOne(donationData);
        res.send({ donationId: result.insertedId });

      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Donation failed" });
      }
    });

    // Get my donations
    app.get("/myDonations", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email is required" });

      const donations = await donationCollection.find({ userEmail: email }).toArray();
      res.send(donations);
    });

    //  Get all campaigns (with sorting)
    app.get("/campaign", async (req, res) => {
      const { sort } = req.query;
      let sortOrder = sort === "desc" ? -1 : 1;

      const result = await campaignCollection.find().sort({ date: sortOrder }).toArray();
      res.send(result);
    });

    // Get my campaigns
    app.get("/myCampaign", async (req, res) => {
      const email = req.query.email;
      const query = email ? { userEmail: email } : {};
      const result = await campaignCollection.find(query).toArray();
      res.send(result);
    });

    //  Get single donation
    app.get("/donate/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const query = { _id: new ObjectId(id), userEmail: email };
      const result = await campaignCollection.findOne(query);
      res.send(result);
    });

    //  Get campaign by ID
    app.get("/campaign/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.findOne(query);
      res.send(result);
    });

    //  Create campaign
    app.post("/campaign", async (req, res) => {
      const result = await campaignCollection.insertOne(req.body);
      res.send(result);
    });

    //  Update campaign
    app.put("/campaign/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = { $set: req.body };
      const result = await campaignCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //  Delete campaign
    app.delete("/campaign/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    });

  } catch (error) {
    console.error(error);
  }
};

run().catch(console.error);

//  Base route
app.get("/", (req, res) => {
  res.send("Raise making server is running ");
});

app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
