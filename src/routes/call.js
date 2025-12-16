/**
 * Call Routes
 * Handles outbound call trigger endpoint
 */

const express = require('express');
const router = express.Router();
const plivoClient = require('../utils/plivo-client');

/**
 * POST /trigger-call
 * Initiates an outbound call using Plivo REST API
 * 
 * Request Body:
 * {
 *   "to_number": "+1234567890"  // Destination phone number in E.164 format
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Call initiated successfully",
 *   "call_uuid": "unique-call-id"
 * }
 */
router.post('/trigger-call', async (req, res) => {
  try {
    const { to_number } = req.body;

    // Validate phone number
    if (!to_number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: to_number'
      });
    }

    // Basic phone number format validation (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to_number)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)'
      });
    }

    console.log(`📞 Initiating call to: ${to_number}`);

    // Make the call using Plivo API
    // answer_url points to the IVR welcome menu
    const response = await plivoClient.calls.create(
      process.env.PLIVO_FROM_NUMBER,  // From number (your Plivo number)
      to_number,                       // To number (destination)
      `${process.env.SERVER_URL}/ivr/welcome`,  // Answer URL (IVR entry point)
      {
        answerMethod: 'GET'
      }
    );

    console.log('✅ Call initiated successfully:', response);

    res.json({
      success: true,
      message: 'Call initiated successfully',
      call_uuid: response.callUuid,
      api_id: response.apiId
    });

  } catch (error) {
    console.error('❌ Error initiating call:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate call',
      message: error.message
    });
  }
});

module.exports = router;
