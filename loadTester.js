const READING_INTERVAL_MILLIS = 5000;

{
    let current = 0;
    let voltage = 0;
    let power = 0;
    let time = 0;

    function startReading() {
        tickLoop();
    }

    async function tickLoop() {
        while(true) {
            const currentPromise = requestSerialMessage("measure:current");
            const voltagePromise = requestSerialMessage("measure:voltage");
            const powerPromise = requestSerialMessage("measure:power");

            const currentMeasure = await currentPromise;
            const voltageMeasure = await voltagePromise;
            const powerMeasure = await powerPromise;
            time = Date.now();

            current = Number(currentMeasure);
            voltage = Number(voltageMeasure);
            power = Number(powerMeasure);
            // power = Number(powerMeasure);

            document.querySelector("#currentReading").innerText = currentMeasure;
            document.querySelector("#voltageReading").innerText = voltageMeasure;
            document.querySelector("#powerReading").innerText = powerMeasure;
        }
    }

    function getLoadTesterReading() {
        return {
            current,
            voltage,
            power,
            time
        };
    }
}