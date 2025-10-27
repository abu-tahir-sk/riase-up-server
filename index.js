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
    const campaignCollection = client.db("campaignDB").collection("campaign");
    const donationCollection = client.db("campaignDB").collection("donations");

    app.post("/donate/:id", async (req, res) => {
      const campaignId = req.params.id;
      const {
        userEmail,
        userName,
        thumbnail,
        title,
        campaignType,
        description,
        count,
        date,
      } = req.body;

      const campaign = await campaignCollection.findOne({
        _id: new ObjectId(campaignId),
      });

      const now = new Date();
      const deadline = new Date(campaign.deadline);

      if (deadline.getTime() < now.getTime()) {
    // deadline over
    return res.status(400).send({
      message: "This campaign's deadline is over. Donation not allowed.",
    });
  }


      const donationData = {
        campaignId: new ObjectId(campaignId),
        campaignTitle: campaign.title,
        userEmail,
        userName,
        thumbnail,
        title,
        campaignType,
        description,
        count,
        date,
        campaignId: new ObjectId(campaignId),
        donatedAt: new Date(),
      };
      const result = await donationCollection.insertOne(donationData);

      res.send({
        donationId: result.insertedId,
      });
    });

    app.get("/myDonations", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ message: "Email is required" });
      const donations = await donationCollection
        .find({ userEmail: email })
        .toArray();
      res.send(donations);
    });

    //  all campaigns
    app.get("/campaign", async (req, res) => {
      const { sort } = req.query;
      let sortOrder = 1;
      if (sort === "desc") sortOrder = -1;
     
      const result = await campaignCollection
        .find()
        .sort({ date: sortOrder })
        .toArray();
      res.send(result);
    });

    app.get("/myCampaign", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = { userEmail: email };
      }
      const result = await campaignCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/donate/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;

      const query = { _id: new ObjectId(id), userEmail: email };
      const result = await campaignCollection.findOne(query);

      res.send(result);
    });

    app.get("/campaign/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.findOne(query);
      res.send(result);
    });

    //  campaign
    app.post("/campaign", async (req, res) => {
      const newCampaign = req.body;
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    });

    //  update campaign
    app.put("/campaign/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCampaign = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          thumbnail: updatedCampaign.thumbnail,
          title: updatedCampaign.title,
          campaignType: updatedCampaign.campaignType,
          description: updatedCampaign.description,
          count: updatedCampaign.count,
          date: updatedCampaign.date,
          userEmail: updatedCampaign.userEmail,
          userName: updatedCampaign.userName,
        },
      };

      const result = await campaignCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete campaign
    app.delete("/campaign/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    });

   
  } catch (error) {
    
  }
};

run().catch();

app.get("/", (req, res) => {
  res.send("Raise making server is running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
