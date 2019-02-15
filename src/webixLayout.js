"use strict";
// Webix Layout: (params needs to be defined elsewhere)

var papayaColorTables = ["Greyscale", "Spectrum",
    "Overlay (Positives)", "Overlay (Negatives)",
    "Hot-and-Cold", "Gold",
    "Red Overlay", "Green Overlay",
    "Blue Overlay", "Fire"
]

var dtableparams = [{
        id: "name",
        header: "Name",
        width: 180,
        sort: "string",
    },
    {
        id: "layer",
        header: "Layer",
        width: 50,
        sort: "int",
        editor: "text"
    },
    {
        id: "lut",
        header: "Color",
        sort: "string",
        editor: "select",
        options: papayaColorTables
    },
    {
        id: "alpha",
        header: "Alpha",
        width: 50,
        sort: "int",
        editor: "text"
    },
    {
        id: "min",
        header: "Min",
        width: 60,
        sort: "int",
        editor: "text"
    },
    {
        id: "max",
        header: "Max",
        width: 60,
        sort: "int",
        editor: "text"
    },
    {
        id: "visible",
        header: "Visible",
        width: 60,
        sort: "int",
        template: "{common.checkbox()}"
    }
]

var dtable = { // Datatable:
    view: "datatable",
    id: "grid",
    width: 580,
    height: 300,
    columns: dtableparams, // column names and ids
    editable: true,
    editaction: "click",
    scroll: false,
    select: true,
    checkboxRefresh: true,
    on: {
        "onAfterSelect": function (selection, preserve) {
            console.log(`New Selection: ${selection}`);
            let item = $$("grid").getItem(selection);
            let iname = item.name;
            let layerN = item.layer;
            console.log(`Item: ${iname}`);
            papayaContainers[0].viewer.setCurrentScreenVol(layerN);
        },
        "onCheck": function (rowId, colId, state) {
            let item = $$("grid").getItem(rowId); // get name of image for row changed
            let iname = item.name;
            let layerN = item.layer;

            console.log(state, rowId, colId)
            if (state) {
                params[iname]["visible"] = 1;
                papaya.Container.showImage(0, layerN);
                console.log(`Value Changed: ON`);
            } else {
                params[iname]["visible"] = 0;
                papaya.Container.hideImage(0, layerN)
                console.log(`Value Changed: OFF`);
            }
        },
        "onAfterEditStop": function (state, editor, ignoreUpdate) { // Alters image based on datatable changes
            if (state.value != state.old) {
                let item = $$("grid").getItem(editor.row); // get name of image for row changed
                let iname = item.name;
                let layerN = item.layer;
                let col = editor.column;
                let myViewer = papayaContainers[0].viewer;
                console.log(col);

                if (col == "lut") {
                    params[iname]["lut"] = state.value;
                    papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, params[iname]["lut"]);
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: lut ${state.value}`);
                }
                if (col == "alpha") {
                    params[iname]["alpha"] = state.value;
                    papayaContainers[0].viewer.screenVolumes[layerN].alpha = parseFloat(params[iname]["alpha"]);
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: alpha ${papayaContainers[0].viewer.screenVolumes[layerN].alpha}`);
                }
                if (col == "min") {
                    console.log(`Value ${state.value}`)
                    console.log(`IName ${iname}`)
                    console.log(`Layer ${layerN}`)
                    params[iname]["min"] = state.value;
                    //papayaContainers[0].viewer.screenVolumes[layerN].min = params[iname]["min"];
                    papayaContainers[0].viewer.screenVolumes[layerN].screenMin = parseFloat(params[iname]["min"]);
                    papayaContainers[0].viewer.screenVolumes[layerN].updateScreenRange()
                    papayaContainers[0].viewer.drawViewer(true, false);
                    //papaya.Container.resetViewer(0);
                    console.log(`Value Changed: min ${state.value}`);
                }
                if (col == "max") {
                    params[iname]["max"] = state.value;
                    papayaContainers[0].viewer.screenVolumes[layerN].screenMax = parseFloat(params[iname]["max"]);
                    papayaContainers[0].viewer.screenVolumes[layerN].updateScreenRange()
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: max ${state.value}`);
                }
                if (col == "visible") {
                    //params[iname]["visible"] = parseInt(state.value);
                    console.log(`ERROR: Visibility should be Checkbox`);

                }
            } else {
                console.log("No Change");
            }

        }
    }
}


function getDictIndexFromValue(val, dict) {
    // finds val within dict._id
    let output;
    dict.forEach(x =>
        x.value == val ? output = x._id : 0
    );
    return output;
}


// Defines layout of webix panels, returns layout
function setupPanels() {
    console.log("setupPanels");

    // Webix Panels:
    var leftPanel = {
        rows: [{ // <h> Images
                view: "template",
                template: "Images",
                type: "header",
                css: {
                    "text-align": "center",
                    "font-size": "1.875em",
                    "font-weight": "bold",
                    "font-family": "Arial, Helvetica, sans-serif"
                }
            }, // text
            { // <h> Girder Folder
                view: "template",
                template: "Girder Folder",
                type: "header",
                borderless: true
            }, // text
            { // Select girder folder used to get images, allow dynamic changing and image reloading
                view: "combo",
                id: "girderFolder",
                value: girderFolderDict["0"].value, //girderFolderNames[0],
                options: girderFolderDict
            }, // girder folder name
            { // Change folder button
                view: "button",
                id: "folderChange",
                value: "Change Folder",
                click: function () {
                    let fv = $$("girderFolder").getInputNode().value;
                    folder_id = getDictIndexFromValue(fv, girderFolderDict);
                    console.log(`Folder Name: ${fv}`);
                    console.log(`Folder ID: ${folder_id}`);
                    resetPage(folder_id);
                }
            }, // button
            { // empty space
                view: "template",
                type: "header",
                height: 20,
                borderless: true
            }, // empty space
            { // <h> Variables
                view: "template",
                template: "Variables",
                type: "header",
                borderless: true
            }, // text
            dtable, // datatable/grid of image settings
            { // Swap view button
                view: "button",
                id: "swapViewsButton",
                value: "Swap Views",
                click: function () {
                    papayaContainers[0].viewer.rotateViews()
                }
            } // Swap view button
        ],
    };

    var middlePanel = {
        rows: [{
                view: "template",
                template: "Viewer",
                type: "header",
                css: {
                    "text-align": "center",
                    "font-size": "1.875em",
                    "font-weight": "bold",
                    "font-family": "Arial, Helvetica, sans-serif"
                },
                borderless: true
            }, // Header
            {
                view: "webixPapaya"
            } // Papaya Viewer
        ]
    };

    /* 
            // not used
        // Initial values for controls:
        var layerN = 0; // initial image index
        var imageName = params['imageNames'][layerN]; // initial image name
        var imageValues = params[imageName]; // initial parameters for image
        //console.log(imageValues)

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
                        inputWidth: 300,
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
                        inputWidth: 300,
                        options: papayaColorTables,
                        value: imageValues["lut"],
                        on: {
                            onChange: function (newv, oldv) {
                                layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                                let myViewer = papayaContainers[0].viewer;
                                papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, newv);
                                params[params['imageNames'][layerN]]["lut"] = newv; // save new value to params
                            }, // onChange
                        }, // on event
                    }, // combobox
                    {
                        view: "counter",
                        id: "alphaCounter",
                        label: "Alpha",
                        inputWidth: 300,
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
                        inputWidth: 300,
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
                        inputWidth: 300,
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

                    // papayaContainers[0].viewer.goToInitialCoordinate() // resets coordinate marker
                    // papayaContainers[0].viewer.currentCoord // outputs marker coordinates
                    // papayaContainers[0].viewer.cursorPosition // outputs mouse coordinates
                    // papayaContainers[0].viewer.currentScreenVolume // Gives current layer info
                    // papayaContainers[0].viewer.setZoomFactor(2) // Zoom in
                    // papayaContainers[0].viewer.getZoomString() // how much image is zoomed
                ], // Rows
            }; */

    // Merge Panels into Layout
    var layout = {
        cols: [leftPanel, {
                view: "resizer"
            }, middlePanel, {
                view: "resizer"
            }, //rightPanel
        ]
    };

    console.log("Done: setupPanels");
    return (layout);
};