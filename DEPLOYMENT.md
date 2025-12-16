# Deployment & Setup Instructions

## 🎯 Goal
Get the Plivo IVR system running and make your first test call in under 10 minutes.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** installed (v14 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **npm** installed (comes with Node.js)
  - Check: `npm --version`

- [ ] **Plivo Account** created
  - Sign up: https://console.plivo.com/accounts/register/
  - Free trial provides credits for testing

- [ ] **Plivo Phone Number** purchased
  - Go to: https://console.plivo.com/active-phone-numbers/
  - Buy a number (costs ~$1/month)

- [ ] **ngrok** installed
  - Download: https://ngrok.com/download
  - Unzip and place in PATH
  - Check: `ngrok --version`

## Step-by-Step Setup

### Step 1: Get Plivo Credentials (2 minutes)

1. Log in to [Plivo Console](https://console.plivo.com/)
2. Click your account name (top right)
3. Select "Account Settings"
4. Copy:
   - **Auth ID**: Starts with "MA..."
   - **Auth Token**: Long alphanumeric string

### Step 2: Get Plivo Phone Number (1 minute)

1. Go to [Buy Numbers](https://console.plivo.com/active-phone-numbers/buy/)
2. Select country (e.g., United States)
3. Choose "Voice" capability
4. Click "Buy" on any available number
5. Copy your new number (format: +1234567890)

### Step 3: Install Dependencies (1 minute)

```bash
# Navigate to project directory
cd plivo-ivr-demo

# Install all dependencies
npm install
```

You should see:
```
added 57 packages in 5s
```

### Step 4: Configure Environment (2 minutes)

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor

3. Fill in your credentials:
   ```env
   # From Plivo Console → Account Settings
   PLIVO_AUTH_ID=MAMXXXXXXXXXXXXXXXXX
   PLIVO_AUTH_TOKEN=your_actual_token_here

   # Your Plivo number (from Step 2)
   PLIVO_FROM_NUMBER=+1234567890

   # Your personal phone number (where calls will forward)
   ASSOCIATE_NUMBER=+1234567890

   # Public MP3 URL (keep the default or use your own)
   AUDIO_FILE_URL=https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3

   # Server configuration
   PORT=3000
   # We'll fill this in Step 5
   SERVER_URL=
   ```

4. Save the file

### Step 5: Start ngrok (2 minutes)

In a **separate terminal window**, run:

```bash
ngrok http 3000
```

You should see:
```
Session Status                online
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123def456.ngrok.io`)

Go back to your `.env` file and update:
```env
SERVER_URL=https://abc123def456.ngrok.io
```

⚠️ **Important**: Use HTTPS, not HTTP, and NO trailing slash

Save the file.

### Step 6: Start the Server (1 minute)

In your original terminal:

```bash
npm start
```

You should see:
```
🚀 IVR server running on port 3000
📞 Server URL: https://abc123def456.ngrok.io
✅ Health check: http://localhost:3000/health
```

### Step 7: Verify Setup (1 minute)

Test the health check:

**Option A - Browser:**
Open http://localhost:3000/health

**Option B - cURL:**
```bash
curl http://localhost:3000/health
```

**Option C - PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Plivo IVR System"
}
```

✅ If you see this, your server is ready!

### Step 8: Make Your First Call (1 minute)

Replace `+YOUR_PHONE_NUMBER` with your actual phone number:

**cURL:**
```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "+YOUR_PHONE_NUMBER"}'
```

**PowerShell:**
```powershell
$body = @{ to_number = "+YOUR_PHONE_NUMBER" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/trigger-call" -Method POST -Body $body -ContentType "application/json"
```

You should see:
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "call_uuid": "abc123-def456-ghi789",
  "api_id": "xyz789"
}
```

📞 **Your phone should ring within 5-10 seconds!**

## Testing the IVR Flow

When you answer the call:

### Test 1: English Flow with Audio

1. Answer the call
2. Listen: "Welcome to our service. Press 1 for English. Press 2 for Spanish."
3. **Press 1** (English)
4. Listen: "You have selected English. Press 1 to hear a message. Press 2 to speak with an associate."
5. **Press 1** (Hear message)
6. Listen to the music
7. Call ends automatically

### Test 2: English Flow with Transfer

1. Make another call
2. **Press 1** (English)
3. **Press 2** (Speak with associate)
4. Call forwards to your ASSOCIATE_NUMBER
5. Answer on your other phone

### Test 3: Spanish Flow

1. Make another call
2. **Press 2** (Spanish)
3. Listen to Spanish menu
4. **Press 1** or **2** to test options

### Test 4: Invalid Input

1. Make another call
2. Press **5** or **9** (invalid option)
3. Listen: "Invalid selection."
4. Menu repeats automatically

### Test 5: Timeout

1. Make another call
2. Don't press anything for 10 seconds
3. Listen: "We did not receive your selection."
4. Menu repeats automatically

## Troubleshooting Common Issues

### Issue: "Invalid credentials" error

**Solution:**
1. Double-check PLIVO_AUTH_ID and PLIVO_AUTH_TOKEN in `.env`
2. Make sure there are no extra spaces
3. Verify credentials at https://console.plivo.com/
4. Restart the server after editing `.env`

### Issue: Call doesn't connect

**Symptoms**: API returns success but phone doesn't ring

**Solutions:**

1. **Check FROM number**:
   - Go to https://console.plivo.com/active-phone-numbers/
   - Verify PLIVO_FROM_NUMBER matches a number you own
   - Make sure it's in E.164 format: `+1234567890`

2. **Check TO number format**:
   - Must include country code: `+1234567890`
   - No spaces or dashes: ❌ `+1 234-567-8900`

3. **Check account balance**:
   - Go to https://console.plivo.com/billing/
   - Ensure you have credits available

### Issue: No audio when call connects

**Symptoms**: Call connects but silence

**Solutions:**

1. **Verify ngrok is running**:
   ```bash
   curl https://your-ngrok-url.ngrok.io/health
   ```

2. **Check SERVER_URL**:
   - Must be HTTPS (not HTTP)
   - Must be ngrok URL (not localhost)
   - No trailing slash
   - Restart server after changing

3. **Check ngrok terminal**:
   - Look for incoming requests
   - Should see: `GET /ivr/welcome`

### Issue: DTMF (key presses) don't work

**Symptoms**: Pressing keys doesn't navigate menus

**Solutions:**

1. **Check phone settings**:
   - Ensure DTMF tones are enabled
   - Try a different phone

2. **Check server logs**:
   - Look for: `🔢 Handler - Received digits: X`
   - If not appearing, check ngrok

3. **Verify action URLs**:
   - Open browser to: `https://your-ngrok-url.ngrok.io/ivr/welcome`
   - Should see XML (not error)

### Issue: Audio file doesn't play

**Symptoms**: Menu works but no audio on option 1

**Solutions:**

1. **Test audio URL**:
   ```bash
   curl -I https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
   ```
   Should return: `HTTP/1.1 200 OK`

2. **Use different audio**:
   Update AUDIO_FILE_URL in `.env`:
   ```env
   AUDIO_FILE_URL=https://file-examples.com/storage/fe78c86893afcfb318a77a3/2017/11/file_example_MP3_700KB.mp3
   ```

3. **Check file format**:
   - Must be MP3 format
   - Must be publicly accessible (no authentication)

### Issue: ngrok URL keeps changing

**Symptom**: Have to update SERVER_URL every time

**Solutions:**

**Option A - Free (Temporary)**:
- Keep ngrok running (don't close terminal)
- Only restart your server (npm start), not ngrok

**Option B - Paid (Permanent)**:
- Upgrade to ngrok paid plan ($8/month)
- Get a static domain
- Never changes

**Option C - Production**:
- Deploy to Heroku/AWS/Digital Ocean
- Use your own domain

## Viewing Logs

### Server Logs (Terminal)

Your terminal shows real-time logs:

```
📞 Initiating call to: +1234567890
✅ Call initiated successfully: {...}
📞 IVR Welcome - Language Selection
Request params: { ... }
🔢 Language Handler - Received digits: 1
✅ Routing to English menu
📞 English Menu
🔢 English Handler - Received digits: 1
✅ Playing audio message
```

### Plivo Console Logs

1. Go to https://console.plivo.com/logs/
2. Click "Call Logs" or "Debug Logs"
3. Find your call by phone number
4. Click to see:
   - Call details
   - XML requests/responses
   - Any errors

### ngrok Request Inspector

1. While ngrok is running, open: http://localhost:4040
2. See all HTTP requests
3. View request/response details
4. Replay requests for debugging

## Next Steps

Now that everything works:

### 1. Customize the IVR

Edit [src/routes/ivr.js](src/routes/ivr.js):

```javascript
// Change welcome message
<Speak voice="WOMAN">Welcome to YOUR COMPANY NAME...</Speak>

// Change menu options
<Speak voice="WOMAN">Press 1 for OPTION A. Press 2 for OPTION B.</Speak>

// Add more languages
router.get('/menu-french', (req, res) => {
  // French menu
});
```

### 2. Add More Features

- Add call recording
- Add voicemail
- Add more menu levels
- Add business hours checking
- Add call analytics

### 3. Deploy to Production

See [README.md](README.md#production-deployment) for:
- Deploying to Heroku
- Setting up a custom domain
- Configuring HTTPS
- Adding monitoring

## Quick Reference

### Environment Variables

```env
PLIVO_AUTH_ID=MAMXXXXXXXXXXXXXXXXX
PLIVO_AUTH_TOKEN=your_token
PLIVO_FROM_NUMBER=+1234567890
ASSOCIATE_NUMBER=+1987654321
AUDIO_FILE_URL=https://example.com/audio.mp3
PORT=3000
SERVER_URL=https://your-ngrok-url.ngrok.io
```

### Common Commands

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# Start ngrok
ngrok http 3000

# Test health
curl http://localhost:3000/health

# Trigger test call
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "+1234567890"}'
```

### Important URLs

- Plivo Console: https://console.plivo.com/
- Plivo Docs: https://www.plivo.com/docs/voice/
- ngrok Dashboard: http://localhost:4040
- Health Check: http://localhost:3000/health

## Success Checklist

You're ready when:

- [x] Server starts without errors
- [x] Health check returns status: "healthy"
- [x] ngrok shows your public URL
- [x] Test call connects to your phone
- [x] Welcome message plays
- [x] Pressing 1 goes to English menu
- [x] Pressing 2 goes to Spanish menu
- [x] Audio playback works (option 1)
- [x] Call forwarding works (option 2)

🎉 **Congratulations!** Your IVR system is live!

## Getting Help

If you're stuck:

1. **Check logs**: Look at server terminal and Plivo console
2. **Review docs**: See [README.md](README.md) for detailed troubleshooting
3. **Test endpoints**: Use [API_TESTING.md](API_TESTING.md) examples
4. **Check ngrok**: Visit http://localhost:4040 to see requests

## Resources

- 📖 [README.md](README.md) - Comprehensive documentation
- ⚡ [QUICK_START.md](QUICK_START.md) - 5-minute setup guide
- 🔧 [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md) - Architecture details
- 🧪 [API_TESTING.md](API_TESTING.md) - Testing examples
- 📊 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Complete overview

---

**Need more help?** Check the troubleshooting section in [README.md](README.md#troubleshooting)
