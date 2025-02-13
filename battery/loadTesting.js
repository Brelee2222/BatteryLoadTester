{
    let battery;

    let test;

    // Set the configurations to the load tester
    const setupConfigs = async function() {
        const mode = getLoadTestingConfig("mode");
        const level = getLoadTestingConfig("high")  ? "HIGH" : "LOW";

        // Set the mode
        const levelPromise = sendSerialMessage(`LEVEL ${level}`);

        // HIGH cannot be set lower than LOW, and LOW can't be set higher HIGH, therefore when to set HIGH to a value lower than the load's LOW, the LOW must be set first.
        const high1Promise = sendSerialMessage(`${mode}:HIGH ${getLoadTestingConfig(`constantModeValues.${mode}.HIGH`)}`);
        const lowPromise = sendSerialMessage(`${mode}:LOW ${getLoadTestingConfig(`constantModeValues.${mode}.LOW`)}`);
        const high2Promise = sendSerialMessage(`${mode}:HIGH ${getLoadTestingConfig(`constantModeValues.${mode}.HIGH`)}`);

        const ldOnPromise = sendSerialMessage(`ldonv ${getLoadTestingConfig("loadTestingSettings.onVoltage")}`);
        const ldOffPromise = sendSerialMessage(`ldoffv ${getLoadTestingConfig("loadTestingSettings.offVoltage")}`);

        const onPromise = sendSerialMessage(`LOAD ON`);

        await levelPromise;
        await high1Promise;
        await lowPromise;
        await high2Promise;
        await ldOnPromise;
        await ldOffPromise;
        await onPromise;
    }

    async function testBattery() {
        if(!battery) {
            alert("Please load a battery.");
            return;
        }

        if(!serialPort || !serialPort.connected) {
            alert("Load tester must be connected.");
            return;
        }

        document.querySelector("#startTest").disabled = true;

        setupConfigs();

        test = {
            name : new Date().toISOString(),
            startTime : Date.now(),
            idleVoltage : (await getNextReading()).voltage,
            drainDuration : undefined,
            testingSuccessful : false,
            timestamps: []
        };

        // delay to get a reading before starting the test
        setTimeout(loopBatteryTest, 3000);
    }

    const loopBatteryTest = async function() {
        while(true) {
            await new Promise(res => setTimeout(res, READING_INTERVAL_MILLIS));

            const readings = await getNextReading();

            if(!serialPort.connected) {
                alert("Load Tester Disconnected");
                finishBatteryTesting(false);
                return;
            }

            if(readings.current <= 0.1) {
                finishBatteryTesting(true);
                return;
            }

            test.timestamps.push(readings);
        }
    }

    const processTest = function() {
        let wattMillis = 0;
        let currentMax = -Infinity;
        let currentMin = Infinity;
        let voltageMax = -Infinity;
        let voltageMin = Infinity;

        let lastTime = test.startTime;
        for(const timestamp of test.timestamps) {
            wattMillis += timestamp.current * timestamp.voltage * (timestamp.time - lastTime);

            currentMax = Math.max(currentMax, timestamp.current);
            currentMin = Math.min(currentMin, timestamp.current);
            voltageMax = Math.max(voltageMax, timestamp.voltage);
            voltageMin = Math.min(voltageMin, timestamp.voltage);

            lastTime = timestamp.time;
        }

        battery.lastDrainDurationInSeconds = test.drainDuration = (lastTime - test.startTime) / 1000;

        battery.lastCapacity = wattMillis / 60 / 60 / 1000;
        battery.lastCurrentMax = currentMax;
        battery.lastCurrentMin = currentMin;
        battery.lastVoltageMax = voltageMax;
        battery.lastVoltageMin = voltageMin;
        battery.lastIdleVoltage = test.idleVoltage;
    }

    const finishBatteryTesting = function(successful) {
        sendSerialMessage(`LOAD OFF`);

        test.testingSuccessful = successful;

        battery.tests.push(test);

        processTest();

        displayBattery(battery);

        saveBatteryData();

        document.querySelector("#startTest").disabled = false;
    }

    // Load information about a battery
    function loadBattery() {
        const name = document.querySelector("#batteryName").value;

        if(name == "")
            return;

        // Secret command prompt
        if(name == "LoadTest") {
            showCommandPrompt();
            return;
        }

        battery = lookupBattery(name);

        if(!battery)
            battery = createBattery(name);

        displayBattery(battery);

        saveBatteryData();
    }

    document.querySelector("#loadBattery").addEventListener("click", loadBattery);

    document.querySelector("#startTest").addEventListener("click", testBattery);
}