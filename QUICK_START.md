# Quick Start Guide

Get up and running with the Plivo IVR system in 5 minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies (1 min)

```bash
cd plivo-ivr-demo
npm install
```

### Step 2: Configure Environment (2 min)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your details:
   ```env
   PLIVO_AUTH_ID=MAMXXXXXXXXXXXXXXXXX
   PLIVO_AUTH_TOKEN=your_token_here
   PLIVO_FROM_NUMBER=+1234567890
   ASSOCIATE_NUMBER=+1234567890
   AUDIO_FILE_URL=https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
   PORT=3000
   SERVER_URL=https://your-ngrok-url.ngrok.io
   ```

   **Get your Plivo credentials:**
   - Go to [Plivo Console](https://console.plivo.com/)
   - Click on your account name → Account Settings
   - Copy Auth ID and Auth Token

### Step 3: Start ngrok (1 min)

In a separate terminal:
```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and update `SERVER_URL` in `.env`

### Step 4: Start the Server (1 min)

```bash
npm start
```

You should see:
```
🚀 IVR server running on port 3000
📞 Server URL: https://abc123.ngrok.io
✅ Health check: http://localhost:3000/health
```

### Step 5: Make a Test Call

```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"to_number": "+YOUR_PHONE_NUMBER"}'
```

**Windows PowerShell:**
```powershell
$body = @{ to_number = "+YOUR_PHONE_NUMBER" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/trigger-call" -Method POST -Body $body -ContentType "application/json"
```

## 📞 What to Expect

1. Your phone will ring
2. Answer the call
3. You'll hear: "Welcome to our service. Press 1 for English. Press 2 for Spanish."
4. Press `1` for English
5. You'll hear: "You have selected English. Press 1 to hear a message. Press 2 to speak with an associate."
6. Press `1` to hear music
7. Call ends after music plays

## 🎯 Common Issues & Fixes

### "Call not connecting"
- ✅ Check: Is `PLIVO_FROM_NUMBER` a valid Plivo number you own?
- ✅ Check: Is `SERVER_URL` set to your ngrok HTTPS URL?
- ✅ Check: Is your phone number in E.164 format? (+1234567890)

### "No audio playing"
- ✅ Check: Is ngrok still running?
- ✅ Check: Can you access `https://your-ngrok-url.ngrok.io/health`?
- ✅ Check: Are there any errors in the terminal?

### "Invalid credentials error"
- ✅ Check: Did you copy the correct Auth ID and Auth Token from Plivo?
- ✅ Check: Did you restart the server after editing `.env`?

## 🧪 Test All Features

### Test 1: English Flow with Audio
```bash
# Make the call
curl -X POST http://localhost:3000/trigger-call -H "Content-Type: application/json" -d '{"to_number": "+YOUR_NUMBER"}'

# When call connects:
# Press 1 (English) → Press 1 (Audio) → Listen to music → Hangup
```

### Test 2: English Flow with Transfer
```bash
# Make the call
curl -X POST http://localhost:3000/trigger-call -H "Content-Type: application/json" -d '{"to_number": "+YOUR_NUMBER"}'

# When call connects:
# Press 1 (English) → Press 2 (Transfer) → Call connects to associate
```

### Test 3: Spanish Flow
```bash
# Make the call
curl -X POST http://localhost:3000/trigger-call -H "Content-Type: application/json" -d '{"to_number": "+YOUR_NUMBER"}'

# When call connects:
# Press 2 (Spanish) → Press 1 (Audio) → Listen to music → Hangup
```

### Test 4: Invalid Input Handling
```bash
# Make the call and press 5 or 9 (invalid options)
# System should say "Invalid selection" and repeat the menu
```

### Test 5: Timeout Handling
```bash
# Make the call and don't press anything for 10 seconds
# System should say "We did not receive your selection" and repeat the menu
```

## 📊 Viewing Logs

### Server Logs (Terminal)

You'll see logs like:
```
📞 Initiating call to: +1234567890
✅ Call initiated successfully
📞 IVR Welcome - Language Selection
🔢 Language Handler - Received digits: 1
✅ Routing to English menu
📞 English Menu
🔢 English Handler - Received digits: 1
✅ Playing audio message
```

### Plivo Logs (Console)

1. Go to [Plivo Console → Logs](https://console.plivo.com/logs/)
2. Filter by your phone number
3. Click on a call to see:
   - Call duration
   - XML requests/responses
   - Any errors

## 🔧 Development Tips

### Auto-Restart on Changes

Use `nodemon` for development:
```bash
npm run dev
```

Now the server automatically restarts when you edit files!

### Testing API with Postman

Import this collection:

**POST /trigger-call**
- URL: `http://localhost:3000/trigger-call`
- Method: POST
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "to_number": "+1234567890"
  }
  ```

**GET /health**
- URL: `http://localhost:3000/health`
- Method: GET

### Viewing XML Responses

Add this to your browser to see XML:

1. Start server
2. Open: `https://your-ngrok-url.ngrok.io/ivr/welcome`
3. You'll see the XML that Plivo receives

## 📚 Next Steps

Once everything works:

1. **Customize Messages**
   - Edit [src/routes/ivr.js](src/routes/ivr.js)
   - Change the `<Speak>` text
   - Add your own audio files

2. **Add More Options**
   - Add a third language
   - Add more menu levels
   - Add department routing

3. **Deploy to Production**
   - See [README.md](README.md#production-deployment)
   - Use Heroku, AWS, or Digital Ocean
   - Get a proper domain name

4. **Add Features**
   - Call recording
   - Voicemail
   - Call analytics
   - Database integration

## 💡 Pro Tips

### Tip 1: Keep ngrok Running
ngrok URLs change every time you restart (on free plan). To avoid updating `.env` constantly:
- Use ngrok's paid plan for static URLs
- OR restart both ngrok and server at the same time

### Tip 2: Test Locally First
Before calling your real phone:
- Check `http://localhost:3000/health`
- Check `https://your-ngrok-url.ngrok.io/health`
- View XML at `https://your-ngrok-url.ngrok.io/ivr/welcome`

### Tip 3: Use Testing Numbers
Plivo provides test credentials that don't charge you:
- See [Plivo Test Credentials](https://www.plivo.com/docs/voice/api/test-credentials/)
- Use for development before going live

### Tip 4: Monitor Plivo Balance
Free trial accounts have limited credits:
- Check balance at [Plivo Console → Billing](https://console.plivo.com/billing/)
- Add credits before they run out

## 🎓 Learning Resources

- **Plivo XML Docs**: https://www.plivo.com/docs/voice/xml/
- **Express.js Guide**: https://expressjs.com/en/guide/routing.html
- **Node.js Docs**: https://nodejs.org/en/docs/
- **ngrok Docs**: https://ngrok.com/docs

## ❓ Need Help?

1. Check [README.md](README.md#troubleshooting) troubleshooting section
2. Review [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md) for architecture details
3. Check Plivo Console logs
4. Review server terminal logs

---

**You're all set!** 🎉 

Your IVR system is now running. Make test calls and explore the code!
