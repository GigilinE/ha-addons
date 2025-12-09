# Home Assistant Add-on: Whatsapp add-on

## How to use

### **How to add other Whatsapp sessions**

Go to configuration page in clients input box digit the desired clientId. This one represents an identifier for the session.

### **How to get a User ID**

The user id is made from three parts:

- Country code (Example 39 (Italy))
- User's number
- And a static part: @s.whatsapp.net (for users) @g.us (for groups)

For example for Italian number _3456789010_ the user id is the following _393456789010@s.whatsapp.net_

### **Important: LID Format (Baileys v7)**

Starting from version 1.7.0, WhatsApp uses a new identifier format called **LID (Local Identifier)** for group participants. This means:

- In group chats, the `key.participant` field may contain an ID in the format `123456789@lid` instead of the traditional `393456789010@s.whatsapp.net`
- The LID is an anonymous identifier that WhatsApp uses internally
- To get the sender's info in groups, use `key.participant` (which may be LID or phone number format)
- The `pushName` field still contains the contact's display name

**Example of a message received in a group (v7 format):**
```json
{
  "key": {
    "remoteJid": "123456789-987654321@g.us",
    "fromMe": false,
    "id": "ABC123",
    "participant": "258359613726883@lid"
  },
  "pushName": "John Doe",
  "message": {
    "extendedTextMessage": {
      "text": "Hello!"
    }
  }
}
```

**Note:** For private chats, the traditional phone number format `@s.whatsapp.net` is still used.

### **Send a simple text message**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net # User ID
  body:
    text: Hi it's a simple text message
```

### **How to send an image**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    image:
      url: "https://dummyimage.com/600x400/000/fff.png"
    caption: Simple text
```

### **How to send audio message**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    audio:
      url: "https://github.com/GigilinE/ha-addons/blob/main/whatsapp_addon/examples/hello_world.mp3?raw=true"
    ptt: true # Send audio as a voice
```

### **How to send a video**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    video:
      url: "https://example.com/video.mp4"
    caption: Video description
```

### **How to send a video note (circle video)**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    video:
      url: "https://example.com/video.mp4"
    ptv: true # Send as video note (circle)
```

### **How to send a GIF**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    video:
      url: "https://example.com/animation.mp4"
    gifPlayback: true
```

### **How to send a document/file**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    document:
      url: "https://example.com/document.pdf"
    mimetype: "application/pdf"
    fileName: "my_document.pdf"
```

### **How to send a sticker**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    sticker:
      url: "https://example.com/sticker.webp"
```

### **How to send a location**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    location:
      degreesLatitude: 24.121231
      degreesLongitude: 55.1121221
```

### **How to send a contact**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    contacts:
      displayName: "John Doe"
      contacts:
        - vcard: |
            BEGIN:VCARD
            VERSION:3.0
            FN:John Doe
            TEL;type=CELL;type=VOICE;waid=391234567890:+39 123 456 7890
            END:VCARD
```

### **How to send a view once message (image/video)**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    image:
      url: "https://example.com/image.png"
    viewOnce: true
    caption: This image can only be viewed once
```

### **How to send a poll**

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    poll:
      name: "What's your favorite color?"
      values:
        - Red
        - Blue
        - Green
      selectableCount: 1
```

### **How to subscribe to presence update**

```yaml
service: whatsapp.presence_subscribe
data:
  clientId: default
  userId: 391234567890@s.whatsapp.net
```

---

## Configuration Options (v1.8.0+)

The addon now supports additional configuration options in the add-on settings:

### **AI Integration**

Configure AI assistants (ChatGPT or Claude) to respond to messages:

```yaml
ai:
  openai_api_key: "sk-your-openai-key"
  anthropic_api_key: "sk-ant-your-anthropic-key"
  default_ai: "openai"  # or "anthropic"
  model_openai: "gpt-4o-mini"
  model_anthropic: "claude-3-haiku-20240307"
  system_prompt: "You are a helpful home assistant named Arya."
  max_tokens: 500
```

### **Business Hours**

Auto-reply when outside working hours:

```yaml
business_hours:
  enabled: true
  start_hour: 9
  end_hour: 18
  work_days: [1, 2, 3, 4, 5]  # Monday to Friday
  auto_reply_message: "Thanks for your message. We're currently closed."
```

### **Authorized Numbers**

Whitelist phone numbers for sensitive commands:

```yaml
authorized_numbers:
  - "393929828347"
  - "393481844469"
```

### **Group Configuration**

Name your groups for easier identification:

```yaml
groups:
  famiglia: "120363044852872915@g.us"
  lavoro: "120363012345678901@g.us"
```

### **Activity Logging**

Enable logging of all interactions:

```yaml
logging:
  enabled: true
  log_file: "/config/whatsapp_log.json"
```

---

## API Endpoints (v1.8.0+)

### **Chat with AI**

```bash
POST /ai/chat
Content-Type: application/json

{
  "message": "What's the weather like?",
  "conversationHistory": [],
  "preferredAI": "openai"
}
```

### **Get Configuration**

```bash
GET /config
```

### **Check Authorization**

```bash
POST /checkAuthorized
Content-Type: application/json

{
  "number": "393929828347"
}
```

### **Check Business Hours**

```bash
GET /businessHours/check
```

### **Log Activity**

```bash
POST /log
Content-Type: application/json

{
  "from": "393929828347",
  "text": "Hello",
  "action": "received"
}
```

### **Get Logs**

```bash
GET /logs?limit=100
```

---

## Command System (v1.8.0+)

Messages starting with `.`, `/`, or `!` are parsed as commands:

| Command | Description |
|---------|-------------|
| `.luci on` | Turn on lights |
| `.stato` | Get home status |
| `.temperatura` | Get temperature |
| `.foto cucina` | Send camera snapshot |
| `.ai [question]` | Ask AI a question |
| `/help` | Show help |

Commands are available in `msg.updates.command` with:
- `command`: The command name
- `args`: Array of arguments
- `argsText`: Arguments as string

---

## Events

| Event type               | Description                           |
| ------------------------ | ------------------------------------- |
| new_whatsapp_message     | The message that was received         |
| whatsapp_presence_update | Presence of contact in a chat updated |

---

## **Sample automations**

## Ping Pong

```yaml
- alias: Ping Pong
  description: ""
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: template
      value_template: "{{ trigger.event.data.message.conversation == '!ping' }}"
  action:
    - service: whatsapp.send_message
      data:
        clientId: default
        to: "{{ trigger.event.data.key.remoteJid }}"
        body:
          text: pong
  mode: single
```

## Arrive at home

```yaml
- alias: Arrive at home
  description: ""
  trigger:
    - platform: device
      domain: device_tracker
      entity_id: device_tracker.iphone_13_pro
      type: enter
      zone: zone.home
  condition: []
  action:
    - service: whatsapp.send_message
      data:
        clientId: default
        to: 391234567890@s.whatsapp.net
        body:
          text: Hi, I'm at home
  mode: single
```

## Driving mode

```yaml
- alias: Driving mode
  description: ""
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition: []
  action:
    - service: whatsapp.send_message
      data:
        clientId: "{{ trigger.event.data.clientId }}" # Which instance of whatsapp should the message come from
        to: "{{ trigger.event.data.key.remoteJid }}"
        body:
          text: Sorry, I'm driving, I will contact you soon
        options:
          quoted: "{{ trigger.event.data }}" # Quote message
  mode: single
```

## Message reaction

```yaml
- alias: React to message
  description: ""
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition: []
  action:
    - service: whatsapp.send_message
      data:
        clientId: "{{ trigger.event.data.clientId }}"
        to: "{{ trigger.event.data.key.remoteJid }}"
        body:
          react:
            text: "👍🏻" # Use an empty string to remove the reaction
            key: "{{ trigger.event.data.key }}"
  mode: single
```

## Presence notify (SUBSCRIBE FIRST!)

```yaml
- alias: Nuova automazione
  description: ""
  trigger:
    - platform: event
      event_type: whatsapp_presence_update
      event_data: {}
  condition:
    - condition: template
      value_template:
        "{{ trigger.event.data.presences['391234567890@s.whatsapp.net'].lastKnownPresence
        == 'available' }}"
  action:
    - service: persistent_notification.create
      data:
        message: Contact is online!
  mode: single
```
