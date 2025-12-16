# IVR Call Flow Visualization

This document provides detailed visual representations of the IVR call flow.

## Complete System Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     PLIVO IVR SYSTEM                           │
│                      Call Flow Diagram                          │
└────────────────────────────────────────────────────────────────┘

                           START
                             │
                             │ User triggers call via API
                             │ POST /trigger-call
                             ▼
                    ┌────────────────┐
                    │ Plivo Platform │
                    │ Initiates Call │
                    └────────┬───────┘
                             │
                             │ Call connects
                             ▼
                    ┌────────────────┐
                    │ User Answers   │
                    │     Phone      │
                    └────────┬───────┘
                             │
                             │ Plivo requests XML
                             │ GET /ivr/welcome
                             ▼
╔════════════════════════════════════════════════════════════════╗
║                         LEVEL 1                                 ║
║                    LANGUAGE SELECTION                           ║
╚════════════════════════════════════════════════════════════════╝
                             │
                    ┌────────────────┐
                    │  Play Message: │
                    │ "Welcome. Press│
                    │ 1 for English. │
                    │ Press 2 for    │
                    │ Spanish."      │
                    └────────┬───────┘
                             │
                             │ User presses key
                             │ POST /ivr/language-handler
                             │ Digits parameter sent
                             ▼
                    ┌────────────────┐
                    │ Backend Routes │
                    │  Based on Key  │
                    └────────┬───────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    Press 1              Press 2           Invalid/Timeout
    Digits=1             Digits=2               │
         │                   │                   │
         │                   │                   │
         ▼                   ▼                   ▼
╔═══════════════╗   ╔═══════════════╗   ┌──────────────┐
║  LEVEL 2      ║   ║  LEVEL 2      ║   │ Redirect to  │
║ ENGLISH MENU  ║   ║ SPANISH MENU  ║   │   Welcome    │
╚═══════════════╝   ╚═══════════════╝   └──────────────┘
         │                   │
         │                   │
         ▼                   ▼

┌─────────────────┐    ┌─────────────────┐
│  Play Message:  │    │  Play Message:  │
│ "Press 1 to hear│    │ "Presione 1 para│
│  a message."    │    │ escuchar un     │
│ "Press 2 to     │    │ mensaje."       │
│  speak with an  │    │ "Presione 2 para│
│  associate."    │    │ hablar con un   │
│                 │    │ asociado."      │
└────────┬────────┘    └────────┬────────┘
         │                      │
         │                      │
    ┌────┴────┐            ┌────┴────┐
    │         │            │         │
Press 1   Press 2      Press 1   Press 2
Digits=1  Digits=2     Digits=1  Digits=2
    │         │            │         │
    │         │            │         │
    ▼         ▼            ▼         ▼
┌───────┐ ┌───────┐  ┌───────┐ ┌───────┐
│ PLAY  │ │ DIAL  │  │ PLAY  │ │ DIAL  │
│ AUDIO │ │ASSOCI-│  │ AUDIO │ │ASSOCI-│
│ FILE  │ │  ATE  │  │ FILE  │ │  ATE  │
└───┬───┘ └───┬───┘  └───┬───┘ └───┬───┘
    │         │            │         │
    │         │            │         │
    │         │            │         │
    └─────────┴────────────┴─────────┘
              │
              ▼
         ┌─────────┐
         │ HANGUP  │
         └─────────┘
              │
              ▼
            END
```

## State Transition Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   STATE TRANSITIONS                       │
└──────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   WELCOME    │◄────┐
                    │   (Initial)  │     │
                    └──────┬───────┘     │
                           │             │ Invalid Input
                           │             │ or Timeout
                     ┌─────┴─────┐       │
                     │           │       │
                  Press 1     Press 2    │
                     │           │       │
                     ▼           ▼       │
            ┌─────────────┐  ┌─────────────┐
            │   ENGLISH   │  │   SPANISH   │
            │    MENU     │  │    MENU     │
            └──────┬──────┘  └──────┬──────┘
                   │                │
         ┌─────────┴─────┐    ┌────┴─────┐
         │               │    │          │
      Press 1        Press 2  Press 1  Press 2
         │               │    │          │
         ▼               ▼    ▼          ▼
    ┌────────┐      ┌────────┐ ┌────────┐ ┌────────┐
    │ AUDIO  │      │TRANSFER│ │ AUDIO  │ │TRANSFER│
    │PLAYBACK│      │  CALL  │ │PLAYBACK│ │  CALL  │
    └───┬────┘      └───┬────┘ └───┬────┘ └───┬────┘
        │               │           │           │
        └───────────────┴───────────┴───────────┘
                        │
                        ▼
                   ┌────────┐
                   │ HANGUP │
                   └────────┘
```

## Detailed Menu Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     MENU HIERARCHY                           │
└─────────────────────────────────────────────────────────────┘

ROOT: /ivr/welcome
│
├── [1] English
│   │
│   └─► /ivr/menu-english
│       │
│       ├── [1] Hear a Message
│       │   │
│       │   └─► /ivr/english-handler (Digits=1)
│       │       │
│       │       └─► <Play>AUDIO_FILE_URL</Play>
│       │           └─► <Hangup/>
│       │
│       └── [2] Speak with Associate
│           │
│           └─► /ivr/english-handler (Digits=2)
│               │
│               └─► <Dial>ASSOCIATE_NUMBER</Dial>
│                   └─► <Hangup/>
│
└── [2] Spanish
    │
    └─► /ivr/menu-spanish
        │
        ├── [1] Escuchar un Mensaje
        │   │
        │   └─► /ivr/spanish-handler (Digits=1)
        │       │
        │       └─► <Play>AUDIO_FILE_URL</Play>
        │           └─► <Hangup/>
        │
        └── [2] Hablar con un Asociado
            │
            └─► /ivr/spanish-handler (Digits=2)
                │
                └─► <Dial>ASSOCIATE_NUMBER</Dial>
                    └─► <Hangup/>
```

## HTTP Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│               HTTP REQUEST/RESPONSE FLOW                      │
└──────────────────────────────────────────────────────────────┘

1. TRIGGER CALL
   ════════════════════════════════════════════════════════════
   Client ──────POST /trigger-call──────► Backend Server
          { "to_number": "+1234567890" }

   Backend ─────POST via Plivo SDK──────► Plivo Platform
   Server        (Initiate Call)

   Backend ◄────Call UUID + API ID───────  Plivo Platform
   Server

   Client  ◄────200 OK──────────────────  Backend Server
          { "success": true,
            "call_uuid": "..." }


2. CALL CONNECTS
   ════════════════════════════════════════════════════════════
   Plivo ───────GET /ivr/welcome────────► Backend Server
   Platform

   Backend ◄────XML Response─────────────  Backend Server
   Platform  <?xml version="1.0"?>
             <Response>
               <Speak>Welcome...</Speak>
               <GetDigits action="/ivr/language-handler"/>
             </Response>


3. USER PRESSES KEY
   ════════════════════════════════════════════════════════════
   Plivo ────POST /ivr/language-handler──► Backend Server
   Platform  { "Digits": "1",
               "CallUUID": "...",
               "From": "+...",
               "To": "+..." }

   Backend ◄────XML Response─────────────  Backend Server
   Platform  <?xml version="1.0"?>
             <Response>
               <Redirect>
                 /ivr/menu-english
               </Redirect>
             </Response>


4. PLIVO FOLLOWS REDIRECT
   ════════════════════════════════════════════════════════════
   Plivo ───────GET /ivr/menu-english───► Backend Server
   Platform

   Backend ◄────XML Response─────────────  Backend Server
   Platform  <?xml version="1.0"?>
             <Response>
               <Speak>Press 1 to...</Speak>
               <GetDigits action="/ivr/english-handler"/>
             </Response>


5. USER SELECTS OPTION
   ════════════════════════════════════════════════════════════
   Plivo ────POST /ivr/english-handler───► Backend Server
   Platform  { "Digits": "1" }

   Backend ◄────XML Response─────────────  Backend Server
   Platform  <?xml version="1.0"?>
             <Response>
               <Play>https://.../audio.mp3</Play>
               <Hangup/>
             </Response>


6. CALL ENDS
   ════════════════════════════════════════════════════════════
   Plivo ───────GET /ivr/hangup─────────► Backend Server
   Platform  (Optional callback)

   Backend ◄────XML Response─────────────  Backend Server
   Platform  <?xml version="1.0"?>
             <Response>
               <Hangup/>
             </Response>
```

## Plivo XML Structure

```
┌──────────────────────────────────────────────────────────────┐
│                 PLIVO XML STRUCTURE                           │
└──────────────────────────────────────────────────────────────┘

ALL XML RESPONSES FOLLOW THIS STRUCTURE:

<?xml version="1.0" encoding="UTF-8"?>
<Response>
    │
    ├─► <Speak voice="WOMAN" language="en-US">
    │       Text to speak
    │   </Speak>
    │
    ├─► <GetDigits 
    │       action="https://server.com/handler"
    │       method="POST"
    │       timeout="10"
    │       numDigits="1"
    │       validDigits="12"
    │       redirect="true">
    │       │
    │       └─► <Speak>Prompt message</Speak>
    │   </GetDigits>
    │
    ├─► <Play>https://example.com/audio.mp3</Play>
    │
    ├─► <Dial>+1234567890</Dial>
    │
    ├─► <Redirect>https://server.com/next</Redirect>
    │
    └─► <Hangup/>
</Response>


CALLBACK PARAMETERS (sent by Plivo):
════════════════════════════════════
When user presses keys, Plivo sends:

POST /ivr/handler
{
    "Digits": "1",              // The key pressed
    "CallUUID": "abc-123",       // Unique call ID
    "From": "+1234567890",       // Caller's number
    "To": "+1987654321",         // Your Plivo number
    "CallStatus": "in-progress",
    "Direction": "outbound",
    ...
}
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                  ERROR HANDLING FLOW                          │
└──────────────────────────────────────────────────────────────┘

SCENARIO 1: Invalid DTMF Input
═══════════════════════════════════════════════════════════════

User at Menu ──presses invalid key (e.g., 9)──► Handler
                                                    │
                                Handler checks:    │
                                if (Digits !== '1' && Digits !== '2')
                                                    │
                                                    ▼
                            Return XML with <Speak>Invalid</Speak>
                                    + <Redirect> to same menu
                                                    │
                                                    ▼
                            User hears "Invalid selection"
                                    Menu repeats


SCENARIO 2: Timeout (No Input)
═══════════════════════════════════════════════════════════════

User at Menu ──waits 10 seconds (no key press)──► GetDigits
                                                    │
                                GetDigits timeout   │
                                                    ▼
                            Plivo plays fallback message
                            (nested <Speak> in GetDigits)
                                                    │
                                                    ▼
                            Then continues to next element
                            in XML (<Speak> + <Redirect>)
                                                    │
                                                    ▼
                            User hears "We did not receive..."
                                    Menu repeats


SCENARIO 3: API Error (Call Trigger Fails)
═══════════════════════════════════════════════════════════════

Client ──POST /trigger-call──► Backend Server
                                    │
                        Try to call Plivo API
                                    │
                                    ▼
                            ❌ API Error
                        (Invalid credentials,
                         insufficient balance, etc.)
                                    │
                        Caught by try-catch
                                    │
                                    ▼
                        Return 500 JSON error
                        { "success": false,
                          "error": "Failed to initiate call" }
                                    │
                                    ▼
Client ◄────────────────────────────┘
Receives error response


SCENARIO 4: Missing Required Field
═══════════════════════════════════════════════════════════════

Client ──POST /trigger-call──► Backend Server
         (missing to_number)        │
                                    │
                        Validate input
                        if (!to_number)
                                    │
                                    ▼
                        Return 400 JSON error
                        { "success": false,
                          "error": "Missing required field" }
                                    │
                                    ▼
Client ◄────────────────────────────┘
Receives validation error
```

## Data Flow Through System

```
┌──────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Client    │
│  (Browser/  │
│   cURL)     │
└──────┬──────┘
       │
       │ {to_number: "+1234567890"}
       │
       ▼
┌──────────────────┐
│ Express Server   │
│ - Validate input │
│ - Log request    │
└──────┬───────────┘
       │
       │ Call Plivo SDK
       │ plivoClient.calls.create(...)
       │
       ▼
┌──────────────────┐
│ Plivo Platform   │
│ - Initiate call  │
│ - Return UUID    │
└──────┬───────────┘
       │
       │ {call_uuid, api_id}
       │
       ▼
┌──────────────────┐
│ Express Server   │
│ - Receive result │
│ - Format response│
└──────┬───────────┘
       │
       │ {success: true, call_uuid: "..."}
       │
       ▼
┌─────────────┐
│   Client    │
│ Display UUID│
└─────────────┘


MEANWHILE, PLIVO CALLS BACK:
════════════════════════════════════════════════════════════

┌──────────────────┐
│ Plivo Platform   │
│ (Call connected) │
└──────┬───────────┘
       │
       │ GET /ivr/welcome
       │
       ▼
┌──────────────────┐
│ Express Server   │
│ - Generate XML   │
│ - Log request    │
└──────┬───────────┘
       │
       │ <Response><Speak>...</Speak></Response>
       │
       ▼
┌──────────────────┐
│ Plivo Platform   │
│ - Parse XML      │
│ - Execute verbs  │
│ - Play audio     │
└──────┬───────────┘
       │
       │ User hears audio
       │ User presses key
       │
       │ POST /ivr/handler
       │ {Digits: "1", CallUUID: "..."}
       │
       ▼
┌──────────────────┐
│ Express Server   │
│ - Parse Digits   │
│ - Route logic    │
│ - Generate XML   │
└──────┬───────────┘
       │
       │ <Response><Redirect>...</Redirect></Response>
       │
       ▼
┌──────────────────┐
│ Plivo Platform   │
│ Follow redirect  │
└──────────────────┘

... process continues until <Hangup/>
```

## Summary

This IVR system uses:

1. **Request-Response Pattern**: Each user action triggers an HTTP request
2. **Stateless Design**: No session storage needed
3. **XML-Based Control**: Plivo executes XML instructions
4. **Callback Architecture**: Plivo calls your server for each step
5. **Backend Routing**: All conditional logic in JavaScript, not XML

The flow is simple but powerful:
- User triggers → Call initiated → XML served → User interacts → More XML → Call ends

All branching happens through backend routes parsing the `Digits` parameter!
