import open from 'open';
import Fastify from 'fastify'
import translate from 'translate-google';
import fetch from 'node-fetch';
import fs from "fs";
import Audic from 'audic';
import _static from '@fastify/static';
import _websocket from '@fastify/websocket';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: false
})

const VOICEVOX_SPEAKER = 10
const url = "http://127.0.0.1:50021"
const port = 4000

fastify.register(_static, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/'
})
fastify.register(_websocket)
fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        connection.socket.on('message', message => {
            let word = (JSON.parse(message.toString()).msg).replace(/\s/g, '').toLowerCase()
            console.log(word)
            translate(word, { to: 'japanese' }).then(res => {
                speak(encodeURI(res))
            }).catch(err => {
                console.error(err)
            })
        })
    })
})

fastify.get('/', (req, reply) => {
    return reply.sendFile('/root/index.html')
});

fastify.listen({ port: port, host: "0.0.0.0" }, async (err, address) => {
    if (err) {
        console.error(err);
        console.error('FASTIFY CAN\'T START LISTENING.');
    } else {
        await open('http://localhost:' + port)
        console.info('[VoiceChanger] is now listening on : ' + address);
    }
});

async function speak(msg) {
    const audio_query_response = await fetch(url + "/audio_query?text=" + msg + "&speaker=" + VOICEVOX_SPEAKER,
        {
            method: 'POST'
        })
    const audio_query_json = await audio_query_response.json()
    const synthesis_response = await fetch(url + "/synthesis?speaker=" + VOICEVOX_SPEAKER,
        {
            method: 'post',
            body: JSON.stringify(audio_query_json),
            responseType: 'arraybuffer',
            headers: { "accept": "audio/wav", 'Content-Type': 'application/json' },
        }
    )
    const synthesis_response_buf = await synthesis_response.arrayBuffer()
    const buf = Buffer.from(synthesis_response_buf)
    fs.writeFileSync('sound/output.wav', buf)
    const audic = new Audic('sound/output.wav');
    await audic.play();
    audic.addEventListener('ended', () => {
        setTimeout(() => {
            audic.destroy();
        }, 1000);
    });
}