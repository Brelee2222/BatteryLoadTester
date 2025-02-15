{
    const getConfig = function() {
        document.querySelector("#setConfig").value = getLoadTestingConfig(document.querySelector("#configPathInput").value)
    }

    const setConfig = function() {
        const path = document.querySelector("#configPathInput").value;
        const value = document.querySelector("#setConfig").value;

        const currentValue = getLoadTestingConfig(path);
        if(typeof currentValue == "object")
            return;

        setLoadTestingConfig(path, Object.getPrototypeOf(currentValue).constructor(value));
    }

    document.querySelector("#getConfig").addEventListener("click", getConfig);
    document.querySelector("#setConfigValue").addEventListener("click", setConfig);
}