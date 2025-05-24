require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Fix private key line breaks
const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  privateKey,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.SPREADSHEET_ID;
const sheetName = "Sheet1";

app.post("/api/contact", async (req, res) => {
  const {
    name,
    email,
    phone,
    location,
    businessType,
    interest = [],
    contactMethod,
    message,
  } = req.body;

  try {
    const values = [[
      name,
      email,
      phone,
      location,
      businessType,
      interest.join(", "),
      contactMethod,
      message,
      new Date().toLocaleString(),
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      resource: { values },
    });

    res.status(200).json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error storing data in sheet:", error);
    res.status(500).json({ success: false, message: "Failed to submit form" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
