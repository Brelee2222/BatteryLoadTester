let currentBattery;

function loadBattery(name) {
    currentBattery = lookupBattery(name);

    if(!currentBattery)
        currentBattery = createBattery(name);
}

function setupConfigs() {

}

async function testBattery() {
    // const interval = setInterval();
}