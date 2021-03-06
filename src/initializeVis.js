"use strict";
// params is predefined
function initViz() {
    console.log('Initializing Image parameters...')
    // Description: toggles values of all images to match params
    // Input: expects params to be predefined
    params["imageNames"].forEach(function (currentimage) {
        console.log(`Current Image: ${currentimage}`);
        let layerN = params["imageNames"].indexOf(currentimage);
        console.log('layerN: '+layerN);
        let myViewer = papayaContainers[0].viewer;

        // Visibility:
        if (params[currentimage]["visible"] == 1) {
            papaya.Container.showImage(0, layerN);
        } else {
            papaya.Container.hideImage(0, layerN)
        }

        // Color:
        papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, params[currentimage]["lut"]);
       // console.log(`Lut: ${params[currentimage]["lut"]}`);
        // Alpha:
        papayaContainers[0].viewer.screenVolumes[layerN].alpha = params[currentimage]["alpha"];
        papayaContainers[0].viewer.drawViewer(true, false);
        //console.log(`Alpha: ${params[currentimage]["alpha"]}`);
        // Minimum Value:
        papayaContainers[0].viewer.screenVolumes[layerN].imageMin = params[currentimage]["min"];
        papayaContainers[0].viewer.drawViewer(true, false);
        //console.log(`Min: ${params[currentimage]["min"]}`);
        // Maximum Value
        papayaContainers[0].viewer.screenVolumes[layerN].imageMax = params[currentimage]["max"];
        papayaContainers[0].viewer.drawViewer(true, false);
        //console.log(`Max: ${params[currentimage]["max"]}`);
    });
    // Redraw:
    papayaContainers[0].viewer.drawViewer(true, false);
    console.log('Viewer Ready')
}

/* screenMax: 10000
screenMin: 0
screenRatio: 0.0255 */