// Define Papaya Viewer Webix Object:
webix.protoUI({
    name: "webixPapaya",
    $init: function(config) {
        console.log("Init: webixPapaya");
        this.$view.innerHTML = " <div class='papaya' data-params='params'></div>";
    },
    defaults: {
        width: 800, //ideally these are dynamic
        height: 800
    }
}, webix.ui.view);