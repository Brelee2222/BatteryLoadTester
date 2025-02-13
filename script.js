function displayBattery(battery) {
    document.querySelector("#currentBatteryName").innerText = battery.name;
    document.querySelector("#batteryLastCapacity").innerText = battery.lastCapacity;
    document.querySelector("#batteryLastVoltageMax").innerText = battery.lastVoltageMax;
    document.querySelector("#batteryLastVoltageMin").innerText = battery.lastVoltageMin;
    document.querySelector("#batteryLastIdleVoltage").innerText = battery.lastIdleVoltage;
    document.querySelector("#batteryLastCurrentMax").innerText = battery.lastCurrentMax;
    document.querySelector("#batteryLastCurrentMin").innerText = battery.lastCurrentMin;
    document.querySelector("#batteryLastDrainDuration").innerText = battery.lastDrainDurationInSeconds;
}

const batteryList = document.querySelector('#batteryNames');
function createBatteryOption(batteryName) {
    const element = document.createElement("option");
    element.value = batteryName;

    batteryList.appendChild(element);
}

function showCommandPrompt() {
    document.querySelector("#batteryName").value = "";
    document.querySelector("#command").style.display = "block";
}

function displayReadings(readings) {
    document.querySelector("#currentReading").innerText = readings.current;
    document.querySelector("#voltageReading").innerText = readings.voltage;
    document.querySelector("#powerReading").innerText = readings.current * readings.voltage;
}

function setLoadTesterName(name) {
    document.querySelector("#testerName").innerText = name;
}

function showPortSelected() {
    document.querySelector("#portCheck").innerText = "Tester Selected";
}