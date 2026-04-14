Here's the fully debugged QR file:
// QR Code Session - QUEENBELLA MD
// Fixed by RoyTech

const express = require("express");
const app = express();
const pino = require("pino");
const { toBuffer } = require("qrcode");
const fs = require("fs");
const { Boom } = require("@hapi/boom");

const PORT = process.env.PORT || 5000;
const MESSAGE = process.env.MESSAGE || `
┌───⭓『
❒ *QUEENBELLA-MD*
❒ _NOW DEPLOY IT_
└────────────⭓
┌───⭓
❒  • Chat with owner •
❒ *GitHub:* _https://github.com/queenbellabots-cloud/Queen_bella-md-v1_
❒ *Author:* _wa.me/254755660053_
❒ *YT:* _coming soon_
└────────────⭓
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
}

app.get("/", async (req, res) => {
    const {
        default: WasiWASocket,
        useMultiFileAuthState,
        Browsers,
        delay,
        DisconnectReason
    } = require("@whiskeysockets/baileys");

    async function WASI() {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

        try {
            let Smd = WasiWASocket({
                printQRInTerminal: false,
                logger: pino({ level: "silent" }),
                browser: ["Chrome (Linux)", "", ""],
                auth: state
            });

            // ✅ Moved outside connection.update
            Smd.ev.on('creds.update', saveCreds);

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        res.end(await toBuffer(qr));
                    }
                }

                if (connection === "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    let CREDS = fs.readFileSync('./auth_info_baileys/creds.json');
                    let Scan_Id = Buffer.from(CREDS).toString('base64');

                    console.log(`
==================== SESSION ID ==========================
SESSION-ID ==> ${Scan_Id}
-------------------  SESSION CLOSED  ---------------------
`);

                    let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                    await delay(1000);

                    try {
                        fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
                    } catch(e) {
                        console.log(e);
                    }
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection lost from server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart required, restarting...");
                        WASI().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection timed out!");
                    } else {
                        console.log("Connection closed. Reason:", reason);
                    }
                }
            });

        } catch (err) {
            console.log(err);
            try {
                fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
            } catch(e) {}
        }
    }

    WASI().catch(async (err) => {
        console.log(err);
        try {
            fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
        } catch(e) {}
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));