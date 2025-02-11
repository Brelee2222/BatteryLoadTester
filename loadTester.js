const READING_INTERVAL_MILLIS = 1000;

{
    let current = 0;
    let volt = 0;
    let resistance = 0;
    let power = 0;
    let time = 0;

    async function tick() {
        // subject to change as the correct syntax for the load tester is looked-up
        current = Number(await requestSerialMessage("measure:current?"));
        volt = Number(await requestSerialMessage("measure:voltage?"));
        resistance = Number(await requestSerialMessage("measure:resistance?"));
        power = Number(await requestSerialMessage("measure:power?"));
        time = Date.now();
    }

    function getLoadTesterReading() {
        return {
            current,
            volt,
            resistance,
            power,
            time
        };
    }

    setInterval(tick, READING_INTERVAL_MILLIS);
}