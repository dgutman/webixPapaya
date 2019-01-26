// Webix Layout:
function setupPanels(params) {
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
                width: 500,
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
            }, // Papaya Viewer
            {
                view: "webixPapaya"
            }, // Papaya Viewer
        ]
    };

    // Initial values for controls:
    var layerN = 0; // image index
    var imageName = params["images"][layerN]["name"]; // image path // ADDED name FOR GIRDER VERSION
    imageName = imageName.substring(imageName.lastIndexOf('/') + 1); // image filename
    var imageValues = params[imageName]; // parameters for image

    // Image names without directory paths:
    var imageNameList = [];
    for (i in params["images"]) {
        // skip loop if the property is from prototype, otherwise will print extra items:
        if (!params["images"].hasOwnProperty(i)) continue;
        tempName = params["images"][parseInt(i)]["name"]; // image path // ADDED name FOR GIRDER VERSION
        tempName = tempName.substring(tempName.lastIndexOf('/') + 1)
        imageNameList.push(tempName);
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
                inputWidth: 250,
                options: ["0", "1", "2"],
                value: "0",
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt(newv); // image index
                        imageValues = params[imageNameList[layerN]];
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
                value: imageValues["visible"],
                onLabel: "on",
                offLabel: "off",
                on: {
                    onItemClick: function (newv, oldv) {
                        console.log(`switch: from: ${oldv} to: ${newv}`);
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.toggleOverlay(layerN);
                        imageName = imageNameList[layerN];
                        if (params[imageName]["visible"] == 1) {
                            params[imageName]["visible"] = 0;
                        } // change params["imageName"]["visible"] to save visibility state
                        else {
                            params[imageName]["visible"] = 1;
                        }
                    }, // onChange
                }, // on event
            }, // switch
            {
                view: "combo",
                id: "colorCBox",
                label: "Color",
                inputWidth: 250,
                options: papayaColorTables,
                value: imageValues["lut"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        myViewer = papayaContainers[0].viewer;
                        papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, newv);
                        params[imageNameList[layerN]]["lut"] = newv; // save new value to params
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
                        params[imageNameList[layerN]]["alpha"] = newv; // save new value to params
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
                        params[imageNameList[layerN]]["min"] = newv; // save new value to params
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
                        params[imageNameList[layerN]]["max"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "button",
                id: "swapViewsButton",
                inputWidth: 250,
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