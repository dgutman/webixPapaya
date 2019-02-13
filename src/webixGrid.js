"use strict";
function setupGrid() { // initialize grid data from loaded images
    let gridData;
    let layerN;
    params["imageNames"].forEach(function (currentimage) {
        layerN = params["imageNames"].indexOf(currentimage);
        gridData = {
            "name": currentimage,
            "layer": layerN,
            "lut": params[currentimage]["lut"],
            "alpha": params[currentimage]["alpha"],
            "min": Math.round( papayaContainers[0].viewer.screenVolumes[layerN].screenMin *100) / 100, //params[currentimage]["min"],
            "max": Math.round( papayaContainers[0].viewer.screenVolumes[layerN].screenMax *100) / 100, //params[currentimage]["max"],
            "visible": params[currentimage]["visible"] == 1 ? 1 : 0
        };

        $$("grid").add(gridData);
    })
}