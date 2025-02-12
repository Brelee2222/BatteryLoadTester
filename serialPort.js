let serialPort;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

async function initializeSerial() {
    serialPort = await navigator.serial.requestPort();

    if(serialPort == undefined)
        console.error("Could not find serial device");

    await connectSerial();

    listen();

    document.querySelector("#testerName").innerText = await requestSerialMessage("name");

    startReading();
}

async function connectSerial() {
    await serialPort.open(getLoadTestingConfig("portOptions"));
}

const queue = [];
const TIMEOUT_DELAY = 10;

async function listen() {
    const writer = serialPort.writable.getWriter();
    const reader = serialPort.readable.getReader();

    while(true) {
        let request;
    
        do {
           request = queue.shift();

           await new Promise(res => setTimeout(res, TIMEOUT_DELAY));
        } while(!request);

        if(!request) {
            setTimeout(tick, TIMEOUT_DELAY);
            return;
        }



        writer.write(encoder.encode(request.message + "\n"));

        if(request.message.endsWith("?")) {
            let returnedMessage = "";

            while(true) {
                const timeout = setTimeout(() => alert("Load tester took too long to respond."), 10000);

                const { value, done } = await reader.read();

                clearTimeout(timeout);

                const char = decoder.decode(value);

                if(done || char == "\n")
                    break;
                
                returnedMessage += char;
            }

            if(returnedMessage == "Error")
                alert("Load Tester Error");

            request.response(returnedMessage);
        } else {
            request.response();
        }
    }
}

function sendSerialMessage(message) {
    return new Promise(response => queue.push({
        message,
        response
    }));
}

function requestSerialMessage(message) {
    return sendSerialMessage(message + "?");
}

document.querySelector("#sendCommand").addEventListener("click", async () => {
    alert(await sendSerialMessage(document.querySelector("#commandPrompt").value));
});