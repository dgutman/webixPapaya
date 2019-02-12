// Tests girderAPI.js

set_girderUrl('http://candygram.neurology.emory.edu:8080');
set_collectionId("5c48db6de62914004de6350f"); // "FG"
set_folderId('5c49e88de62914004ded6b45'); // "niftis"
set_fileId('5c4b3d52e62914004df6fd08'); // "set-0_tstat2.nii.gz"

// placeholder will update once promise is fullfilled; until then, it remains a pleasent greeting.
var placeholder = 'hello';

// Test get_collection_ID
get_collection_ID('FG')
    .then(function (x) {
        set_collectionId(x);
        placeholder = x;
    });
// Test post_folder
get_folder_ID('niftis', get_collectionId())
    .then(function (x) {
        set_folderId(x);
        placeholder = x;
    });

get_file_ID("set-0_tstat2.nii.gz", folder_id)
    .then(function (x) {
        set_fileId(x);
        placeholder = x;
    });