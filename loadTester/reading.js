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
        while(true) {
            await new Promise(res => setTimeout(res, READING_INTERVAL_MILLIS));

            nextReading = readLatest();

            await nextReading;
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

        displayReadings(readings);

        return readings;
    }
}