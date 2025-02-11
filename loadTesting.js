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
        await sendSerialMessage(`LEVEL ${level}`);

        // HIGH cannot be set lower than LOW, and LOW can't be set higher HIGH, therefore when to set HIGH to a value lower than the load's LOW, the LOW must be set first.
        await sendSerialMessage(`${mode}:HIGH ${getLoadTestingConfig(`constantModeValues.${mode}.HIGH`)}`);
        await sendSerialMessage(`${mode}:LOW ${getLoadTestingConfig(`constantModeValues.${mode}.LOW`)}`);
        await sendSerialMessage(`${mode}:HIGH ${getLoadTestingConfig(`constantModeValues.${mode}.HIGH`)}`);

        await sendSerialMessage(`ldonv ${getLoadTestingConfig("loadTestingSettings.onVoltage")}`);
        await sendSerialMessage(`ldoffv ${getLoadTestingConfig("loadTestingSettings.offVoltage")}`);

        await sendSerialMessage(`LOAD ON`);
    }

    const testBattery = function() {
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
            timestamps: []
        };

        testInterval = setInterval(testBatteryTick, READING_INTERVAL_MILLIS);
    }

    const testBatteryTick = async function() {
        const readings = getLoadTesterReading();

        test.timestamps.push(readings);

        if(await requestSerialMessage("LOAD") == "off")
            finishBatteryTesting();
    }

    const finishBatteryTesting = function() {
        clearInterval(testInterval);
        testInterval = undefined;

        battery.tests.push(test);

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
            wattMillis += timestamp.power * timestamp.time - lastTime;

            currentMax = Math.max(currentMax, timestamp.current);
            currentMin = Math.min(currentMin, timestamp.current);
            voltageMax = Math.max(voltageMax, timestamp.voltage);
            voltageMin = Math.min(voltageMin, timestamp.voltage);
        }

        battery.lastCapacity = wattMillis * 1000 * 60 * 60;
        lastCurrentMax = currentMax;
        lastCurrentMin = currentMin;
        lastVoltageMax = voltageMax;
        lastVoltageMin = voltageMin;
    }

    // Load information about a battery
    const loadBattery = function() {
        const name = document.querySelector("#batteryName").value;

        if(name == "")
            return;

        if(name == "I have my discretion") {
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
        document.querySelector("#batteryLastCurrentMax").innerText = battery.lastCurrentMax;
        document.querySelector("#batteryLastCurrentMin").innerText = battery.lastCurrentMin;
    }

    document.querySelector("#loadBattery").addEventListener("click", loadBattery);

    document.querySelector("#startTest").addEventListener("click", testBattery);
}