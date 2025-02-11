let serialPort;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

async function initializeSerial() {
    serialPort = await navigator.serial.requestPort();

    if(serialPort == undefined)
        console.error("Could not find serial device");

    await connectSerial();

    document.querySelector("#testerName").innerText = await requestSerialMessage("name");

    listen();

    startReading();
}

async function connectSerial() {
    await serialPort.open(getLoadTestingConfig("portOptions"));
}

const queue = [];

async function listen() {
    const writer = serialPort.writable.getWriter();
    const reader = serialPort.readable.getReader();

    while(true) {
        let request;

        do {
            request = queue.unshift()
        } while(!request);

        await writer.write(encoder.encode(request.message + "\n"));

        if(request.message.endsWith("?")) {
            let returnedMessage = "";

            while(true) {
                const { value, done } = await reader.read();

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