const Modes = ["CC", "CV", "CR", "CP"];

const LOAD_TESTING_CONFIG_ITEM = "loadTestingConfig"

{
    const getConfig = function(path) {
        return localStorage.getItem(`${LOAD_TESTING_CONFIG_ITEM}.${path}`);
    } 

    const configs = {
        mode : getConfig("mode") ?? "CC",
        static : getConfig("static") ?? true,
        high : getConfig("high") ?? true,
        portOptions : {
            baudRate : getConfig("portOptions.baudRate") ?? 9600,
            bufferSize : 510
        },
        constantModeValues : {
            CC : {
                HIGH : getConfig("constantModeValues.CC.HIGH") ?? "+40.0",
                LOW : getConfig("constantModeValues.CC.LOW") ?? "0.0"
            },
            CV : {
                HIGH : getConfig("constantModeValues.CV.HIGH") ?? "+12.0",
                LOW : getConfig("constantModeValues.CV.LOW") ?? "0.0"
            },
            CR : {
                HIGH : getConfig("constantModeValues.CR.HIGH") ?? "+100.0",
                LOW : getConfig("constantModeValues.CR.LOW") ?? "+50.0"
            },
            CP : {
                HIGH : getConfig("constantModeValues.CP.HIGH") ?? "+10.0",
                LOW : getConfig("constantModeValues.CP.LOW") ?? "0.0"
            }
        },
        loadTestingSettings : {
            onVoltage : getConfig("loadTestingSettings.onVoltage") ?? "+12.7",
            offVoltage : getConfig("loadTestingSettings.offVoltage") ?? "+10.5"
        }
    };

    function setLoadTestingConfig(path, value) {
        const paths = path.split(".");
        
        let config = configs;
        for(let pathIndex = 0; pathIndex < paths.length - 1; pathIndex++)
            config = config[paths[pathIndex]];

        if(typeof config[path] == "object")
            return null;

        localStorage.setItem(`loadTestingConfig.${path}`, value);

        return config[paths.length - 1] = value;
    }

    function getLoadTestingConfig(path) {
        const paths = path.split(".");
        
        let config = configs;
        for(let pathIndex = 0; pathIndex < paths.length - 1; pathIndex++)
            config = config[paths[pathIndex]];

        if(typeof config[path] == "object")
            return JSON.parse(JSON.stringify(config[path]));

        return config[paths[paths.length - 1]];
    }
}