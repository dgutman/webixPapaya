"use strict";
function setupGrid() {
    let gridData;
    let layerN;
    params["imageNames"].forEach(function (currentimage) {
        layerN = params["imageNames"].indexOf(currentimage);
        gridData = {
            "name": currentimage,
            "layer": layerN,
            "lut": params[currentimage]["lut"],
            "alpha": params[currentimage]["alpha"],
            "min": params[currentimage]["min"],
            "max": params[currentimage]["max"],
            "visible": params[currentimage]["visible"] == 1 ? 'true' : 'false'
        };

        $$("grid").add(gridData);
    })
}