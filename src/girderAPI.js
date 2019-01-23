// API (get collection list): http://candygram.neurology.emory.edu:8080/api/v1/collection?limit=50&sort=name&sortdir=1

// Notes:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://flaviocopes.com/fetch-api/
// fetch returns promise: .then().text() returns promise with text of ajax response.

var girder_url='';
function set_girderUrl(url){ girder_url=url; }
function get_girderUrl(url){ return girder_url; }

async function fetch_url(url){
    // Description: Generic function to fetch from url then print results and return response
    // Input: API url
    // prints header 'Content-Type' and 'Date' then prints response.text()
    // prints resolved response.text()
    // Return: response.text() as promise
    console.log("# Start fetch url");

    let promise = fetch(url);
    let output= promise.then(response => response.text());

    // prints header
    promise.then(response => {
        console.log(response.headers.get('Content-Type'))
        console.log(response.headers.get('date'))
      }).catch(err => console.error(err));

    // print output (response.text)
    output.then(function(x){console.log(x) ;}).catch(err => console.error(err));

    console.log("# End fetch url");
    return output;
}

async function new_collection(collection_name, description_text){
// TODO
}

async function new_user(login, email, firstName, lastName, password){
    // Input: new user info
    // prints header 'Content-Type' and 'Date' then prints response.text
    // prints resolved response.text()
    // Returns response.text as promise
    console.log("# Start New User");
    
    let promise = fetch(url)
    let output= promise.then(response => response.text());

    // prints header
    promise.then(response => {
        console.log(response.headers.get('Content-Type'))
        console.log(response.headers.get('date'))
      }).catch(err => console.error(err));

    // print output (response.text)
    output.then(function(x){console.log(x) ;}).catch(err => console.error(err));

    console.log("# End New User");
    return output;
}