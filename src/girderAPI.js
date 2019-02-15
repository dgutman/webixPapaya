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
    let promise = fetch(fetch_url);
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
    let promise = fetch(fetch_url);
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
    fetch_options = {
        method: 'POST'
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
    let promise = fetch(fetch_url);
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
    let promise = fetch(fetch_url);
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
        })
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
    let promise = fetch(fetch_url);
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
    let promise = fetch(fetch_url);
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
    let promise = fetch(fetch_url);
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
    output['mapping'] = {}; // maps url to image name

    let files = ''; // array of json objects representing nifti files
    let tmpurl = ''; // path to file
    let tmpname = ''; // name of file
    let param = get_folder_items(folder_id) //Get folder contents as json
        .then(function (x) {
            files = x;

            // loop through json list of nifti objects to define file_locs and file_names
            files.forEach(function (i) {
                //console.log(i);
                tmpurl = `${girder_url}/api/v1/item/${i._id}/download?contentDisposition=attachment`;
                output['images'].push(tmpurl);
                tmpname = i.name.replace('.nii.gz', '');
                output['imageNames'].push(tmpname);
                output[tmpname] = aesthetic[tmpname];
                output['mapping'][tmpurl] = tmpname;
            })
            return output; // becomes params
        })
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