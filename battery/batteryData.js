const BATTERY_DATA_ITEM = "batteryData";

{
    // Battery data
    let batteryData;

    try {
        // apparently a JSON parse returns null if it is fed null, so I'm making it undefined to make it throw an error.
        const data = localStorage.getItem(BATTERY_DATA_ITEM) ?? undefined;

        batteryData = JSON.parse(data);
    } catch(e) {
        console.error(e);

        batteryData = {};
    }

    // Write the current battery data to local storage
    function saveBatteryData() {
        localStorage.setItem(BATTERY_DATA_ITEM, JSON.stringify(batteryData));
    }

    // Create a battery log
    const createBattery = function(name) {            
        return batteryData[name] = {
            name,
            tests : {}
        };
    }

    // Returns a battery of the given name
    const selectBattery = function() {
        const name = document.querySelector("#batteryNameSelect").value;

        if(name == "LoadTestCommand") {
            document.querySelector("#command").style.display = "";
            return;
        }

        let battery = batteryData[name];
        if(!battery)
            battery = createBattery(name);

        loadBattery(battery);
    }

    Object.keys(batteryData).map(batteryName =>  {
        const element = document.createElement("option");
        element.value = batteryName;
        return element;
    }).forEach(document.querySelector("#batteryNames").appendChild, document.querySelector("#batteryNames"));

    
    document.querySelector("#selectBattery").addEventListener("click", selectBattery);
}