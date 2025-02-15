const READING_INTERVAL_MILLIS = 10;

{
    // Promise value to allow async functions to wait for the latest readings
    let nextReading;

    function getNextReading() {
        return nextReading;
    }

    function startReading() {
        tickLoop();
    }

    async function tickLoop() {
        const currentReading = document.querySelector("#currentReading");
        const voltageReading = document.querySelector("#voltageReading");
        const powerReading = document.querySelector("#powerReading");

        while(true) {
            await new Promise(res => setTimeout(res, READING_INTERVAL_MILLIS));

            const readings = await (nextReading = readLatest());

            currentReading.innerText = readings.current;
            voltageReading.innerText = readings.voltage;
            powerReading.innerText = readings.current * readings.voltage;
        }
    }

    async function readLatest() {
        const currentPromise = requestSerialMessage("measure:current");
        const voltagePromise = requestSerialMessage("measure:voltage");

        const current = Number(await currentPromise);
        const voltage = Number(await voltagePromise);
        const time = Date.now();

        const readings = {
            current,
            voltage,
            time
        };

        return readings;
    }
}