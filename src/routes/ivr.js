/**
 * IVR Routes
 * Handles all IVR XML endpoints for call flow management
 * 
 * IMPORTANT: All branching logic is done via backend routing.
 * Plivo XML does NOT support conditional statements (<If>, <Else>, etc.)
 */

const express = require('express');
const router = express.Router();

/**
 * Helper function to generate XML response
 * Sets proper Content-Type header for Plivo XML
 */
function sendXML(res, xmlContent) {
  res.set('Content-Type', 'application/xml');
  res.send(xmlContent);
}

/**
 * LEVEL 1: WELCOME - Language Selection Menu
 * GET/POST /ivr/welcome
 * 
 * Entry point for the IVR system
 * Plays greeting and prompts for language selection
 */
router.all('/welcome', (req, res) => {
  console.log('📞 IVR Welcome - Language Selection');
  console.log('Request params:', req.query);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">Welcome to our service. Press 1 for English. Press 2 for Spanish.</Speak>
    <GetDigits 
        action="${process.env.SERVER_URL}/ivr/language-handler" 
        method="POST" 
        timeout="10" 
        numDigits="1" 
        validDigits="12" 
        redirect="true">
        <Speak voice="WOMAN">Please make a selection.</Speak>
    </GetDigits>
    <Speak voice="WOMAN">We did not receive your selection. Please try again.</Speak>
    <Redirect>${process.env.SERVER_URL}/ivr/welcome</Redirect>
</Response>`;

  sendXML(res, xml);
});

/**
 * LANGUAGE HANDLER - Routes based on language selection
 * POST /ivr/language-handler
 * 
 * Callback Parameters (from Plivo):
 * - Digits: User's DTMF input (1 or 2)
 * - CallUUID: Unique identifier for the call
 * 
 * Routing Logic:
 * - Digits == "1" → Redirect to English menu
 * - Digits == "2" → Redirect to Spanish menu
 * - Other → Redirect back to welcome menu
 */
router.post('/language-handler', (req, res) => {
  const digits = req.body.Digits;
  console.log('🔢 Language Handler - Received digits:', digits);
  console.log('Request body:', req.body);

  let xml;

  if (digits === '1') {
    // User selected English
    console.log('✅ Routing to English menu');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect>${process.env.SERVER_URL}/ivr/menu-english</Redirect>
</Response>`;
  } else if (digits === '2') {
    // User selected Spanish
    console.log('✅ Routing to Spanish menu');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Redirect>${process.env.SERVER_URL}/ivr/menu-spanish</Redirect>
</Response>`;
  } else {
    // Invalid input - return to welcome menu
    console.log('❌ Invalid input, returning to welcome');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">Invalid selection.</Speak>
    <Redirect>${process.env.SERVER_URL}/ivr/welcome</Redirect>
</Response>`;
  }

  sendXML(res, xml);
});

/**
 * LEVEL 2: ENGLISH MENU
 * GET/POST /ivr/menu-english
 * 
 * Presents options in English:
 * - Option 1: Hear a pre-recorded message
 * - Option 2: Speak with an associate
 */
router.all('/menu-english', (req, res) => {
  console.log('📞 English Menu');
  console.log('Request params:', req.query);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">You have selected English. Press 1 to hear a message. Press 2 to speak with an associate.</Speak>
    <GetDigits 
        action="${process.env.SERVER_URL}/ivr/english-handler" 
        method="POST" 
        timeout="10" 
        numDigits="1" 
        validDigits="12" 
        redirect="true">
        <Speak voice="WOMAN">Please make a selection.</Speak>
    </GetDigits>
    <Speak voice="WOMAN">We did not receive your selection.</Speak>
    <Redirect>${process.env.SERVER_URL}/ivr/menu-english</Redirect>
</Response>`;

  sendXML(res, xml);
});

/**
 * LEVEL 2: SPANISH MENU
 * GET/POST /ivr/menu-spanish
 * 
 * Presents options in Spanish:
 * - Option 1: Escuchar un mensaje (Hear a message)
 * - Option 2: Hablar con un asociado (Speak with an associate)
 */
router.all('/menu-spanish', (req, res) => {
  console.log('📞 Spanish Menu');
  console.log('Request params:', req.query);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN" language="es-ES">Ha seleccionado español. Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado.</Speak>
    <GetDigits 
        action="${process.env.SERVER_URL}/ivr/spanish-handler" 
        method="POST" 
        timeout="10" 
        numDigits="1" 
        validDigits="12" 
        redirect="true">
        <Speak voice="WOMAN" language="es-ES">Por favor, haga una selección.</Speak>
    </GetDigits>
    <Speak voice="WOMAN" language="es-ES">No recibimos su selección.</Speak>
    <Redirect>${process.env.SERVER_URL}/ivr/menu-spanish</Redirect>
</Response>`;

  sendXML(res, xml);
});

/**
 * ENGLISH OPTION HANDLER
 * POST /ivr/english-handler
 * 
 * Callback Parameters:
 * - Digits: User's DTMF input (1 or 2)
 * 
 * Routing Logic:
 * - Digits == "1" → Play audio file and hangup
 * - Digits == "2" → Forward call to associate
 * - Other → Return to English menu
 */
router.post('/english-handler', (req, res) => {
  const digits = req.body.Digits;
  console.log('🔢 English Handler - Received digits:', digits);
  console.log('Request body:', req.body);

  let xml;

  if (digits === '1') {
    // Play audio message
    console.log('✅ Playing audio message');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">Please listen to this message.</Speak>
    <Play>${process.env.AUDIO_FILE_URL}</Play>
    <Speak voice="WOMAN">Thank you for calling. Goodbye.</Speak>
    <Hangup/>
</Response>`;
  } else if (digits === '2') {
    // Forward to associate
    console.log('✅ Forwarding to associate');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">Please hold while we connect you to an associate.</Speak>
    <Dial>${process.env.ASSOCIATE_NUMBER}</Dial>
    <Speak voice="WOMAN">The associate is not available. Goodbye.</Speak>
    <Hangup/>
</Response>`;
  } else {
    // Invalid input - return to English menu
    console.log('❌ Invalid input, returning to English menu');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN">Invalid selection.</Speak>
    <Redirect>${process.env.SERVER_URL}/ivr/menu-english</Redirect>
</Response>`;
  }

  sendXML(res, xml);
});

/**
 * SPANISH OPTION HANDLER
 * POST /ivr/spanish-handler
 * 
 * Callback Parameters:
 * - Digits: User's DTMF input (1 or 2)
 * 
 * Routing Logic:
 * - Digits == "1" → Play audio file and hangup
 * - Digits == "2" → Forward call to associate
 * - Other → Return to Spanish menu
 */
router.post('/spanish-handler', (req, res) => {
  const digits = req.body.Digits;
  console.log('🔢 Spanish Handler - Received digits:', digits);
  console.log('Request body:', req.body);

  let xml;

  if (digits === '1') {
    // Play audio message
    console.log('✅ Playing audio message (Spanish)');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN" language="es-ES">Por favor, escuche este mensaje.</Speak>
    <Play>${process.env.AUDIO_FILE_URL}</Play>
    <Speak voice="WOMAN" language="es-ES">Gracias por llamar. Adiós.</Speak>
    <Hangup/>
</Response>`;
  } else if (digits === '2') {
    // Forward to associate
    console.log('✅ Forwarding to associate (Spanish)');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN" language="es-ES">Por favor, espere mientras lo conectamos con un asociado.</Speak>
    <Dial>${process.env.ASSOCIATE_NUMBER}</Dial>
    <Speak voice="WOMAN" language="es-ES">El asociado no está disponible. Adiós.</Speak>
    <Hangup/>
</Response>`;
  } else {
    // Invalid input - return to Spanish menu
    console.log('❌ Invalid input, returning to Spanish menu');
    xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Speak voice="WOMAN" language="es-ES">Selección inválida.</Speak>
    <Redirect>${process.env.SERVER_URL}/ivr/menu-spanish</Redirect>
</Response>`;
  }

  sendXML(res, xml);
});

/**
 * HANGUP HANDLER (Optional)
 * GET/POST /ivr/hangup
 * 
 * Called when a call ends
 * Useful for logging and analytics
 */
router.all('/hangup', (req, res) => {
  console.log('📴 Call ended');
  console.log('Hangup details:', req.query);
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Hangup/>
</Response>`;
  
  sendXML(res, xml);
});

module.exports = router;
