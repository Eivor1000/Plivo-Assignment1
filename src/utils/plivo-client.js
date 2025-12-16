/**
 * Plivo Client Utility
 * Initializes and exports the Plivo client for making API calls
 */

const plivo = require('plivo');

// Initialize Plivo client with credentials from environment variables
const client = new plivo.Client(
  process.env.PLIVO_AUTH_ID,
  process.env.PLIVO_AUTH_TOKEN
);

module.exports = client;
