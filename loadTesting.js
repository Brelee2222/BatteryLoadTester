{
    let battery;

    let test;
    let testInterval;

    function isTesting() {
        return testInterval != undefined;
    }

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

        setTimeout(() => sendSerialMessage(`ldonv ${getLoadTestingConfig("loadTestingSettings.stayOnVoltage")}`), 2000);
    }

    const testBattery = function() {
        if(!battery) {
            alert("Please load a battery.");
            return;
        }

        if(!serialPort || !serialPort.connected) {
            alert("Load tester must be connected.");
            return;
        }

        document.querySelector("#startTest").disabled = true;

        loadOnVoltage = getLoadTestingConfig("loadTestingSettings.onVoltage");
        loadOffVoltage = getLoadTestingConfig("loadTestingSettings.offVoltage");

        setupConfigs();

        test = {
            startTime : Date.now(),
            idleVoltage : getLoadTesterReading().voltage,
            timestamps: []
        };

        testInterval = setInterval(testBatteryTick, READING_INTERVAL_MILLIS);
    }

    const testBatteryTick = async function() {
        const readings = getLoadTesterReading();

        if(!serialPort.connected) {
            alert("Load Tester Disconnected");
            finishBatteryTesting();
            return;
        }

        if(readings.current <= 0) {
            finishBatteryTesting();
            return;
        }

        test.timestamps.push(readings);
    }

    const finishBatteryTesting = function() {
        clearInterval(testInterval);
        testInterval = undefined;

        battery.tests.push(test);

        sendSerialMessage(`LOAD OFF`);

        processTest();

        saveBatteryData();

        displayInformation();
        document.querySelector("#startTest").disabled = false;
    }

    const processTest = function() {
        let wattMillis = 0;
        let currentMax = -Infinity;
        let currentMin = Infinity;
        let voltageMax = -Infinity;
        let voltageMin = Infinity;

        let lastTime = test.startTime;
        for(const timestamp of test.timestamps) {
            wattMillis += timestamp.power * (timestamp.time - lastTime);

            currentMax = Math.max(currentMax, timestamp.current);
            currentMin = Math.min(currentMin, timestamp.current);
            voltageMax = Math.max(voltageMax, timestamp.voltage);
            voltageMin = Math.min(voltageMin, timestamp.voltage);

            lastTime = timestamp.time;
        }

        battery.lastCapacity = wattMillis / 60 / 60 / 1000;
        battery.lastCurrentMax = currentMax;
        battery.lastCurrentMin = currentMin;
        battery.lastVoltageMax = voltageMax;
        battery.lastVoltageMin = voltageMin;
        battery.lastIdleVoltage = test.idleVoltage
    }

    // Load information about a battery
    const loadBattery = function() {
        const name = document.querySelector("#batteryName").value;

        if(name == "")
            return;

        if(name == "LoadTest") {
            document.querySelector("#batteryName").value = "";
            document.querySelector("#command").style.display = "block";
            return;
        }

        battery = lookupBattery(name);

        if(!battery)
            battery = createBattery(name);

        displayInformation();

        saveBatteryData();
    }

    const displayInformation = function() {
        document.querySelector("#currentBatteryName").innerText = battery.name;
        document.querySelector("#batteryLastCapacity").innerText = battery.lastCapacity;
        document.querySelector("#batteryLastVoltageMax").innerText = battery.lastVoltageMax;
        document.querySelector("#batteryLastVoltageMin").innerText = battery.lastVoltageMin;
        document.querySelector("#batteryLastIdleVoltage").innerText = battery.idleVoltage;
        document.querySelector("#batteryLastCurrentMax").innerText = battery.lastCurrentMax;
        document.querySelector("#batteryLastCurrentMin").innerText = battery.lastCurrentMin;
    }

    document.querySelector("#loadBattery").addEventListener("click", loadBattery);

    document.querySelector("#startTest").addEventListener("click", testBattery);
}