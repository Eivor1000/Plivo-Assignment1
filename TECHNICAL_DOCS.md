# Plivo IVR System - Technical Documentation

## System Architecture

### Overview

This IVR system implements a stateless, event-driven architecture using Plivo's XML-based call control mechanism. All call state is managed by Plivo's platform, while our backend serves as a dynamic XML generator based on user input.

## Key Design Decisions

### 1. No Conditional Logic in XML

**Problem:** Plivo XML does not support conditional statements (`<If>`, `<Else>`, `<Switch>`)

**Solution:** All branching logic is implemented via:
- Backend routing that parses DTMF input
- Dynamic XML generation based on the input
- HTTP callbacks from Plivo to our endpoints

**Example Flow:**
```
User presses "1" 
  → Plivo sends POST to /ivr/language-handler with Digits=1
  → Backend parses Digits parameter
  → Backend returns XML with <Redirect> to /ivr/menu-english
  → Plivo fetches English menu XML
  → User hears English options
```

### 2. Stateless Design

Each IVR endpoint is completely stateless. The call state is:
- Maintained by Plivo's platform
- Passed via URL parameters (Digits, CallUUID, etc.)
- Not stored in our backend (no database required)

Benefits:
- Simple to scale horizontally
- No session management complexity
- Easy to debug (each request is independent)

### 3. XML Response Pattern

All IVR endpoints follow this pattern:

```javascript
function sendXML(res, xmlContent) {
  res.set('Content-Type', 'application/xml');
  res.send(xmlContent);
}
```

Critical requirements:
- Content-Type MUST be `application/xml`
- XML MUST start with `<?xml version="1.0" encoding="UTF-8"?>`
- Root element MUST be `<Response>`

## Plivo XML Verbs Used

### 1. `<Speak>`

Converts text to speech using TTS engine.

```xml
<Speak voice="WOMAN" language="en-US">
    Welcome to our service.
</Speak>
```

**Attributes:**
- `voice`: WOMAN, MAN (default: MAN)
- `language`: en-US, es-ES, etc.

**Use Cases:**
- Welcome messages
- Menu options
- Error messages
- Confirmations

### 2. `<GetDigits>`

Captures DTMF (touch-tone) input from user.

```xml
<GetDigits 
    action="https://your-server.com/handler" 
    method="POST" 
    timeout="10" 
    numDigits="1" 
    validDigits="12" 
    redirect="true">
    <Speak>Please make a selection.</Speak>
</GetDigits>
```

**Attributes:**
- `action`: URL to POST captured digits
- `method`: POST or GET (we use POST)
- `timeout`: Seconds to wait for input (10)
- `numDigits`: Number of digits to capture (1)
- `validDigits`: Which digits are valid ("12")
- `redirect`: Auto-redirect to action URL (true)

**Callback Parameters:**
Plivo sends these parameters to your action URL:
- `Digits`: The captured DTMF input
- `CallUUID`: Unique call identifier
- `From`: Caller's phone number
- `To`: Called phone number

### 3. `<Redirect>`

Transfers call to another XML endpoint.

```xml
<Redirect>https://your-server.com/ivr/menu-english</Redirect>
```

**Use Cases:**
- Routing between menus
- Handling invalid input (return to previous menu)
- Timeout handling

**Important:** The URL must return valid Plivo XML.

### 4. `<Play>`

Plays an audio file from a URL.

```xml
<Play>https://example.com/audio.mp3</Play>
```

**Requirements:**
- URL must be publicly accessible
- File must be MP3 format
- HTTPS recommended
- No authentication required

**Use Cases:**
- Pre-recorded messages
- Music on hold
- Announcements

### 5. `<Dial>`

Connects the current call to another phone number.

```xml
<Dial>+1234567890</Dial>
```

**Use Cases:**
- Forwarding to agents
- Call transfer
- Conference calls (with additional attributes)

**Important:** Number must be in E.164 format.

### 6. `<Hangup>`

Terminates the call.

```xml
<Hangup/>
```

**Use Cases:**
- End of call flow
- After playing messages
- Error conditions

## Call Flow State Machine

### States

1. **WELCOME**: Initial language selection
2. **ENGLISH_MENU**: English options menu
3. **SPANISH_MENU**: Spanish options menu
4. **AUDIO_PLAYBACK**: Playing recorded message
5. **CALL_TRANSFER**: Forwarding to associate
6. **HANGUP**: Call terminated

### Transitions

```
WELCOME --[Press 1]--> ENGLISH_MENU
WELCOME --[Press 2]--> SPANISH_MENU
WELCOME --[Invalid/Timeout]--> WELCOME

ENGLISH_MENU --[Press 1]--> AUDIO_PLAYBACK --> HANGUP
ENGLISH_MENU --[Press 2]--> CALL_TRANSFER --> HANGUP
ENGLISH_MENU --[Invalid/Timeout]--> ENGLISH_MENU

SPANISH_MENU --[Press 1]--> AUDIO_PLAYBACK --> HANGUP
SPANISH_MENU --[Press 2]--> CALL_TRANSFER --> HANGUP
SPANISH_MENU --[Invalid/Timeout]--> SPANISH_MENU
```

## Error Handling Strategy

### 1. Invalid DTMF Input

**Strategy:** Redirect to current menu

```javascript
if (digits !== '1' && digits !== '2') {
  return xml = `
    <Response>
      <Speak>Invalid selection.</Speak>
      <Redirect>${currentMenuUrl}</Redirect>
    </Response>`;
}
```

### 2. Timeout (No Input)

**Strategy:** Fallback message in GetDigits, then redirect

```xml
<GetDigits action="/handler" ...>
  <Speak>Please make a selection.</Speak>
</GetDigits>
<Speak>We did not receive your selection.</Speak>
<Redirect>/ivr/welcome</Redirect>
```

### 3. API Errors

**Strategy:** Try-catch with logging

```javascript
try {
  const response = await plivoClient.calls.create(...);
  return res.json({ success: true, ... });
} catch (error) {
  console.error('API Error:', error);
  return res.status(500).json({ 
    success: false, 
    error: error.message 
  });
}
```

### 4. Missing Parameters

**Strategy:** Early validation with 400 response

```javascript
if (!to_number) {
  return res.status(400).json({
    success: false,
    error: 'Missing required field: to_number'
  });
}
```

## Security Considerations

### 1. Input Validation

**Phone Numbers:**
```javascript
const phoneRegex = /^\+[1-9]\d{1,14}$/;
if (!phoneRegex.test(to_number)) {
  return res.status(400).json({
    error: 'Invalid phone number format'
  });
}
```

### 2. Rate Limiting

Recommended implementation:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requests per window
});
app.use('/trigger-call', limiter);
```

### 3. Environment Variables

- Never commit `.env` file
- Use strong Auth Tokens
- Rotate credentials regularly
- Use HTTPS in production

### 4. SSRF Protection

- Validate all user-provided URLs
- Whitelist allowed domains for audio files
- Don't allow arbitrary redirects

## Performance Optimization

### 1. Response Time

- Keep XML generation fast (<100ms)
- Use template strings (already implemented)
- No database queries in IVR flow

### 2. Caching

Not needed because:
- XML is dynamically generated based on input
- No static content to cache
- Each request is unique

### 3. Scalability

System is horizontally scalable because:
- No state stored in backend
- No database required
- Each request is independent

Can scale by:
- Adding more server instances
- Using load balancer
- No coordination needed between instances

## Monitoring and Observability

### Recommended Logging

```javascript
// Request logging (already implemented)
app.use(morgan('dev'));

// Custom logging for IVR events
console.log('📞 IVR Event:', {
  type: 'language_selection',
  digits: req.body.Digits,
  callUUID: req.body.CallUUID,
  timestamp: new Date().toISOString()
});
```

### Key Metrics to Track

1. **Call Volume**
   - Calls initiated per hour
   - Peak usage times

2. **Success Rate**
   - Percentage of successful call connections
   - Failed call reasons

3. **User Behavior**
   - Language preference distribution
   - Menu option selection frequency
   - Average call duration

4. **Performance**
   - API response times
   - XML generation time
   - Plivo API latency

### Error Monitoring

Recommended tools:
- **Sentry**: Exception tracking
- **Datadog**: APM and metrics
- **LogRocket**: Session replay
- **Plivo Console**: Call logs and debugging

## Testing Strategy

### 1. Unit Tests

Test individual route handlers:
```javascript
describe('Language Handler', () => {
  it('should redirect to English menu when digits is 1', () => {
    const req = { body: { Digits: '1' } };
    const res = { /* mock response */ };
    // Test handler logic
  });
});
```

### 2. Integration Tests

Test full call flow:
```javascript
describe('Full IVR Flow', () => {
  it('should complete English audio playback flow', async () => {
    // 1. Trigger call
    // 2. Select English
    // 3. Select audio playback
    // 4. Verify hangup
  });
});
```

### 3. Manual Testing

Use the testing checklist in README.md:
- Test each menu option
- Test invalid inputs
- Test timeouts
- Test with real phone calls

## Troubleshooting Guide

### Debug Checklist

1. **Check Server Logs**
   - Look for incoming request logs
   - Verify Digits parameter is received
   - Check for error messages

2. **Verify Environment Variables**
   ```bash
   node -e "require('dotenv').config(); console.log(process.env)"
   ```

3. **Test ngrok Connection**
   ```bash
   curl https://your-ngrok-url.ngrok.io/health
   ```

4. **Check Plivo Console**
   - Review call logs
   - Check XML responses
   - Verify number configuration

5. **Validate XML Syntax**
   - Copy XML from logs
   - Validate against Plivo XML schema
   - Check for typos in URLs

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error tracking set up
- [ ] Health check endpoint verified
- [ ] Phone numbers tested
- [ ] Audio files accessible
- [ ] Documentation updated
- [ ] Team trained on system

### Deployment Steps

1. **Choose Platform** (Heroku, AWS, Digital Ocean)
2. **Set Environment Variables**
3. **Deploy Code**
4. **Update Plivo Configuration**
5. **Run Integration Tests**
6. **Monitor Logs**
7. **Test with Real Calls**

### Post-Deployment

- Monitor error rates
- Check call success rates
- Review user feedback
- Analyze call logs
- Optimize based on metrics

## Future Enhancements

### Possible Features

1. **Call Recording**
   ```xml
   <Dial record="true" recordCallback="https://...">
   ```

2. **Voicemail**
   ```xml
   <Record action="https://.../voicemail" maxLength="60"/>
   ```

3. **Multi-Level Menus**
   - Add more menu levels
   - Department routing
   - Callback scheduling

4. **Analytics Dashboard**
   - Real-time call metrics
   - User behavior analysis
   - Performance monitoring

5. **Speech Recognition**
   - Voice commands instead of DTMF
   - Natural language processing

6. **Database Integration**
   - Store call history
   - Track user preferences
   - Analytics and reporting

## Conclusion

This IVR system demonstrates a production-ready implementation of Plivo Voice API with:
- Clean architecture
- Proper error handling
- Comprehensive documentation
- Production best practices

It's ready for technical interviews and can be extended for real-world use cases.
