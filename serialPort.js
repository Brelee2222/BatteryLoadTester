let serialPort;

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

async function initializeSerial() {
    serialPort = await navigator.serial.requestPort();

    if(serialPort == undefined)
        console.error("Could not find serial device");

    await connectSerial();
}

async function connectSerial() {
    await serialPort.open(getLoadTestingConfig("portOptions"));
}

async function sendSerialMessage(message) {
    if(serialPort.writable.locked) {
        console.log("Serial Port Writable Locked");
        return false;
    }

    const writer = serialPort.writable.getWriter();

    await writer.write(encoder.encode(message));

    writer.close();
    return true;
}

async function requestSerialMessage(message) {
    if(serialPort.readable.locked) {
        console.log("Serial Port Readable Locked");
        return null;
    }

    const reader = serialPort.readable.getReader();

    if(!sendSerialMessage(message))
        return null;

    let returnedMessage = "";

    let lastChar = "\n";
    while(true) {
        const {value, done} = await reader.read();

        if(done)
            return null;

        lastChar = decoder.decode(value);

        if(lastChar == "\n") {
            if(returnedMessage == "error")
                console.error("Load Tester Error");
            
            return returnedMessage;
        }

        returnedMessage += lastChar;
    }
}

document.querySelector("#sendCommand").addEventListener("click", () => {
    sendSerialMessage(document.querySelector("#commandPrompt").value);
});