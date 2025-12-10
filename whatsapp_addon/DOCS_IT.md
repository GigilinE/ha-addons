# Home Assistant Add-on: WhatsApp

Documentazione completa per l'add-on WhatsApp per Home Assistant.

🇬🇧 [English version](DOCS.md)

## Indice

- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Formato User ID](#formato-user-id)
- [Formato LID (Baileys v7)](#formato-lid-baileys-v7)
- [Invio Messaggi](#invio-messaggi)
- [Ricezione Messaggi](#ricezione-messaggi)
- [Eventi](#eventi)
- [Automazioni di Esempio](#automazioni-di-esempio)

---

## Installazione

1. Aggiungi questa repository a Home Assistant:
   ```
   https://github.com/GigilinE/ha-addons
   ```

2. Installa l'add-on WhatsApp dallo store degli add-on

3. Avvia l'add-on - vedrai una notifica persistente con un codice QR

4. Scansiona il codice QR con l'app WhatsApp (Impostazioni > Dispositivi collegati > Collega un dispositivo)

5. Dopo l'accoppiamento, riavvia Home Assistant

6. Aggiungi al tuo `configuration.yaml`:
   ```yaml
   whatsapp:
   ```

7. Riavvia nuovamente Home Assistant

8. Ora dovresti avere il servizio `whatsapp.send_message` disponibile

---

## Configurazione

### Sessioni WhatsApp Multiple

Puoi configurare più sessioni WhatsApp nella configurazione dell'add-on:

```yaml
clients:
  - default
  - business
  - famiglia
```

Ogni client ID rappresenta una sessione WhatsApp separata che deve essere autenticata con il proprio codice QR.

---

## Formato User ID

Gli User ID di WhatsApp sono composti da:

| Parte | Descrizione | Esempio |
|-------|-------------|---------|
| Prefisso internazionale | Senza + | `39` (Italia) |
| Numero di telefono | Senza spazi | `3456789010` |
| Suffisso | Utente o gruppo | `@s.whatsapp.net` o `@g.us` |

**Esempi:**
- Utente: `393456789010@s.whatsapp.net`
- Gruppo: `120363044852872915@g.us`
- Broadcast: `status@broadcast`

---

## Formato LID (Baileys v7)

A partire dalla versione 1.7.0, WhatsApp utilizza un nuovo formato identificativo chiamato **LID (Local Identifier)**.

### Cos'è il LID?

- Il LID è un identificativo anonimo che WhatsApp usa internamente
- Nelle chat di gruppo, `key.participant` può contenere `123456789@lid` invece del numero di telefono
- Nelle chat private con `addressingMode: "lid"`, `remoteJid` può essere in formato LID
- Il campo `remoteJidAlt` contiene il numero di telefono reale quando disponibile

### Struttura del Messaggio (v7)

**Chat privata con LID:**
```json
{
  "key": {
    "remoteJid": "258359613726883@lid",
    "remoteJidAlt": "393481844469@s.whatsapp.net",
    "fromMe": false,
    "id": "ABC123",
    "addressingMode": "lid"
  },
  "pushName": "Mario Rossi",
  "message": {
    "extendedTextMessage": {
      "text": "Ciao!"
    }
  }
}
```

**Chat di gruppo:**
```json
{
  "key": {
    "remoteJid": "123456789-987654321@g.us",
    "fromMe": false,
    "id": "ABC123",
    "participant": "258359613726883@lid"
  },
  "pushName": "Mario Rossi",
  "message": {
    "conversation": "Ciao!"
  }
}
```

### Ottenere il Numero di Telefono Reale

- Usa `remoteJidAlt` quando disponibile (contiene il numero reale)
- Il campo `pushName` contiene sempre il nome visualizzato del contatto

---

## Invio Messaggi

### Messaggio di Testo

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    text: Ciao, questo è un messaggio di testo!
```

### Immagine

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    image:
      url: "https://esempio.com/immagine.png"
    caption: Descrizione immagine
```

### Video

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    video:
      url: "https://esempio.com/video.mp4"
    caption: Descrizione video
```

### Video Nota (Cerchio)

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    video:
      url: "https://esempio.com/video.mp4"
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
      url: "https://esempio.com/animazione.mp4"
    gifPlayback: true
```

### Messaggio Audio

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    audio:
      url: "https://esempio.com/audio.mp3"
    ptt: true  # true = messaggio vocale, false = file audio
```

### Documento/File

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    document:
      url: "https://esempio.com/documento.pdf"
    mimetype: "application/pdf"
    fileName: "documento.pdf"
```

### Sticker

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    sticker:
      url: "https://esempio.com/sticker.webp"
```

### Posizione

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

### Contatto (vCard)

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    contacts:
      displayName: "Mario Rossi"
      contacts:
        - vcard: |
            BEGIN:VCARD
            VERSION:3.0
            FN:Mario Rossi
            TEL;type=CELL;type=VOICE;waid=391234567890:+39 123 456 7890
            END:VCARD
```

### Visualizza Una Volta (media effimero)

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    image:
      url: "https://esempio.com/immagine.png"
    viewOnce: true
    caption: Questo può essere visualizzato una sola volta
```

### Sondaggio

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    poll:
      name: "Qual è il tuo colore preferito?"
      values:
        - Rosso
        - Blu
        - Verde
      selectableCount: 1  # 1 = scelta singola, >1 = scelta multipla
```

### Reazione

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    react:
      text: "👍"  # stringa vuota per rimuovere la reazione
      key: "{{ trigger.event.data.key }}"
```

### Risposta/Citazione Messaggio

```yaml
service: whatsapp.send_message
data:
  clientId: default
  to: 391234567890@s.whatsapp.net
  body:
    text: Questa è una risposta
  options:
    quoted: "{{ trigger.event.data }}"
```

---

## Ricezione Messaggi

### Iscriversi agli Aggiornamenti di Presenza

```yaml
service: whatsapp.presence_subscribe
data:
  clientId: default
  userId: 391234567890@s.whatsapp.net
```

### Inviare Aggiornamento di Presenza

```yaml
service: whatsapp.send_presence_update
data:
  clientId: default
  type: available  # available, unavailable, composing, recording
  to: 391234567890@s.whatsapp.net
```

---

## Eventi

| Evento | Descrizione |
|--------|-------------|
| `new_whatsapp_message` | Scatenato quando viene ricevuto un nuovo messaggio |
| `whatsapp_presence_update` | Scatenato quando cambia la presenza di un contatto |

### Struttura Dati Evento

```yaml
# new_whatsapp_message
event:
  clientId: "default"
  type: "conversation"  # o extendedTextMessage, imageMessage, ecc.
  key:
    remoteJid: "391234567890@s.whatsapp.net"
    remoteJidAlt: "391234567890@s.whatsapp.net"  # v7: numero reale
    fromMe: false
    id: "ABC123"
    participant: ""  # solo nei gruppi
    addressingMode: "lid"  # v7: lid o pn
  pushName: "Mario Rossi"
  message:
    conversation: "Ciao!"
  messageTimestamp: 1234567890
```

---

## Automazioni di Esempio

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

### Risposta Automatica Quando Assente

```yaml
- alias: WhatsApp Risposta Automatica
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: state
      entity_id: input_boolean.modalita_assente
      state: "on"
  action:
    - service: whatsapp.send_message
      data:
        clientId: "{{ trigger.event.data.clientId }}"
        to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
        body:
          text: "Sono attualmente assente. Risponderò appena possibile."
        options:
          quoted: "{{ trigger.event.data }}"
```

### Notifica all'Arrivo

```yaml
- alias: WhatsApp Notifica Arrivo
  trigger:
    - platform: zone
      entity_id: person.mario
      zone: zone.home
      event: enter
  action:
    - service: whatsapp.send_message
      data:
        clientId: default
        to: 391234567890@s.whatsapp.net
        body:
          text: "Mario è appena arrivato a casa!"
```

### Reagisci ai Messaggi

```yaml
- alias: WhatsApp Reazione Automatica
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: template
      value_template: "{{ 'grazie' in trigger.event.data.message.conversation|lower }}"
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

### Notifica Presenza

```yaml
- alias: WhatsApp Contatto Online
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
        message: "Il contatto è ora online!"
```

### Invia Foto dalla Telecamera

```yaml
- alias: WhatsApp Foto Telecamera
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: template
      value_template: "{{ trigger.event.data.message.conversation == '!telecamera' }}"
  action:
    - service: camera.snapshot
      target:
        entity_id: camera.ingresso
      data:
        filename: /config/www/snapshot.jpg
    - delay: 2
    - service: whatsapp.send_message
      data:
        clientId: default
        to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
        body:
          image:
            url: "http://TUO_IP_HA:8123/local/snapshot.jpg"
          caption: "Telecamera ingresso"
```

### Risposta Automatica Fuori Orario

```yaml
- alias: WhatsApp Fuori Orario
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: time
      after: "18:00:00"
      before: "09:00:00"
  action:
    - service: whatsapp.send_message
      data:
        clientId: "{{ trigger.event.data.clientId }}"
        to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
        body:
          text: "Grazie per il messaggio. Siamo chiusi. Risponderemo domani mattina."
```

### Controllo Luci via WhatsApp

```yaml
- alias: WhatsApp Controllo Luci
  trigger:
    - platform: event
      event_type: new_whatsapp_message
  condition:
    - condition: template
      value_template: "{{ trigger.event.data.message.conversation.startswith('.luci') }}"
  action:
    - choose:
        - conditions:
            - condition: template
              value_template: "{{ 'on' in trigger.event.data.message.conversation }}"
          sequence:
            - service: light.turn_on
              target:
                entity_id: light.soggiorno
            - service: whatsapp.send_message
              data:
                clientId: default
                to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
                body:
                  text: "Luci accese!"
        - conditions:
            - condition: template
              value_template: "{{ 'off' in trigger.event.data.message.conversation }}"
          sequence:
            - service: light.turn_off
              target:
                entity_id: light.soggiorno
            - service: whatsapp.send_message
              data:
                clientId: default
                to: "{{ trigger.event.data.key.remoteJidAlt or trigger.event.data.key.remoteJid }}"
                body:
                  text: "Luci spente!"
```

---

## Risoluzione Problemi

### Il Codice QR Non Appare
- Controlla i log dell'add-on per errori
- Riavvia l'add-on
- Assicurati che la porta 3000 non sia bloccata

### I Messaggi Non Vengono Inviati
- Verifica che il formato dell'user ID sia corretto
- Controlla se l'add-on è connesso (verifica i log)
- Assicurati di non essere limitato da WhatsApp

### Problemi di Disconnessione
- La versione 1.7.0 include fix per i problemi di disconnessione
- L'add-on si riconnette automaticamente quando disconnesso
- Se i problemi persistono, elimina la cartella della sessione e ri-autenticati

### Problemi con il Formato LID
- Usa `remoteJidAlt` invece di `remoteJid` per il numero di telefono reale
- Il campo `pushName` contiene sempre il nome visualizzato
