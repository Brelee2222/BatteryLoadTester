const CODE_VERSION = "1.0";

{
    // The current test being done
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

        document.querySelector("#startTest").disabled = true;

        test = {
            name : new Date().toUTCString(),
            // How data is collected matters to what capacity we get. We should store the code version to know how the data was collected. 
            codeVersion: CODE_VERSION,
            startTime : Date.now(),
            idleVoltage : (await getNextReading()).voltage,
            drainDuration : null,
            capacity : null,
            voltageMax : null,
            voltageMin : null,
            currentMax : null,
            currentMin : null,
            testingSuccessful : false,
            timestamps: []
        };

        setupConfigs();

        loopBatteryTest();
    }

    const loopBatteryTest = async function() {
        while(true) {
            await new Promise(res => setTimeout(res, READING_INTERVAL_MILLIS));

            const readings = await getNextReading();

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

        test.drainDuration = (lastTime - test.startTime) / 1000;

        test.capacity = wattMillis / 60 / 60 / 1000;
        test.currentMax = currentMax;
        test.currentMin = currentMin;
        test.voltageMax = voltageMax;
        test.voltageMin = voltageMin;
    }

    const finishBatteryTesting = function(successful) {
        sendSerialMessage(`LOAD OFF`);

        test.testingSuccessful = successful;

        processTest();

        recordTest(test);
    
        document.querySelector("#startTest").disabled = false;
    }
    
    document.querySelector("#startTest").addEventListener("click", testBattery);
}