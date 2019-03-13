// API (get collection list): http://candygram.neurology.emory.edu:8080/api/v1/collection?limit=50&sort=name&sortdir=1
// Notes:
// async/await explanation: https://javascript.info/async-await
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://flaviocopes.com/fetch-api/
// fetch returns promise: .then().text() returns promise with text of ajax response.
"use strict";
// Should be a class/struct etc.
let girder_url = '';
let collection_id = '';
let parent_id = '';
let folder_id = '';
let file_id = '';
let zipFile = ''; // item
var fetch_params = {};

if (isLoggedIn()) {
    fetch_params['headers'] = {
        "Girder-Token": getToken()
    }
}
// Setters and Getters:
function set_girderUrl(url) {
    girder_url = url;
}

function get_girderUrl() {
    return girder_url;
}

function set_collectionId(id) {
    collection_id = id;
}

function get_collectionId() {
    return collection_id;
}

function set_folderId(id) {
    folder_id = id;
}

function get_folderId() {
    return folder_id;
}

function set_fileId(id) {
    file_id = id;
}

function get_fileId() {
    return file_id;
}

function set_parentId(id) {
    parent_id = id;
}

function get_parentId() {
    return parent_id;
}


async function fetchUrl(url) {
    // Description: Generic function to fetch from url then print results and return response
    // Input: API url
    // prints header 'Content-Type' and 'Date' then prints response.text()
    // prints resolved response.text()
    // Return: response.text() as promise
    console.log("# Start fetch url");

    let promise = fetch(girder_url + url);
    let output = promise.then(response => response.text());

    // prints header
    promise.then(response => {
        console.log(response.headers.get('Content-Type'))
        console.log(response.headers.get('date'))
    }).catch(err => console.error(err));

    // print output (response.text)
    output.then(function (x) {
        console.log(x);
    }).catch(err => console.error(err));

    console.log("# End fetch url");
    return output;
}

function webix_ajax(collection_name, makepublic = 'false') {
    let fetch_url = `${girder_url}/api/v1/collection?name=${collection_name}&public=${makepublic}`;
    let promise = new webix.promise(function (success, fail) {
        webix.ajax(url, function (text) {
            if (text) success(text);
            else fail(text.error);
        })
    });
}

async function get_collection_ID(collection_name) {
    // Description: Obtain collection id for collection with name 'collection_name'
    // Input: collection_name is collection name as string.
    // prints url used for Girder API call
    // prints found ID
    // Return: ID as promise

    let fetch_url = `${girder_url}/api/v1/collection?text=${collection_name}&limit=50&sort=name&sortdir=1`;
    //console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    // resolve promise within async function:
    let result = await output;
    //console.log( `Result: ${result}` );

    let ID = '';
    for (var collection in result) {
        // collection is array index
        if (result.hasOwnProperty(collection) && result[collection]['name'] == collection_name) {
            ID = result[collection]['_id'];
            //console.log( `ID: ${result[collection]['_id']}`);
        }
    }
    return ID;
}

async function get_folder_ID(folder_name, collection_id) {
    // Description: Gets ID of folder with 'folder_name' within collection 'collection_id'
    // Input: Folder name and known collection ID
    // prints url used for Girder API call
    // prints folder ID if successfull
    // prints if Unsuccessful
    // Return: ID as promise

    let fetch_url = `${girder_url}/api/v1/folder?parentType=collection&parentId=${collection_id}&text=${folder_name}&limit=50&sort=lowerName&sortdir=1`;
    //console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    // resolve promise within async function:
    let result = await output;
    if (!result[0]) {
        console.log(`Find folder: ${folder_name} \tUnsuccessful`);
        return '';
    }
    let ID = result[0]['_id'];
    //console.log(`Result: ${result[0]['_id']}`);

    return ID;
}

async function post_folder(folder_name, collection_id) {
    // Doesn't work without permissions set

    // Description: Creates folder with 'folder_name' within collection 'collection_id'
    // Input: Desired folder name and known collection ID
    // prints url used for Girder API call
    // prints new folder ID if successfull
    // prints if Unsuccessful
    // Return: ID as promise

    let error_status = 0;
    var fetch_options = {
        method: 'POST'
    };
    if (fetch_params instanceof Object && fetch_options.hasOwnProperty("Girder-Token")) {
        fetch_options['Girder-Token'] = getToken();

    }
    let fetch_url = `${girder_url}/api/v1/folder?parentType=collection&parentId=${collection_id}&name=${folder_name}&reuseExisting=true`;
    console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_options)
        .catch(function (err) {
            console.log(`#Create folder: ${folder_name} \tUnsuccessful`);
        });

    let output = promise
        .then(function (response) {
            if (response.status === 401) {
                console.log('Folder not created: Insufficient Permissions');
                throw '401';
            } else {
                return response.json();
            }
        })
        .catch(function (err) {
            error_status = err;
        });

    // resolve promise within async function:
    let result = await output;
    if (!result[0]) {
        console.log(`Create folder: ${folder_name} \tUnsuccessful`);
        return '';
    }
    let ID = result[0]['_id'];
    console.log(`Result: ${result[0]['_id']}`);

    return ID;
}

async function get_file_ID(file_name, folder_id) {
    // Description: get ID of file from folder
    // Input: file_name to get ID for, folder_id is id of folder containing file.
    // prints url used for Girder API call
    // prints found file ID
    // Return: ID as promise

    let fetch_url = `${girder_url}/api/v1/item?folderId=${folder_id}&name=${file_name}&limit=50&sort=lowerName&sortdir=1`;
    //console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    // resolve promise within async function:
    let result = await output;
    if (!result[0]) {
        console.log(`Find file: ${file_name} \tUnsuccessful`);
        return '';
    }
    let ID = result[0]['_id']
    //console.log(`ID: ${ID}`);
    return ID;
}

async function download_file(item_id) {
    // Description: Download item using item_id
    // Input: ID of file to download
    // prints url used for Girder API call
    // prints found file ID
    // Return: ID as promise
    // http://candygram.neurology.emory.edu:8080/api/v1/file/5c51b898e62914004d1c96e6/download
    // http://candygram.neurology.emory.edu:8080/api/v1/file/5c51b898e62914004d1c96e6/download?contentDisposition=attachment
    let fetch_url = `${girder_url}/api/v1/item/${item_id}/download?contentDisposition=attachment`;
    console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => {
            test_item = response.body;
        })
        .catch(err => console.error(err));

    return output;
}

async function download_zip_item(item_id) {
    // Description: Download item using item_id
    // Input: ID of file to download
    // prints url used for Girder API call
    // prints found file ID
    // Return: ID as promise
    // WARNING: folder is now hard-coded

    /* JSZipUtils.getBinaryContent: Description : Use an AJAX call to fetch a file (HTTP GET) on the server that served the file. */
    //file ID: 5c4b3d52e62914004df6fd08, BUT download link:
    //http://candygram.neurology.emory.edu:8080/api/v1/file/5c4bb534e62914004dfc1038/download

    var zipFile;
    let fetch_url = `${girder_url}/api/v1/file/${item_id}/download`
    console.log(`Fetch URL2: ${fetch_url}`);

    let myZipData = new JSZip.external.Promise(function (resolve, reject) { // new Promise
            JSZipUtils.getBinaryContent = function (path, callback, auth) {
                /*
                 * Here is the tricky part : getting the data.
                 * In firefox/chrome/opera/... setting the mimeType to 'text/plain; charset=x-user-defined'
                 * is enough, the result is in the standard xhr.responseText.
                 * cf https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Receiving_binary_data_in_older_browsers
                 * In IE <= 9, we must use (the IE only) attribute responseBody
                 * (for binary data, its content is different from responseText).
                 * In IE 10, the 'charset=x-user-defined' trick doesn't work, only the
                 * responseType will work :
                 * http://msdn.microsoft.com/en-us/library/ie/hh673569%28v=vs.85%29.aspx#Binary_Object_upload_and_download
                 *
                 * I'd like to use jQuery to avoid this XHR madness, but it doesn't support
                 * the responseType attribute : http://bugs.jquery.com/ticket/11461
                 */
                try {
                    var xhr = createXHR();
                    if (auth) {
                        xhr.setRequestHeader("Girder-Token", getToken());
                    }
                    xhr.open('GET', path, true);

                    // recent browsers
                    if ("responseType" in xhr) {
                        xhr.responseType = "arraybuffer";
                    }

                    // older browser
                    if (xhr.overrideMimeType) {
                        xhr.overrideMimeType("text/plain; charset=x-user-defined");
                    }

                    xhr.onreadystatechange = function (evt) {
                        var file, err;
                        // use `xhr` and not `this`... thanks IE
                        if (xhr.readyState === 4) {
                            if (xhr.status === 200 || xhr.status === 0) {
                                file = null;
                                err = null;
                                try {
                                    file = JSZipUtils._getBinaryFromXHR(xhr);
                                } catch (e) {
                                    err = new Error(e);
                                }
                                callback(err, file);
                            } else {
                                callback(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText), null);
                            }
                        }
                    };

                    xhr.send();

                } catch (e) {
                    callback(new Error(e), null);
                }
            };
            JSZipUtils.getBinaryContent(fetch_url, function (err, data) { // AJAX GET: downloads file
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
        .then(function (data) { // myZipData.then()
            return JSZip.loadAsync(data); // loads data into new JSZip object
        })
        .then(function (zData) { // zData is resolved promise
            zipFile = zData;
            zipFile.folder("50v50_set-0_2019-M01-D19/").forEach(function (relativePath, file) {
                //console.log("iterating over", relativePath);
                //console.log(file);
            });
            return zData;
        });
    return myZipData;
}

async function get_collection_contents(collection_id) {
    // Description: Get collection contents as json
    // Input: ID of collection to explore
    // prints url used for Girder API call
    // Return: json describing collection contents

    let fetch_url = `${girder_url}/api/v1/item?collectionId=${collection_id}&limit=50&sort=lowerName&sortdir=1`;
    console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    return output;
}

async function get_folder_items(folder_id) {
    // Description: Get folder items as json
    // Input: ID of folder to explore
    // prints url used for Girder API call
    // Return: json describing folder items

    let fetch_url = `${girder_url}/api/v1/item?folderId=${folder_id}&limit=50&sort=lowerName&sortdir=1`;
    console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    return output;
}


async function get_folder_folders(folder_id) {
    // Description: Get folder items as json
    // Input: ID of folder to explore
    // prints url used for Girder API call
    // Return: json describing folder items
    // /api/v1/folder?parentType=folder&parentId=5c4bb1fee62914004dfc0cb2&limit=50&sort=lowerName&sortdir=1
    let fetch_url = `${girder_url}/api/v1/folder?parentType=folder&parentId=${folder_id}&limit=50&sort=lowerName&sortdir=1`;
    console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    return output;
}

function setTokenIntoUrl(token, symbol) {
    return token ? `${symbol}token=${token}` : "";
}

function getFolderData(folder_id) {
    // Description: Get folder Data
    // Input: ID of folder to obtain Data from
    // prints url used for Girder API call
    // Return: json of Data
    // http://candygram.neurology.emory.edu:8080/api/v1/folder/5c86d6f0e62914004d776c70
    let fetch_url = `${girder_url}/api/v1/folder/${folder_id}`;
    console.log(`Fetch URL: ${fetch_url}`);

    // Girder API returns array with json objects
    let promise = fetch(fetch_url, fetch_params);
    let output = promise
        .then(response => response.json())
        .catch(err => console.error(err));

    return output;
}

async function build_params(folder_id) {
    // Description: define params object for papaya viewer
    // Input: ID of folder to explore
    // prints url used for Girder API call
    // Return: json describing folder contents
    // output == params

    let output = [];
    output['images'] = []; // list of image urls
    output['imageNames'] = []; // lists of image names
    output['fullImageNames'] = []; // lists of full image names
    output['mapping'] = {}; // maps download URL to image name
    let tmpurl = '';
    let tmpname = ''; // name of file

    folderData = getFolderData(folder_id);
    let param = folderData.then(function (fdata) {
        console.log(fdata['meta']);
        output['images'] = fdata['meta']['imageList']; // Download URL of images
        output['fullImageNames'] = fdata['meta']['imageNames']; // Full image names
        papayaSpec = fdata['meta']['papayaSpec'];
        
        for (let i = 0; i < output['images'].length; i++) {
            tmpname = output['fullImageNames'][i]; // full image name
            tmpname = tmpname.replace('.nii.gz', '');
            if (!tmpname.startsWith("MNI")) {
                tmpname = tmpname.substring(tmpname.indexOf("_") + 1);
            }

            // shortened name used to refer to image:
            console.log('tmpname: ' + tmpname);
            output['imageNames'].push(tmpname);

            // URL mapping to names:
            tmpurl = fdata['meta']['imageList'][i];
            output['mapping'][tmpurl] = tmpname;

            // Image specifications:
            if (papayaSpec[tmpname]) {
                output[tmpname] = papayaSpec[tmpname]; // papayaSpec defined in subject folder metadata
            } else { // default papayaSpec values
                output[tmpname] = {
                    "name": tmpname,
                    "min": 0,
                    "max": 1,
                    "lut": "Greyscale",
                    "alpha": 1,
                    "visible": 0
                }
            }

            console.log(tmpname);
        }
        return output; // becomes params
    });
    return param;
}

/* 
{ // DCM Block
    var DCMzipFile = ''; // DCM

    var myFileUrl =
        "http://candygram.neurology.emory.edu:8080/api/v1/file/5c4b430ce62914004df6ff72/download"
    var myZipData = new JSZip.external.Promise(function (resolve, reject) { // new Promise
        JSZipUtils.getBinaryContent(myFileUrl, function (err, data) { // AJAX GET: downloads file
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    }).then(function (data) { // myZipData.then()
        return JSZip.loadAsync(data); // loads data into new JSZip object
    }).then(function (zData) { // zData is resolved promise
        DCMzipFile = zData;
        DCMzipFile.folder("13-AX T1 POST-19694").forEach(function (relativePath, file) {
            //console.log("iterating over", relativePath);
            //console.log(file);
        });
        return zData; // myZipData = zData as resolved Promise
    })
} // END DCM Block 
*/