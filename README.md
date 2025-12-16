# Plivo IVR System Demo

A production-ready Interactive Voice Response (IVR) system built with Plivo Voice API, featuring multi-language support (English/Spanish), dynamic call routing, and professional call flow management.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Call Flow](#call-flow)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## 🎯 Overview

This IVR system demonstrates a complete production-ready implementation using Plivo Voice API. It showcases:

- **Outbound call initiation** via REST API
- **Multi-level IVR menus** with language selection
- **DTMF input processing** for user interactions
- **Audio playback** capabilities
- **Call forwarding** to live agents
- **Proper error handling** and timeout management

## ✨ Features

- 🌐 **Multi-language Support**: English and Spanish menus
- 📞 **Outbound Calls**: Trigger calls programmatically via REST API
- 🎵 **Audio Playback**: Play pre-recorded messages
- 👤 **Call Forwarding**: Route calls to human associates
- 🔄 **Smart Routing**: Dynamic XML generation based on user input
- 📝 **Comprehensive Logging**: Detailed request/response logging
- 🛡️ **Error Handling**: Graceful handling of timeouts and invalid inputs
- ✅ **Input Validation**: Phone number format validation

## 🏗️ Architecture

### Technology Stack

- **Backend**: Node.js with Express.js
- **Voice API**: Plivo Voice API
- **Call Control**: XML-based (Plivo XML)
- **Environment Management**: dotenv

### System Design

```
┌─────────────┐
│   Client    │
│  (Trigger)  │
└──────┬──────┘
       │ POST /trigger-call
       ▼
┌─────────────────────┐
│   Express Server    │
│  (Your Backend)     │
└──────┬──────────────┘
       │ Plivo REST API
       ▼
┌─────────────────────┐
│   Plivo Platform    │
│  (Makes Call)       │
└──────┬──────────────┘
       │ Call connects
       ▼
┌─────────────────────┐
│  Recipient Phone    │
│  (Answers Call)     │
└──────┬──────────────┘
       │ Requests XML
       ▼
┌─────────────────────┐
│   IVR Endpoints     │
│  (Serve XML)        │
└─────────────────────┘
```

### IVR Logic Flow

The system uses **backend routing** for all conditional logic. Plivo XML does NOT support conditional statements (`<If>`, `<Else>`). All branching is handled by:

1. **`<GetDigits>`** captures user input via DTMF
2. **Action URLs** receive the input as parameters
3. **Backend routes** parse the digits and return appropriate XML responses

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v14 or higher)
   ```bash
   node --version
   ```

2. **Plivo Account**
   - Sign up at [Plivo Console](https://console.plivo.com/)
   - Get your Auth ID and Auth Token
   - Purchase a phone number

3. **ngrok** (for local development)
   - Download from [ngrok.com](https://ngrok.com/download)
   - Used to expose your local server to the internet

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd plivo-ivr-demo
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `plivo` - Plivo SDK
- `dotenv` - Environment variable management
- `morgan` - HTTP request logger

### Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your credentials:
   ```env
   PLIVO_AUTH_ID=your_actual_auth_id
   PLIVO_AUTH_TOKEN=your_actual_auth_token
   PLIVO_FROM_NUMBER=+1234567890
   ASSOCIATE_NUMBER=+1987654321
   AUDIO_FILE_URL=https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
   PORT=3000
   SERVER_URL=http://your-ngrok-url.ngrok.io
   ```

   📝 **Important**: 
   - Phone numbers must be in E.164 format (e.g., `+1234567890`)
   - `PLIVO_FROM_NUMBER` must be a number you own in Plivo
   - `AUDIO_FILE_URL` must be a publicly accessible MP3 file
   - `SERVER_URL` will be your ngrok URL (see next step)

### Step 4: Set Up ngrok

1. Start ngrok in a separate terminal:
   ```bash
   ngrok http 3000
   ```

2. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)

3. Update `SERVER_URL` in your `.env` file:
   ```env
   SERVER_URL=https://abc123.ngrok.io
   ```

   ⚠️ **Note**: Do NOT include a trailing slash

## 🏃 Running the Application

### Development Mode

Start the server with automatic restart on file changes:

```bash
npm run dev
```

### Production Mode

Start the server:

```bash
npm start
```

You should see:

```
🚀 IVR server running on port 3000
📞 Server URL: https://abc123.ngrok.io
✅ Health check: http://localhost:3000/health
```

### Verify Setup

Test the health check endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Plivo IVR System"
}
```

## 🧪 Testing

### Test 1: Trigger an Outbound Call

**Using curl:**

```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "+1234567890"}'
```

**Using PowerShell:**

```powershell
$body = @{ to_number = "+1234567890" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/trigger-call" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Call initiated successfully",
  "call_uuid": "abc123-def456-ghi789",
  "api_id": "xyz789-uvw456-rst123"
}
```

### Test 2: Full IVR Flow Test

Once the call is initiated, test the complete flow:

1. **Answer the call**
   - You should hear: "Welcome to our service. Press 1 for English. Press 2 for Spanish."

2. **Test English Flow**
   - Press `1` for English
   - You should hear: "You have selected English. Press 1 to hear a message. Press 2 to speak with an associate."
   - Press `1` to hear the audio file
   - OR Press `2` to be forwarded to the associate number

3. **Test Spanish Flow**
   - Call again and press `2` for Spanish
   - You should hear: "Ha seleccionado español. Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado."
   - Press `1` or `2` to test options

4. **Test Invalid Input**
   - Press any digit other than 1 or 2
   - System should say "Invalid selection" and repeat the menu

5. **Test Timeout**
   - Don't press any key for 10 seconds
   - System should say "We did not receive your selection" and repeat the menu

## 📞 Call Flow

### Visual Call Flow Diagram

```
                    START
                      |
                      v
            ┌─────────────────┐
            │  /ivr/welcome   │
            │  Language Menu  │
            └────────┬────────┘
                     |
         ┌───────────┴───────────┐
         │                       │
    Press 1                 Press 2
    (English)               (Spanish)
         │                       │
         v                       v
┌─────────────────┐     ┌─────────────────┐
│/ivr/menu-english│     │/ivr/menu-spanish│
│  Options Menu   │     │  Options Menu   │
└────────┬────────┘     └────────┬────────┘
         |                       |
    ┌────┴────┐             ┌────┴────┐
    │         │             │         │
Press 1   Press 2       Press 1   Press 2
(Audio)   (Forward)     (Audio)   (Forward)
    │         │             │         │
    v         v             v         v
┌───────┐ ┌───────┐   ┌───────┐ ┌───────┐
│ Play  │ │ Dial  │   │ Play  │ │ Dial  │
│ MP3   │ │Associate│ │ MP3   │ │Associate│
└───┬───┘ └───┬───┘   └───┬───┘ └───┬───┘
    │         │             │         │
    v         v             v         v
  Hangup    Hangup        Hangup    Hangup
```

### Detailed State Transitions

| Current State | User Input | Next State | Action |
|--------------|------------|------------|--------|
| Welcome | 1 | English Menu | Redirect to `/ivr/menu-english` |
| Welcome | 2 | Spanish Menu | Redirect to `/ivr/menu-spanish` |
| Welcome | Other/Timeout | Welcome | Replay welcome message |
| English Menu | 1 | Audio Playback | Play MP3, then hangup |
| English Menu | 2 | Call Transfer | Dial associate number |
| English Menu | Other/Timeout | English Menu | Replay English menu |
| Spanish Menu | 1 | Audio Playback | Play MP3, then hangup |
| Spanish Menu | 2 | Call Transfer | Dial associate number |
| Spanish Menu | Other/Timeout | Spanish Menu | Replay Spanish menu |

## 🔌 API Endpoints

### 1. Trigger Outbound Call

**Endpoint:** `POST /trigger-call`

**Purpose:** Initiates an outbound call to a specified number

**Request Body:**
```json
{
  "to_number": "+1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "call_uuid": "unique-call-identifier",
  "api_id": "unique-api-request-id"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid phone number format. Use E.164 format (e.g., +1234567890)"
}
```

### 2. IVR Welcome (Language Selection)

**Endpoint:** `GET /ivr/welcome`

**Purpose:** Entry point for IVR system, presents language selection

**Response:** Plivo XML

### 3. Language Handler

**Endpoint:** `POST /ivr/language-handler`

**Purpose:** Routes call based on language selection

**Request Parameters (from Plivo):**
- `Digits`: User's DTMF input (1 or 2)
- `CallUUID`: Unique call identifier

**Response:** Plivo XML with redirect to appropriate menu

### 4. English Menu

**Endpoint:** `GET /ivr/menu-english`

**Purpose:** Presents options in English

**Response:** Plivo XML

### 5. Spanish Menu

**Endpoint:** `GET /ivr/menu-spanish`

**Purpose:** Presents options in Spanish

**Response:** Plivo XML

### 6. English Option Handler

**Endpoint:** `POST /ivr/english-handler`

**Purpose:** Routes call based on English menu selection

**Response:** Plivo XML (audio playback or call transfer)

### 7. Spanish Option Handler

**Endpoint:** `POST /ivr/spanish-handler`

**Purpose:** Routes call based on Spanish menu selection

**Response:** Plivo XML (audio playback or call transfer)

### 8. Health Check

**Endpoint:** `GET /health`

**Purpose:** Service health verification

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Plivo IVR System"
}
```

## 🐛 Troubleshooting

### Issue: Call Not Connecting

**Symptoms:**
- API call succeeds but call doesn't connect
- Phone doesn't ring

**Solutions:**

1. **Verify Plivo Number:**
   ```bash
   # Check if your FROM number is active in Plivo console
   # Visit: https://console.plivo.com/active-phone-numbers/
   ```

2. **Check Phone Number Format:**
   - Must use E.164 format: `+[country code][number]`
   - Example: `+14155552671` (US number)

3. **Verify Account Balance:**
   - Check your Plivo account has sufficient credits
   - Visit: https://console.plivo.com/billing/

### Issue: IVR Menus Not Playing

**Symptoms:**
- Call connects but no audio
- Silence after answering

**Solutions:**

1. **Check ngrok URL:**
   ```bash
   # Verify ngrok is running
   curl https://your-ngrok-url.ngrok.io/health
   ```

2. **Verify SERVER_URL in .env:**
   - Must be your ngrok HTTPS URL
   - No trailing slash
   - Example: `https://abc123.ngrok.io`

3. **Check Plivo Logs:**
   - Visit: https://console.plivo.com/logs/
   - Look for XML parsing errors

### Issue: DTMF Input Not Working

**Symptoms:**
- Pressing keys doesn't navigate menus
- Menu keeps repeating

**Solutions:**

1. **Check Phone Keypad:**
   - Ensure DTMF tones are enabled on your phone

2. **Review Server Logs:**
   ```bash
   # Check terminal for incoming Digits parameter
   # Should see: "🔢 Handler - Received digits: X"
   ```

3. **Verify Action URLs:**
   - Ensure all action URLs in XML use your correct SERVER_URL
   - Check for typos in route paths

### Issue: Audio File Not Playing

**Symptoms:**
- Call progresses but audio file doesn't play
- Silence when option 1 is selected

**Solutions:**

1. **Verify Audio URL:**
   ```bash
   # Test if URL is publicly accessible
   curl -I https://your-audio-file-url.mp3
   ```

2. **Check File Format:**
   - Must be MP3 format
   - Must be publicly accessible (no authentication required)

3. **Test with Default URL:**
   ```env
   AUDIO_FILE_URL=https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
   ```

### Issue: Call Forwarding Fails

**Symptoms:**
- Message plays but call doesn't transfer
- "Associate not available" message plays immediately

**Solutions:**

1. **Verify Associate Number:**
   - Check `ASSOCIATE_NUMBER` in .env
   - Must be a valid, reachable phone number

2. **Test Direct Dial:**
   - Try calling the associate number directly from another phone
   - Ensure it's not busy or unreachable

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required field: to_number" | Request body missing phone number | Include `to_number` in POST request |
| "Invalid phone number format" | Phone number not in E.164 | Use format: `+1234567890` |
| "Failed to initiate call" | Plivo API error | Check Auth ID/Token and account balance |
| "We did not receive your selection" | Timeout (10 seconds) | Press a key faster or check DTMF |

### Debug Mode

Enable verbose logging:

```javascript
// In src/server.js, add:
app.use((req, res, next) => {
  console.log('📥 Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query
  });
  next();
});
```

## 🚀 Production Deployment

### Deployment Checklist

- [ ] **Environment Variables**: Set all production credentials
- [ ] **HTTPS**: Use proper SSL certificate (not ngrok)
- [ ] **Server**: Deploy to cloud provider (AWS, Heroku, Digital Ocean)
- [ ] **Domain**: Use custom domain name
- [ ] **Monitoring**: Add error tracking (Sentry, LogRocket)
- [ ] **Logging**: Implement proper logging solution
- [ ] **Security**: Add rate limiting and input sanitization
- [ ] **Testing**: Run full integration tests
- [ ] **Documentation**: Update README with production URLs

### Recommended Cloud Platforms

1. **Heroku** (Easiest)
   ```bash
   heroku create your-app-name
   heroku config:set PLIVO_AUTH_ID=your_id
   heroku config:set PLIVO_AUTH_TOKEN=your_token
   # ... set other env vars
   git push heroku main
   ```

2. **AWS Elastic Beanstalk**
   - Good for scalability
   - Requires more setup

3. **Digital Ocean App Platform**
   - Balance of ease and control
   - Good pricing

### Security Best Practices

1. **Never commit .env file**
   ```bash
   # Verify .gitignore includes .env
   cat .gitignore | grep .env
   ```

2. **Rotate credentials regularly**
   - Change Plivo Auth Token monthly

3. **Use HTTPS only**
   - Plivo recommends HTTPS for all callbacks

4. **Implement rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use('/trigger-call', limiter);
   ```

5. **Validate all inputs**
   - Already implemented for phone numbers
   - Add more validation as needed

## 📊 Testing Checklist

Use this checklist to verify all functionality:

### Basic Functionality
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Environment variables load correctly
- [ ] Plivo client initializes successfully

### Outbound Call
- [ ] POST /trigger-call accepts valid phone number
- [ ] POST /trigger-call rejects invalid phone number
- [ ] Call connects to recipient's phone
- [ ] Recipient's phone rings

### Language Selection (Level 1)
- [ ] Welcome message plays clearly
- [ ] Pressing 1 routes to English menu
- [ ] Pressing 2 routes to Spanish menu
- [ ] Invalid input replays welcome menu
- [ ] Timeout (10 seconds) replays welcome menu

### English Menu (Level 2)
- [ ] English menu message plays clearly
- [ ] Pressing 1 plays audio file
- [ ] Audio file plays completely
- [ ] Call hangs up after audio
- [ ] Pressing 2 forwards to associate
- [ ] Call connects to associate successfully
- [ ] Invalid input replays English menu
- [ ] Timeout replays English menu

### Spanish Menu (Level 2)
- [ ] Spanish menu message plays clearly
- [ ] Spanish audio has correct pronunciation
- [ ] Pressing 1 plays audio file
- [ ] Audio file plays completely
- [ ] Call hangs up after audio
- [ ] Pressing 2 forwards to associate
- [ ] Call connects to associate successfully
- [ ] Invalid input replays Spanish menu
- [ ] Timeout replays Spanish menu

### Error Handling
- [ ] Invalid phone number returns 400 error
- [ ] Missing phone number returns 400 error
- [ ] Plivo API errors are caught and logged
- [ ] All errors return proper JSON responses

### Logging
- [ ] All incoming requests are logged
- [ ] DTMF digits are logged
- [ ] Call UUIDs are logged
- [ ] Errors are logged with stack traces

## 📚 Additional Resources

- [Plivo Voice API Documentation](https://www.plivo.com/docs/voice/api/)
- [Plivo XML Reference](https://www.plivo.com/docs/voice/xml/)
- [Express.js Documentation](https://expressjs.com/)
- [ngrok Documentation](https://ngrok.com/docs)

## 🤝 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Plivo Logs](https://console.plivo.com/logs/)
3. Check server logs in your terminal
4. Verify all environment variables are set correctly

## 📝 License

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ for Plivo Forward Deployed Engineer Technical Assessment**
