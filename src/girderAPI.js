// API (get collection list): http://candygram.neurology.emory.edu:8080/api/v1/collection?limit=50&sort=name&sortdir=1
// Hello
// Notes:
// async/await explanation: https://javascript.info/async-await
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://flaviocopes.com/fetch-api/
// fetch returns promise: .then().text() returns promise with text of ajax response.

var girder_url = '';
var collection_id = '';
var folder_id = '';
var file_id = '';

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

function webix_ajax(collection_name, public = 'false') {
    let fetch_url = `${girder_url}/api/v1/collection?name=${collection_name}&public=${public}`;
    let promise = new webix.promise(function (success, fail) {
        webix.ajax(url, function (text) {
            if (text) success(text);
            else fail(text.error);
        })
    });
}

async function post_collection(collection_name, description_text = '', public = 'false') {
    // TODO
}

async function get_collection_ID(collection_name) {
    // Description: Obtain collection id for collection with name 'collection_name'
    // Input: collection_name is collection name as string.
    // prints url used for Girder API call
    // prints found ID
    // Return: ID as promise

    // Create new collection and create folder within collection
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

    // Create new collection and create folder within collection
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