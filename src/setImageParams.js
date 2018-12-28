// Scans image list and identifies masks/non-masks and sets their min/max parameters
function setImageParams(params) {
    console.log("setImageParams");

    nonMaskImages=0;
    // Automate min/max if params[params["images"]] item is mask:
    for ( i in params["images"]){
        imageName= params["images"][i];
        
        // skip loop if the property is from prototype, otherwise will print extra items
        if (!params["images"].hasOwnProperty(i)) continue;

        // Search for "mask" within image names:
        if ( imageName.includes("mask") ){
            maskFilename= imageName.substring(imageName.lastIndexOf('/')+1); // remove directory path
            params[maskFilename] = {     
                "min": 0,
                "max": 1, // binary mask
                "lut":"Greyscale",
                "alpha": 0.5,
                "visible": 1,
            };
        }
        else {
            nonMaskFilename= imageName.substring(imageName.lastIndexOf('/')+1); 
            params[nonMaskFilename]={}
            params[nonMaskFilename]["min"]=0;
            params[nonMaskFilename]["max"]=10000; // Non-masks go to 10,000
            if(nonMaskImages == 0){
                params[nonMaskFilename]["lut"]="Fire";
                params[nonMaskFilename]["alpha"]=1;
                params[nonMaskFilename]["visible"]=1;
                nonMaskImages+=1;
                
            }
            else{
                params[nonMaskFilename]["lut"]="Blue Overlay";
                params[nonMaskFilename]["alpha"]=0.5; // Fire + Blue = Greenish
                params[nonMaskFilename]["visible"]=1;
            };
        };
    };
    console.log("Done: setImageParams");
};