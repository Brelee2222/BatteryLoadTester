{
    let serialPort;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8");

    async function selectPort() {
        if(serialPort == undefined) {
            serialPort = await navigator.serial.requestPort();

            if(serialPort == undefined)
                return console.error("Could not find serial device");

            document.querySelector("#portCheck").innerText = "Tester Selected";
        } else {
            serialPort.close();
        }
    }

    let queue = [];
    const TIMEOUT_DELAY = 25;
    let listenerID = 0;

    async function connect() {
        await serialPort.open(getLoadTestingConfig("portOptions"));

        listen();

        startReading();

        document.querySelector("#testerName").innerText = await requestSerialMessage("name");
    }

    async function listen() {
        const id = ++listenerID;
        const writer = serialPort.writable.getWriter();
        const reader = serialPort.readable.getReader();

        while(serialPort.connected) {
            // loop until a request is gotten
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

                    // To detect when the load tester does not respond.
                    const timeout = setTimeout(() => {
                        alert("Load tester took too long to respond.")
                        listen();
                    }, 10000);

                    const { value, done } = await reader.read();

                    // if a new listener was started, pass the request back into the queue, and stop
                    if(listenerID != id) {
                        queue.unshift(request);
                        return;
                    }

                    clearTimeout(timeout);

                    const char = decoder.decode(value);

                    if(done || char == "\n")
                        break;
                    
                    returnedMessage += char;
                }

                if(returnedMessage == "Error" || returnedMessage == "error")
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
    document.querySelector("#sendCommand").addEventListener("click", async () => alert(await sendSerialMessage(document.querySelector("#commandPrompt").value)));
}