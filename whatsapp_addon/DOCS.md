# Home Assistant Add-on: WhatsApp

Complete documentation for the WhatsApp add-on for Home Assistant.

🇮🇹 [Versione italiana](DOCS_IT.md)

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [User ID Format](#user-id-format)
- [LID Format (Baileys v7)](#lid-format-baileys-v7)
- [Sending Messages](#sending-messages)
- [Receiving Messages](#receiving-messages)
- [Events](#events)
- [Sample Automations](#sample-automations)

---

## Installation

1. Add this repository to Home Assistant:
   ```
   https://github.com/GigilinE/whatsapp-addons-ha
   ```

2. Install the WhatsApp add-on from the add-on store

3. Start the add-on - you will see a persistent notification with a QR code

4. Scan the QR code with your WhatsApp mobile app (Settings > Linked Devices > Link a Device)

5. After successful pairing, restart Home Assistant

6. Add the following to your `configuration.yaml`:
   ```yaml
   whatsapp:
   ```

7. Restart Home Assistant again

8. You should now have the `whatsapp.send_message` service available

---

## Configuration

### Multiple WhatsApp Sessions

You can configure multiple WhatsApp sessions in the add-on configuration:

```yaml
clients:
  - default
  - business
  - family
```

Each client ID represents a separate WhatsApp session that needs to be authenticated with its own QR code.

---

## User ID Format

WhatsApp user IDs are composed of:

| Part | Description | Example |
|------|-------------|---------|
| Country code | Without + | `39` (Italy) |
| Phone number | Without spaces | `3456789010` |
| Suffix | User or group | `@s.whatsapp.net` or `@g.us` |

**Examples:**
- User: `393456789010@s.whatsapp.net`
- Group: `120363044852872915@g.us`
- Broadcast: `status@broadcast`

---

## LID Format (Baileys v7)

Starting from version 1.7.0, WhatsApp uses a new identifier format called **LID (Local Identifier)**.

### What is LID?

- LID is an anonymous identifier that WhatsApp uses internally
- In group chats, `key.participant` may contain `123456789@lid` instead of the phone number
- In private chats with `addressingMode: "lid"`, `remoteJid` may be LID format
- The `remoteJidAlt` field contains the real phone number when available

### Message Structure (v7)

**Private chat with LID:**
```json
{
  "key": {
    "remoteJid": "258359613726883@lid",
    "remoteJidAlt": "393481844469@s.whatsapp.net",
    "fromMe": false,
    "id": "ABC123",
    "addressingMode": "lid"
  },
  "pushName": "John Doe",
  "message": {
    "extendedTextMessage": {
      "text": "Hello!"
    }
  }
}
```

**Group chat:**
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
    "conversation": "Hello!"
  }
}
```

### Getting the Real Phone Number

- Use `remoteJidAlt` when available (contains the real phone number)
- The `pushName` field always contains the contact's display name

---

## Sending Messages

### Text Message

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    text: Hello, this is a text message!
```

### Image

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    image:
      url: "https://example.com/image.png"
    caption: Image description
```

### Video

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

### Video Note (Circle)

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    video:
      url: "https://example.com/video.mp4"
    ptv: true
```

### GIF

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

### Audio Message

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    audio:
      url: "https://example.com/audio.mp3"
    ptt: true  # true = voice message, false = audio file
```

### Document/File

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    document:
      url: "https://example.com/document.pdf"
    mimetype: "application/pdf"
    fileName: "document.pdf"
```

### Sticker

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    sticker:
      url: "https://example.com/sticker.webp"
```

### Location

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    location:
      degreesLatitude: 41.9028
      degreesLongitude: 12.4964
```

### Contact (vCard)

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

### View Once (disappearing media)

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    image:
      url: "https://example.com/image.png"
    viewOnce: true
    caption: This can only be viewed once
```

### Poll

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
      selectableCount: 1  # 1 = single choice, >1 = multiple choice
```

### Reaction

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    react:
      text: "👍"  # empty string to remove reaction
      key: "{{ trigger.event.data.key }}"
```

### Reply/Quote Message

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    text: This is a reply
  options:
    quoted: "{{ trigger.event.data }}"
```

---

## Receiving Messages

### Subscribe to Presence Updates

```yaml
service: whatsapp.presence_subscribe
data:
  clientId: default
  userId: 391234567890@s.whatsapp.net
```

### Send Presence Update

```yaml
service: whatsapp.send_presence_update
data:
  clientId: default
  type: available  # available, unavailable, composing, recording
  to: 391234567890@s.whatsapp.net
```

---

## Events

| Event | Description |
|-------|-------------|
| `new_whatsapp_message` | Fired when a new message is received |
| `whatsapp_presence_update` | Fired when a contact's presence changes |

### Event Data Structure

```yaml
# new_whatsapp_message
event:
  clientId: "default"
  type: "conversation"  # or extendedTextMessage, imageMessage, etc.
  key:
    remoteJid: "391234567890@s.whatsapp.net"
    remoteJidAlt: "391234567890@s.whatsapp.net"  # v7: real number
    fromMe: false
    id: "ABC123"
    participant: ""  # only in groups
    addressingMode: "lid"  # v7: lid or pn
  pushName: "John Doe"
  message:
    conversation: "Hello!"
  messageTimestamp: 1234567890
```

---

## Sample Automations

### Ping Pong

```yaml
- alias: WhatsApp Ping Pong
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
        to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
        body:
          text: pong
```

### Auto-reply When Away

```yaml
- alias: WhatsApp Auto Reply
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: state
      entity_id: input_boolean.away_mode
      state: "on"
  action:
    - service: whatsapp.send_message
      data:
        clientId: "{{ trigger.event.data.clientId }}"
        to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
        body:
          text: "I'm currently away. I'll reply as soon as possible."
        options:
          quoted: "{{ trigger.event.data }}"
```

### Notify on Arrival

```yaml
- alias: WhatsApp Arrival Notification
  trigger:
    - platform: zone
      entity_id: person.john
      zone: zone.home
      event: enter
  action:
    - service: whatsapp.send_message
      data:
        clientId: default
        to: 391234567890@s.whatsapp.net
        body:
          text: "John just arrived home!"
```

### React to Messages

```yaml
- alias: WhatsApp Auto React
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: template
      value_template: "{{ 'thanks' in trigger.event.data.message.conversation|lower }}"
  action:
    - service: whatsapp.send_message
      data:
        clientId: "{{ trigger.event.data.clientId }}"
        to: "{{ trigger.event.data.key.remoteJid }}"
        body:
          react:
            text: "❤️"
            key: "{{ trigger.event.data.key }}"
```

### Presence Notification

```yaml
- alias: WhatsApp Contact Online
  trigger:
    - platform: event
      event_type: whatsapp_presence_update
  condition:
    - condition: template
      value_template: >
        {{ trigger.event.data.presences['391234567890@s.whatsapp.net'].lastKnownPresence == 'available' }}
  action:
    - service: notify.mobile_app
      data:
        message: "Contact is now online!"
```

### Send Camera Snapshot

```yaml
- alias: WhatsApp Camera Snapshot
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: template
      value_template: "{{ trigger.event.data.message.conversation == '!camera' }}"
  action:
    - service: camera.snapshot
      target:
        entity_id: camera.front_door
      data:
        filename: /config/www/snapshot.jpg
    - delay: 2
    - service: whatsapp.send_message
      data:
        clientId: default
        to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
        body:
          image:
            url: "http://YOUR_HA_IP:8123/local/snapshot.jpg"
          caption: "Front door camera"
```

---

## Troubleshooting

### QR Code Not Appearing
- Check the add-on logs for errors
- Restart the add-on
- Make sure port 3000 is not blocked

### Messages Not Sending
- Verify the user ID format is correct
- Check if the add-on is connected (check logs)
- Ensure you're not rate-limited by WhatsApp

### Disconnection Issues
- Version 1.7.0 includes fixes for disconnection issues
- The add-on automatically reconnects when disconnected
- If problems persist, delete the session folder and re-authenticate

### LID Format Issues
- Use `remoteJidAlt` instead of `remoteJid` for the real phone number
- The `pushName` field always contains the display name
