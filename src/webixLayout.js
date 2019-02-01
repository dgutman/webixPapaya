"use strict";
// Webix Layout: (params needs to be defined elsewhere)
function setupPanels() {
    console.log("setupPanels");

    var papayaColorTables = ["Greyscale", "Spectrum",
        "Overlay (Positives)", "Overlay (Negatives)",
        "Hot-and-Cold", "Gold",
        "Red Overlay", "Green Overlay",
        "Blue Overlay", "Fire"
    ]

    // Webix Panels:
    var leftPanel = {
        rows: [{
                view: "template",
                template: "Info",
                width: 200,
                height: 50,
                type: "header"
            }, // text
            {
                view: "list",
                data: params["images"]
            },
        ],
    };

    var middlePanel = {
        rows: [{
                view: "template",
                template: "Viewer",
                type: "header"
            }, // Header
            {
                view: "webixPapaya"
            } // Papaya Viewer
        ]
    };

    // Initial values for controls:
    var layerN = 0; // initial image index
    var imageName = params['imageNames'][layerN]; // initial image name
    var imageValues = params[imageName]; // initial parameters for image
    console.log(imageValues)

    // indexes of all images as string
    var iterimages = [];
    for (var i = 0; i < params['imageNames'].length; i++) {
        iterimages.push(i.toString());
    }

    var rightPanel = {
        rows: [{
                view: "template",
                template: "Controls",
                height: 50,
                type: "header"
            }, // text
            {
                view: "combo",
                id: "layerCBox",
                label: "Layer",
                inputWidth: 500,
                options: iterimages,
                value: layerN.toString(),
                on: {
                    onChange: function (newv, oldv) {
                        console.log(oldv, newv);
                        layerN = parseInt(newv); // image index
                        imageValues = params[params['imageNames'][layerN]];
                        console.log(imageValues);
                        $$("colorCBox").setValue(imageValues["lut"]);
                        $$("visibilitySwitch").setValue(imageValues["visible"]);
                        $$("alphaCounter").setValue(imageValues["alpha"]);
                        $$("minCounter").setValue(imageValues["min"]);
                        $$("maxCounter").setValue(imageValues["max"]);
                    }, // onChange
                }, // on event
            }, // combobox
            {
                view: "switch",
                id: "visibilitySwitch",
                label: "Visible",
                value: imageValues["visible"], // initial value for layer 0
                onLabel: "on",
                offLabel: "off",
                on: {
                    onItemClick: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        //papayaContainers[0].viewer.toggleOverlay(layerN); // toggles layer visibility
                        imageName = params['imageNames'][layerN];
                        if (params[imageName]["visible"] == 1) {
                            papaya.Container.hideImage(0, layerN);
                            params[imageName]["visible"] = 0;
                            console.log(`${imageName} OFF`);
                        } // change params["imageName"]["visible"] to save visibility state
                        else {
                            papaya.Container.showImage(0, layerN)
                            params[imageName]["visible"] = 1;
                            console.log(`${imageName} ON`);
                        }
                    }, // onChange
                }, // on event
            }, // switch
            {
                view: "combo",
                id: "colorCBox",
                label: "Color",
                inputWidth: 500,
                options: papayaColorTables,
                value: imageValues["lut"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        let myViewer = papayaContainers[0].viewer;
                        papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer , newv);
                        params[params['imageNames'][layerN]]["lut"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // combobox
            {
                view: "counter",
                id: "alphaCounter",
                label: "Alpha",
                min: 0,
                max: 1,
                step: 0.05,
                value: imageValues["alpha"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.screenVolumes[layerN].alpha = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        params[params['imageNames'][layerN]]["alpha"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "counter",
                id: "minCounter",
                label: "Min",
                min: 0,
                max: 10000,
                step: 0.05,
                value: imageValues["min"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.screenVolumes[layerN].screenMin = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        params[params['imageNames'][layerN]]["min"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "counter",
                id: "maxCounter",
                label: "Max",
                min: 0,
                max: 10000,
                step: 0.05,
                value: imageValues["max"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.screenVolumes[layerN].screenMax = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        params[params['imageNames'][layerN]]["max"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "button",
                id: "swapViewsButton",
                inputWidth: 500,
                value: "Swap Views",
                click: function () {
                    papayaContainers[0].viewer.rotateViews()
                }
            }
            // papayaContainers[0].viewer.goToInitialCoordinate() // resets coordinate marker
            // papayaContainers[0].viewer.currentCoord // outputs marker coordinates
            // papayaContainers[0].viewer.cursorPosition // outputs mouse coordinates
            // papayaContainers[0].viewer.currentScreenVolume // Gives current layer info
            // papayaContainers[0].viewer.setZoomFactor(2) // Zoom in
            // papayaContainers[0].viewer.getZoomString() // how much image is zoomed
        ], // Rows
    };

    // Merge Panels into Layout
    var layout = {
        cols: [leftPanel, {
            view: "resizer"
        }, middlePanel, {
            view: "resizer"
        }, rightPanel]
    };

    console.log("Done: setupPanels");
    return (layout);
};