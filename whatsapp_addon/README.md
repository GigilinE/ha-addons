[![Buy Me a Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/zkfpkdwyhyq)
# Home Assistant Add-on: Whatsapp add-on

_Write your Whatsapp message from Home Assistant_

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

A WhatsApp API client that connects through the WhatsApp Web browser app

**NOTE:** I can't guarantee you will not be blocked by using this method, although it has worked for me. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.

## What's New in v1.7.0

- **Upgraded to Baileys v7.0.0-rc.9** - Major stability improvements and fixes for WhatsApp disconnection issues
- **LID Support** - Full support for WhatsApp's new Local Identifier format used in groups
- **ES Modules** - Migrated to modern JavaScript modules (requires Node.js >= 20)
- **Re-authentication required** after updating to this version

# Installation guide

Install add-on from this repository:

```
https://github.com/GigilinE/ha-addons
```

Start the add-on and in a few seconds you will see a persistent notification with QRCode, please scan this one with Whatsapp Mobile app.

After add-on installation restart Home Assistant and then copy the following code in _configuration.yaml_

```yaml
whatsapp:
```

Then restart Home Assistant. If all went well you will se a _whatsapp.send_message_ service.
