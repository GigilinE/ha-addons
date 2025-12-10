[![PayPal Donate](https://img.shields.io/badge/PayPal-Donate-blue?logo=paypal)](https://www.paypal.com/paypalme/LuigiZotti600)
[![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2FGigilinE%2Fha-addons)

# Home Assistant Add-on: WhatsApp

_Send and receive WhatsApp messages from Home Assistant_

<img src="https://github.com/GigilinE/ha-addons/blob/main/whatsapp_addon/logo.png?raw=true" width="400"/>

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg

A WhatsApp API client that connects through the WhatsApp Web browser app.

**NOTE:** I can't guarantee you will not be blocked by using this method, although it has worked for me. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## Features

- Send text, images, videos, audio, documents, stickers, locations, contacts, polls
- Receive and react to messages
- Multiple WhatsApp sessions support
- Presence updates (online/offline status)
- Full support for Baileys v7 LID format

## Quick Start

1. Add this repository to Home Assistant:
   ```
   https://github.com/GigilinE/ha-addons
   ```

2. Install and start the WhatsApp add-on

3. Scan the QR code with your WhatsApp mobile app

4. Add to `configuration.yaml`:
   ```yaml
   whatsapp:
   ```

5. Restart Home Assistant

## Documentation

For complete documentation, see **[DOCS.md](whatsapp_addon/DOCS.md)**

🇮🇹 Documentazione in italiano: **[DOCS_IT.md](whatsapp_addon/DOCS_IT.md)**

## Changelog

See **[CHANGELOG.md](whatsapp_addon/CHANGELOG.md)** for version history.

## Credits

This project was originally created by **Giuseppe Castaldo** (versions up to 1.5.0).

From version 1.6.0 onwards, the project is maintained by **GigilinE**.
