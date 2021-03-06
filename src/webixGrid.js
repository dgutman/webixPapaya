"use strict";

function setupGrid() { // initialize grid data from loaded images
    let gridData;
    let layerN;

    // If gridData exists (new girder folder selected), remove old data
    if ($$("grid")) {
        $$("grid").clearAll();
    }

    params["imageNames"].forEach(function (currentimage) {
        layerN = params["imageNames"].indexOf(currentimage);
        gridData = {
            "name": currentimage,
            "layer": layerN,
            "lut": params[currentimage]["lut"],
            "alpha": params[currentimage]["alpha"],
            "min": params[currentimage]["min"], // Math.round(papayaContainers[0].viewer.screenVolumes[layerN].screenMin * 100) / 100,
            "max": params[currentimage]["max"], //Math.round(papayaContainers[0].viewer.screenVolumes[layerN].screenMax * 100) / 100,
            "visible": params[currentimage]["visible"] == 1 ? 1 : 0
        };

        $$("grid").add(gridData);
    })
}