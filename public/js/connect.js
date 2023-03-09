const connection = new WebSocket('ws://'+window.location.host+'/ws')
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

//config
recognition.interimResults = true;
recognition.lang = 'th-TH';

//connect to backend
connection.onopen = () => {
  console.log("[>] connect to VOX VOICECHANGER backend...");
}
connection.onerror = (err) => {
  document.getElementById("botreply").innerText = "WebSocket Error:" + err
}
connection.onmessage = (msg) => {
  let res = JSON.parse(msg.data)
  console.log(res)
  if (res?.awake === false) awake = false
  _log(`<i class="fas fa-angle-right" style="color: #6fff87"></i> Awake: <span style="color: ${res?.awake?'#6fff87':'#ffad69'}">${res?.awake}</span>`)
  document.getElementById("awake").style = res?.awake?"color: #be185d":"color: #ff69ab"
  if(res?.msg) {
    document.getElementById("botreply").innerText = res?.msg
    _log(`<i class="fas fa-angle-right" style="color: #ff69ab"></i> Reply: ${res?.msg}`)
    document.getElementById("showbotreply").style = "display: block;"
  }else{
    document.getElementById("botreply").innerText = "..."
    document.getElementById("showbotreply").style = "display: none;"
  }
}

//voice
recognition.addEventListener("result", (e) => {
  const text = Array.from(e.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");
  if (e.results[0].isFinal) {
    if (!isOpen(connection)) {
      return window.location.reload()
    }
    document.getElementById("speak").innerText = text
    _log(`<i class="fas fa-angle-right"></i> Voice: ${text}`)
    connection.send(JSON.stringify({ msg: text }));
  }
});
recognition.addEventListener("end", () => { recognition.start() });
recognition.start();

setInterval(() => {
  window.location.reload()
}, 1000 * 60 * 10);

function isOpen(ws) { return ws.readyState === ws.OPEN }

function _log(msg){
  document.getElementById("log").innerHTML += `<p style="padding: 0px; margin: 0px;">${msg}</p>`
  document.getElementById("log").scrollTo(0,document.getElementById("log").scrollHeight)
}