# Real-Time Google Sheets Synchronization Guide

This guide explains how to connect your **Campus Plastic Credits Portal** to Google Sheets in real time so administrators, faculty, and NAAC coordinators can view, analyze, and chart live campus plastic collection data.

---

## Method 1: The Instant Live Feed Formula (Zero Setup — Recommended)

Google Sheets has a built-in formula that dynamically pulls real-time CSV feeds directly from your portal API.

### Step 1: Open a Blank Google Sheet
1. Go to [sheets.new](https://sheets.new) to create a new spreadsheet.
2. Name it **"Campus Plastic Credits - Real Time Ledger"**.

### Step 2: Paste the Feed Formula
In cell **`A1`**, paste this formula:

```excel
=IMPORTDATA("https://YOUR-APP-DOMAIN.vercel.app/api/sheets/feed?type=entries")
```
*(For local testing on localhost, use `http://localhost:3000/api/sheets/feed?type=entries`)*

### Result:
Google Sheets immediately creates the following structured columns and populates every student drop entry in real-time:

| Timestamp | Entry ID | Student Name | Roll Number | Department | Bin Name | Bin Code | Plastic Category | Items Dropped | Points | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 2026-09-28 11:42:00 | ent-101 | Aditya Kumar | 24CS108 | Computer Science | Cafeteria Station A | 7K3Q9DX2 | Small Bottle (<750ml) | 4 | 20 | pending |
| 2026-09-28 10:15:00 | ent-102 | Pooja Sharma | 23CS042 | Computer Science | Library Quad Bin | 9MN42BC8 | Medium Bottle (1L-1.5L) | 6 | 48 | verified |

---

### Step 3: Add Batch Weighings Sheet (Optional)
Create a second tab in Google Sheets named **"Weighing Batches"** and paste in cell **`A1`**:

```excel
=IMPORTDATA("https://YOUR-APP-DOMAIN.vercel.app/api/sheets/feed?type=batches")
```

---

## Method 2: Instant Push Webhook via Google Apps Script (1-Second Real-Time Append)

If you want new entries to automatically append to the sheet the moment a student drops plastic:

### Step 1: Create a Google Apps Script
1. Inside your Google Sheet, click **Extensions** > **Apps Script**.
2. Replace all code in `Code.gs` with this simple script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var d = payload.data || payload;

    // If sheet is empty, create headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Entry ID",
        "Student Name",
        "Roll Number",
        "Department",
        "Bin Name",
        "Bin Code",
        "Plastic Category",
        "Items Dropped",
        "Points",
        "Status"
      ]);
    }

    // Append new live row
    sheet.appendRow([
      d.timestamp || new Date().toISOString(),
      d.id || "N/A",
      d.student_name || "Student",
      d.roll_no || "N/A",
      d.department || "General",
      d.bin_name || "Drop Station",
      d.bin_code || "N/A",
      d.category || "Plastic Bottle",
      d.items || 1,
      d.points || 5,
      d.status || "pending"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 2: Deploy Web App
1. In Apps Script, click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Set **Execute as:** `Me (your email)`.
4. Set **Who has access:** `Anyone`.
5. Click **Deploy** and copy the **Web app URL** (starts with `https://script.google.com/macros/s/...`).

### Step 3: Set Webhook in Vercel / Environment
In your `.env.local` or Vercel project settings, set:
```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID/exec
```

Now, every drop and batch verification will automatically append a new row to your Google Sheet in real time!
