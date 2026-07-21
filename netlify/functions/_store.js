const { getStore } = require("@netlify/blobs");

function getVisitStore() {
  const siteID = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_BLOB_READ_WRITE_TOKEN;

  if (siteID && token) {
    return getStore({ name: "site-visits", siteID, token });
  }
  return getStore("site-visits");
}

module.exports = { getVisitStore };
