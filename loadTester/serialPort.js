{
    let serialPort;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");

    async function selectPort() {
        if(serialPort == undefined) {
            serialPort = await navigator.serial.requestPort();

            if(serialPort == undefined)
                return console.error("Could not find serial device");

            showPortSelected();
        } else {
            serialPort.close();
        }
    }

    async function connect() {
        await serialPort.open(getLoadTestingConfig("portOptions"));

        listen();

        startReading();

        setLoadTesterName(await requestSerialMessage("name"));
    }

    const queue = [];
    const TIMEOUT_DELAY = 25;

    async function listen() {
        const writer = serialPort.writable.getWriter();
        const reader = serialPort.readable.getReader();

        while(serialPort.connected) {
            let request;
        
            do {
                await new Promise(res => setTimeout(res, TIMEOUT_DELAY));
                request = queue.shift();
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

    document.querySelector("#selectLoad").addEventListener("click", selectPort);
    document.querySelector("#connect").addEventListener("click", connect);

    document.querySelector("#sendCommand").addEventListener("click", async () => {
        alert(await sendSerialMessage(document.querySelector("#commandPrompt").value));
    });
}