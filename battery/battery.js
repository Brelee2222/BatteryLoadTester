{
    let currentBattery;

    function listTests() {
        const testSelect = document.querySelector("#testSelect");
        for(const child of testSelect.children)
            child.remove();

        const batteryTestNames = Object.keys(currentBattery.tests);
        batteryTestNames.map(testName =>  {
            const element = document.createElement("option");
            element.innerText = testName;
            return element;
        }).forEach(testSelect.appendChild, testSelect);

        document.querySelector("#testSelect").value = batteryTestNames[batteryTestNames.length-1];
        displayTestInformation(batteryTestNames[batteryTestNames.length-1]);
    }

    function loadBattery(battery) {
        currentBattery = battery;

        document.querySelector("#batteryName").innerText = battery.name;

        listTests();
    }

    function recordTest(test) {
        if(currentBattery.tests[test.name])
            return console.error("cannot overwrite a test");

        currentBattery.tests[test.name] = test;

        saveBatteryData();

        listTests();
    }

    const displayTestInformation = function(name) {
        const test = currentBattery.tests[name];

        if(!test)
            return console.error("Not a valid test");

        document.querySelector("#drainDuration").innerText = test.drainDuration;
        document.querySelector("#idleVoltage").innerText = test.idleVoltage;
        document.querySelector("#capacity").innerText = test.capacity;
        document.querySelector("#voltageMax").innerText = test.voltageMax;
        document.querySelector("#voltageMin").innerText = test.voltageMin;
        document.querySelector("#currentMax").innerText = test.currentMax;
        document.querySelector("#currentMin").innerText = test.currentMin;
    }

    function downloadTest() {
        const test = currentBattery.tests[document.querySelector("#testSelect").value];
        console.log(test);
        const timestamps = test.timestamps.map(timestamp => `${timestamp.time - test.startTime},${timestamp.voltage},${timestamp.current}\n`);
        const a = document.createElement("a");
        const blob = new Blob([`Battery Name,,${currentBattery.name}\n`, `Test Name,,${test.name}\n`, `Test Duration (s),,${test.drainDuration}\n`, `Capacity (wH),,${test.capacity}\n`,`Idle Voltage (V),,${test.idleVoltage}\n`,`Voltage Max (V),,${test.voltageMax}\n`, `Voltage Min (V),,${test.voltageMin}\n`, `Current Max (A),,${test.currentMax}\n`, `Current Min (A),,${test.currentMin}\n`, "\nTimestamps\n", "Time,Voltage,Current\n", ...timestamps], {type: "text/plain"});

        a.href = URL.createObjectURL(blob);
        a.download = `${test.name}.csv`;
        a.click();
        a.remove();
    }

    document.querySelector("#testDownload").addEventListener("click", downloadTest);
    document.querySelector("#testSelect").addEventListener("change", () => displayTestInformation(document.querySelector("#testSelect").value));
}