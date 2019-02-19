"use strict";
// Webix Layout: (params needs to be defined elsewhere)

var papayaColorTables = ["Greyscale", "Spectrum",
    "Overlay (Positives)", "Overlay (Negatives)",
    "Hot-and-Cold", "Gold",
    "Red Overlay", "Green Overlay",
    "Blue Overlay", "Fire"
];

const ID_LOGOUT_PANEL = "id-logout-panel";
const ID_LOGIN_PANEL = "id-login-panel";
const ID_WINDOW_LOGIN = "id-window-login";
const ID_LOGIN_FORM = "id-login-form";

//config may as well include only text, color and date hash
var sliderEditorStep = 0.05;
var sliderMinValue = 0;
var sliderMaxValue = 1;

webix.editors.$popup = {
	slider:{
		view: "popup",
        width: 200,
		body:{
		    rows: [
		        {
                    view:"slider",
					type:"alt",
                    min: sliderMinValue,
                    max: sliderMaxValue,
                    step: sliderEditorStep,
					title: (obj) => {
                        if (!Number.isInteger(obj.value)) {
                            obj.value = Number(obj.value);
                        }
                        return obj.value.toFixed(2);
                    }
                }
            ]
		}
	}
};


webix.editors.sliderEditor = webix.extend({
	popupType: "slider",
	getInputNode: function() {
		return this.getPopup().getBody().getChildViews()[0];
	},
	getValue: function () {
		return this.getInputNode().getValue();
	}
}, webix.editors.popup);

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
        editor: "sliderEditor"
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

            console.log(state, rowId, colId);
            if (state) {
                params[iname]["visible"] = 1;
                papaya.Container.showImage(0, layerN);
                console.log(`Value Changed: ON`);
            } else {
                params[iname]["visible"] = 0;
                papaya.Container.hideImage(0, layerN);
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
                    console.log(`Value ${state.value}`);
                    console.log(`IName ${iname}`);
                    console.log(`Layer ${layerN}`);
                    params[iname]["min"] = state.value;
                    //papayaContainers[0].viewer.screenVolumes[layerN].min = params[iname]["min"];
                    papayaContainers[0].viewer.screenVolumes[layerN].screenMin = parseFloat(params[iname]["min"]);
                    papayaContainers[0].viewer.screenVolumes[layerN].updateScreenRange();
                    papayaContainers[0].viewer.drawViewer(true, false);
                    //papaya.Container.resetViewer(0);
                    console.log(`Value Changed: min ${state.value}`);
                }
                if (col == "max") {
                    params[iname]["max"] = state.value;
                    papayaContainers[0].viewer.screenVolumes[layerN].screenMax = parseFloat(params[iname]["max"]);
                    papayaContainers[0].viewer.screenVolumes[layerN].updateScreenRange();
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
};


function getDictIndexFromValue(val, dict) {
    // finds val within dict._id
    let output;
    dict.forEach(x =>
        x.value == val ? output = x._id : 0
    );
    return output;
}

function ajaxLogin(sourceParams) {
	const params = sourceParams ? {
		username: sourceParams.username || 0,
		password: sourceParams.password || 0
	} : {};
	const tok = `${params.username}:${params.password}`;
	let hash;
	try {
		hash = btoa(tok);
	}
	catch (e) {
		console.log("Invalid character in password or login");
	}
	return webix.ajax()
		.headers({
			"Authorization": `Basic ${hash}`
		})
		.get(`${girder_url}/api/v1/user/authentication`)
		.then(result => result.json());
}

function ajaxLogout() {
	return webix.ajax().del(`${girder_url}/api/v1/user/authentication`)
		.fail(err => console.error(err))
		.then(result => result.json());
}

function login(params, afterLoginPage) {
	return ajaxLogin(params).then((data) => {
		webix.storage.local.put("authToken", data.authToken);
		webix.storage.local.put("user", data.user);
		// trigger event
		showLogoutPanel();
		refreshPage();
	});
}

function refreshPage() {
	get_folder_folders(parent_id) //Get folder contents as json
		.then(function (x) { // initialize girderFolderDict
			x.forEach(function (i) {
				girderFolderDict.push({
					_id: i._id,
					value: i.name
				});
				girderFolderNames.push(i.value); // push
			}) // forEach
		}) // then
		.then(function () { // Start Application:
			console.log(girderFolderDict);
			resetPage(girderFolderDict[0]._id);
		})
}

function logout() {
	ajaxLogout().then(() => {
		webix.storage.local.remove("user");
		webix.storage.local.remove("authToken");
	});
	$$(ID_LOGIN_PANEL).show();
	refreshPage();
}

function getToken() {
	const authToken = webix.storage.local.get("authToken");
	if (!authToken) {
		return null;
	}
	return authToken.token;
}


function isLoggedIn() {
	return getToken() && getUserInfo();
}

function getUserInfo() {
	return webix.storage.local.get("user");
}

function cancelLogic() {
	const form = $$(ID_LOGIN_FORM);
	const win = form.getTopParentView();
	win.hide();
	form.elements["error-label"].hide();
}

function togglePasswordVisibility(elem) {
	if (elem.config.icon === "eye") {
		elem.define("type", "password");
		elem.define("icon", "eye-slash");
	}
	else {
		elem.define("type", "base");
		elem.define("icon", "eye");
	}
	elem.refresh();
}

webix.protoUI({
	name: "passwordInput",
	$cssName: "search",
	$init() {
		this.attachEvent("onSearchIconClick", (ev) => {
			togglePasswordVisibility($$(ev.target));
		});
	},
	defaults: {
		type: "password",
		icon: "eye-slash"
	}
}, webix.ui.search);

function calcUserMenuWidth(str) {
	return (str && str.length ? str.length * 20 : 1) <= 150 || 150;
}

function createConfig(firstName, lastName) {
	const name = `${firstName || ""} ${lastName || ""}`;
	const cols = [
		{},
		{
			rows: [
				{},
				{
					view: "menu",
					openAction: "click",
                    css: "header-base-menu",
					width: calcUserMenuWidth(name),
					data: [
						{
							id: "name",
							value: `<span style="margin-left: -10px; width: ${calcUserMenuWidth(name)}px;" title="${firstName} ${lastName}"}>${name}</span>`,
							submenu: [
								{id: "logout", value: "<span class='fa fa-arrow-right'></span> Logout"}
							]
						}
					],
					type: {
						subsign: true
					},
					on: {
						onMenuItemClick(id) {
							switch (id) {
								case "logout": {
									logout();
									break;
								}
								default: {
									break;
								}
							}
						}
					}
				},
				{}
			]
		}
	];

	return cols;
}

function showLogoutPanel() {
	const user = getUserInfo();
	const cols = createConfig(user.firstName, user.lastName);
	const logoutPanel = $$(ID_LOGOUT_PANEL);
	webix.ui(cols, logoutPanel);
	logoutPanel.show(false, false);
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
        css: "papaya-viewer-layout",
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

	const loginForm = {
		view: "form",
        id: ID_LOGIN_FORM,
		width: 600,
		rules: {
			"username": webix.rules.isNotEmpty,
			"password": webix.rules.isNotEmpty
		},
		elements: [
			{
				view: "label",
				name: "error-label",
				label: "",
				align: "center",
				hidden: true
			},
			{
				view: "text",
				name: "username",
				label: "Login or Email",
				placeholder: "Enter Login or Email",
				invalidMessage: "Enter Login or Email"
			},
			{
				view: "passwordInput",
				name: "password",
				label: "Password",
				placeholder: "Enter password",
				invalidMessage: "Enter password"
			},
			{
				cols: [
					{},
					{
						view: "button",
						css: "btn-contour",
						width: 80,
						name: "cancelButton",
						value: "Cancel",
						on: {
							onItemClick: cancelLogic
						}
					},
					{width: 20},
					{
						view: "button",
						css: "btn",
						width: 80,
						name: "loginButton",
						value: "Login",
						hotkey: "enter",
						on: {
							onItemClick() {
								const form = this.getFormView();
								const win = this.getTopParentView();
								webix.extend(win, webix.ProgressBar);
								win.showProgress();
								if (form.validate()) {
									// showAfterLoginPage has been setted after window initialisation or before opening
									login(form.getValues(), win.showAfterLoginPage)
										.then(() => {
											delete win.showAfterLoginPage;
											form.clear();
											form.elements["error-label"].hide();
											win.hideProgress();
											this.getTopParentView().hide();
										})
										.fail((xhr) => {
											if (xhr.status === 401) {
												const errorLabel = form.elements["error-label"];
												errorLabel.setValue("Login or password are not correct");
												errorLabel.show();
											}
											win.hideProgress();
										});
								}
								else {
									win.hideProgress();
								}
							}
						}
					}
				]
			}
		],
		elementsConfig: {
			labelWidth: 120
		}
	};

	const loginWindow = {
		view: "window",
		id: ID_WINDOW_LOGIN,
		modal: true,
		position: "center",
		headHeight: 30,
		move: true,
		head: {
			view: "toolbar",
			borderless: true,
			type: "clean",
			height: 32,
			cols: [
				{
					template: "Login",
					borderless: true,
					autoheight: true
				},
				{gravity: 0.001},
				{
					view: "button",
					type: "icon",
                    icon: "fa fa-times",
					width: 30,
					align: "right",
					on: {
						onItemClick() {
							this.getTopParentView().hide();
							if (typeof cancelLogic === "function") {
								cancelLogic();
							}
						}
					}
				},
				{width: 5}
			]
		},
		body: loginForm
	};

	const logo = {
		template: "Webix Papaya",
        css: "main-header-logo",
		borderless: true
	};

	const loginMenu = {
		template: "<span class='menu-login login-menu-item'>Login</span>",
		css: "login-menu",
		borderless: true,
		width: 150,
		onClick: {
			"menu-login": () => {
				const loginWindowView = $$(ID_WINDOW_LOGIN) || webix.ui(loginWindow);
				loginWindowView.show();
			}
		}
	};

	const loginPanel = {
		id: ID_LOGIN_PANEL,
		cols: [
			{},
			loginMenu,
		]
	};

	const logoutPanel = {
		id: ID_LOGOUT_PANEL,
		cols: []
	};

	const userPanel = {
		view: "multiview",
		css: "userbar",
		animate: false,
		cells: [
			loginPanel,
			logoutPanel
		]
	};

	const header = {
		height: 60,
		width: 1220,
        css: "main-header",
		cols: [
            {gravity: 0.5},
            {
                rows: [
                    {height: 20},
					logo
                ]
            },
			userPanel,
            {gravity: 0.5}
		]
	};

    var layout = {
        rows: [
			header,
            {
				cols: [leftPanel, {
					view: "resizer"
				}, middlePanel, {
					view: "resizer"
				}, //rightPanel
				]
            }
        ]
    };

    console.log("Done: setupPanels");
    return (layout);
};