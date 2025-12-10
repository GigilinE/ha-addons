[![PayPal Donate](https://img.shields.io/badge/PayPal-Donate-blue?logo=paypal)](https://www.paypal.com/paypalme/LuigiZotti600)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/connectyourlife)

# Home Assistant Add-on: WhatsApp

_Send and receive WhatsApp messages from Home Assistant_

<img src="https://github.com/GigilinE/whatsapp-addons-ha/blob/main/whatsapp_addon/logo.png?raw=true" width="400"/>

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

## Quick Start

1. Add this repository: `https://github.com/GigilinE/whatsapp-addons-ha`
2. Install and start the add-on
3. Scan the QR code with WhatsApp
4. Add `whatsapp:` to `configuration.yaml`
5. Restart Home Assistant

## Documentation

See **[DOCS.md](DOCS.md)** for complete documentation including:

- All message types (text, images, videos, audio, documents, etc.)
- LID format explanation (Baileys v7)
- Event handling
- Sample automations
- Troubleshooting

🇮🇹 Documentazione in italiano: **[DOCS_IT.md](DOCS_IT.md)**
