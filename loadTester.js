const READING_INTERVAL_MILLIS = 1000;

{
    let current = 0;
    let voltage = 0;
    let resistance = 0;
    let power = 0;
    let time = 0;

    function startReading() {
        setInterval(tick, READING_INTERVAL_MILLIS);
    }

    async function tick() {
        // subject to change as the correct syntax for the load tester is looked-up
        const currentMeasure = await requestSerialMessage("measure:current?");
        const voltageMeasure = await requestSerialMessage("measure:voltage?");
        const resistanceMeasure = await requestSerialMessage("measure:resistance?");
        const powerMeasure = await requestSerialMessage("measure:power?");

        time = Date.now();

        current = Number(currentMeasure);
        voltage = Number(voltageMeasure);
        resistance = Number(resistanceMeasure);
        power = Number(powerMeasure);

        document.querySelector("#currentReading").innerText = currentMeasure;
        document.querySelector("#voltageReading").innerText = voltageMeasure;
        document.querySelector("#resistanceReading").innerText = resistanceMeasure;
        document.querySelector("#powerReading").innerText = powerMeasure;
    }

    function getLoadTesterReading() {
        return {
            current,
            voltage,
            resistance,
            power,
            time
        };
    }
}