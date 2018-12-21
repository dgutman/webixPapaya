// Webix Layout:

function setupPanels(params) {
    console.log("setupPanels");

    var papayaColorTables = ["Greyscale", "Spectrum", 
                            "Overlay (Positives)", "Overlay (Negatives)", 
                            "Hot-and-Cold", "Gold", 
                            "Red Overlay", "Green Overlay", 
                            "Blue Overlay", "Fire"]

    // Webix Panels:
    var leftPanel = {
        rows: [
            { view: "template", template: "Info", width: 300, height: 50, type:"header"}, // text
        ],
    };

    var middlePanel = { 
        rows:[ 
            {view: "template", template:"Viewer", type:"header"}, // Papaya Viewer
            {view: "webixPapaya"}, // Papaya Viewer
        ] 
    };

    var layerN= 0; // image index
    var imageName= params["images"][layerN]; // image path
    var imageName= imageName.substring(imageName.lastIndexOf('/')+1); // image filename
    var imageValues= params[imageName]; // parameters for image

    var rightPanel = { 
        rows: [
            { view:"template", template:"Controls", height:50, type:"header"}, // text
            { view:"combo", id:"layerCBox" ,label:"Layer", options:["0","1","2"], value:"0",
                on: {
                    onChange: function(newv, oldv) {
                        //console.log(`switch: from: ${oldv} to: ${newv}`);
                        layerN= parseInt(newv); // image index
                        imageName= params["images"][layerN];
                        imageName= imageName.substring(imageName.lastIndexOf('/')+1);
                        imageValues= params[imageName];
                        $$("colorCBox").setValue( imageValues["lut"]); 
                        $$("visibilitySwitch").setValue( imageValues["visible"]); 
                        $$("alphaCounter").setValue(imageValues["alpha"]); 
                        $$("minCounter").setValue(imageValues["min"]); 
                        $$("maxCounter").setValue(imageValues["max"]);
                    }, // onChange
                }, // on event
            }, // combobox
            { view:"switch", id:"visibilitySwitch", label:"Visible", value:imageValues["visible"],  
                onLabel: "on",
                offLabel:"off",
                on: {
                    onItemClick: function(newv, oldv) {
                        console.log(`switch: from: ${oldv} to: ${newv}`);
                        layerN= parseInt($$("layerCBox").getInputNode().value );
                        papayaContainers[0].viewer.toggleOverlay(layerN);
                        // save visibility status:
                        imageName= params["images"][layerN];
                        imagePath= imageName.substring(imageName.lastIndexOf('/')+1);
                        if( params[imagePath]["visible"] == 1){params[imagePath]["visible"]=0;} // change params["imagePath"]["visible"] to save visibility state
                        else {params[imagePath]["visible"]=1;}
                    }, // onChange
                }, // on event
            }, // switch
            { view:"combo", id:"colorCBox", label:"Color", options: papayaColorTables, value:imageValues["lut"],
                on: {
                    onChange: function(newv, oldv) {
                        layerN= parseInt($$("layerCBox").getInputNode().value );
                        myViewer = papayaContainers[0].viewer;
                        papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, newv);
                    }, // onChange
                }, // on event
            }, // combobox
            { view:"counter", id:"alphaCounter", label:"Alpha", min:0, max:1, step:0.05, value:imageValues["alpha"],
                on: {
                    onChange: function(newv, oldv) {
                        layerN= parseInt($$("layerCBox").getInputNode().value );
                        papayaContainers[0].viewer.screenVolumes[layerN].alpha = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        //$$("alphaTemplate").getNode().innerText= "Alpha Value: "+newv;
                    }, // onChange
                }, // on event
            }, // counter
            { view:"counter", id:"minCounter", label:"Min", min:0, max:10000, step:0.05, value:imageValues["min"],
                on: {
                    onChange: function(newv, oldv) {
                        layerN= parseInt($$("layerCBox").getInputNode().value );
                        papayaContainers[0].viewer.screenVolumes[layerN].screenMin = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                    }, // onChange
                }, // on event
            }, // counter
            { view:"counter", id:"maxCounter", label:"Max", min:0, max:10000, step:0.05, value:imageValues["max"],
                on: {
                    onChange: function(newv, oldv) {
                        layerN= parseInt($$("layerCBox").getInputNode().value );
                        papayaContainers[0].viewer.screenVolumes[layerN].screenMax = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                    }, // onChange
                }, // on event
            }, // counter
        ], // Rows
    }; 

    // Merge Panels into Layout
    var layout = {
        cols: [leftPanel, { view:"resizer" }, middlePanel, { view:"resizer" }, rightPanel]
    };

    console.log("Done: setupPanels");
    return(layout);
};