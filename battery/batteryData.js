const BATTERY_DATA_ITEM = "batteryData";

{
    let batteryData;

    try {
        // apparently a JSON parse returns null if it is fed null, so I'm making it undefined to make it throw an error.
        const data = localStorage.getItem(BATTERY_DATA_ITEM) ?? undefined;

        batteryData = JSON.parse(data);
    } catch(e) {
        console.error(e);

        localStorage.setItem(BATTERY_DATA_ITEM, "{}");
        batteryData = {};
    }

    function saveBatteryData() {
        localStorage.setItem(BATTERY_DATA_ITEM, JSON.stringify(batteryData));
    }

    function createBattery(name) {
        if(!batteryData[name]) {
            createBatteryOption(name);
            
            return batteryData[name] = {
                name,
                lastCapacity : 0,
                lastIdleVoltage : 0,
                lastCurrentMax : 0,
                lastCurrentMin : 0,
                lastVoltageMax : 0,
                lastVoltageMin : 0,
                lastDrainDurationInSeconds : 0,
                tests : []
            };
        }
        return null;
    }

    function lookupBattery(name) {
        return batteryData[name];
    }

    for(const batteryName of Object.keys(batteryData))
        createBatteryOption(batteryName);
}