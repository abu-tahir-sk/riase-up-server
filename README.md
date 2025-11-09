# RAISE UP

---    https://rise-up-html.netlify.app/

## Details Page Backend Documentation

### Endpoint: Donate to a Campaign

POST /donate/:id

- This endpoint is called from the Details Page when a user clicks Donate.

- It validates the deadline before adding the donation.

### Backend Logic (Deadline Check)

import { ObjectId } from "mongodb";

app.post("/donate/:id", async (req, res) => {
  const campaignId = req.params.id;
  const campaign = await campaignCollection.findOne({ _id: new ObjectId(campaignId) });

  if (!campaign) {
    return res.status(404).send({ message: "Campaign not found" });
  }

  const now = new Date();
  const deadline = new Date(campaign.date);

  if (deadline.getTime() < now.getTime()) {
    return res.status(400).send({
      message: "This campaign's deadline is over. Donation not allowed."
    });
  }

  const donationData = {
    ...req.body,
    campaignId: new ObjectId(campaignId),
    donatedAt: new Date()
  };

  const result = await donationCollection.insertOne(donationData);

  res.send({
    success: true,
    message: "Donation successful!",
    donationId: result.insertedId
  });
});

🔹 Notes for Details Page

Deadline Check: Compare new Date(campaign.date).getTime() with new Date().getTime().

Frontend Behavior:

If status 400 → show toast: “Deadline is over”

If status 200 → show SweetAlert modal: “Donation successful”

Data Consistency: Always send the campaign details from the frontend to backend for recording donation.

🔹 Example Flow

User opens Details Page → sees campaign info.

Clicks Donate.

Frontend calls /donate/:id with campaign and user info.

Backend validates deadline:

✅ If valid → insert donation, return success

❌ If expired → return error message

Frontend shows modal or toast based on response.