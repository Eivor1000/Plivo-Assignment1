# Plivo IVR System - Configuration Template

This template contains all the environment variables needed to run the IVR system.

## Setup Instructions

1. Copy this file to create your actual environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values below with your actual credentials and configuration.

## Plivo API Credentials

Get these from your Plivo Console (https://console.plivo.com/):
- PLIVO_AUTH_ID: Your Plivo Auth ID
- PLIVO_AUTH_TOKEN: Your Plivo Auth Token

## Phone Numbers

- PLIVO_FROM_NUMBER: Your Plivo phone number (must be in E.164 format, e.g., +1234567890)
- ASSOCIATE_NUMBER: The phone number to forward calls to (option 2 in the menu)

## Audio Configuration

- AUDIO_FILE_URL: A publicly accessible URL to an MP3 file that will be played when users select option 1

Example public MP3 URLs you can use for testing:
- https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
- https://file-examples.com/storage/fe78c86893afcfb318a77a3/2017/11/file_example_MP3_700KB.mp3

## Server Configuration

- PORT: The port your server will run on (default: 3000)
- SERVER_URL: Your public server URL (use ngrok for local development)

To get a public URL for local development:
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
4. Use this as your SERVER_URL (without trailing slash)

## Security Notes

- Never commit the .env file to version control
- Keep your Plivo credentials secure
- Rotate your Auth Token regularly
- Use HTTPS URLs for production deployments
