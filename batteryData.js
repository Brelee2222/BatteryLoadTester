const BATTERY_DATA_ITEM = "batteryData";

{
    let batteryData;

    try {
        const data = localStorage.getItem(BATTERY_DATA_ITEM);
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
        if(!batteryData[name])
            return batteryData[name] = {
                name,
                lastCapacity : 0,
                lastAmpMax : 0,
                lastAmpMin : 0,
                lastVoltMax : 0,
                lastVoltMin : 0,
                tests : []
            };
        return null;
    }

    function lookupBattery(name) {
        return batteryData[name];
    }
}