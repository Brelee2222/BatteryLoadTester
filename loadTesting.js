{
    let battery;

    let test;
    let testInterval;

    function isTesting() {
        return testInterval != undefined;
    }

    // Set the configurations to the load tester
    const setupConfigs = function() {

    }

    // Test the battery
    let loadOnVoltage;
    let loadOffVoltage;
    async function testBattery() {
        loadOnVoltage = getLoadTestingConfig("loadTestingSettings.onVoltage");
        loadOffVoltage = getLoadTestingConfig("loadTestingSettings.offVoltage");

        setupConfigs();

        test = {
            startTime : Date.now(),
            timestamps: []
        };

        testInterval = setInterval(testBatteryTick, READING_INTERVAL_MILLIS);

        testInProgress = true;
    }

    const testBatteryTick = function() {
        const readings = getLoadTesterReading();

        test.timestamps.push(readings);

        if(loadOffVoltage >= readings.voltage)
            finishBatteryTesting();
    }

    const finishBatteryTesting = function() {
        clearInterval(testInterval);
        testInterval = undefined;

        battery.tests.push(test);

        saveBatteryData();
    }

    // Load information about a battery
    const loadBattery = function() {
        const name = document.querySelector("#batteryName").value;

        if(name == "")
            return;

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
}