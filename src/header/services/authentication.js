import logoutPanel from "../parts/logoutPanel";
import girderAPI from "../../girderAPI";

function login(params, afterLoginPage) {
	return girderAPI.login(params).then((data) => {
		webix.storage.local.put("authToken", data.authToken);
		webix.storage.local.put("user", data.user);
		// trigger event
		logoutPanel.showLogoutPanel();
		//TODO refresh app
		// else {
		// 	state.app.refresh();
		// }
	});
}

function logout() {
	ajax.logout().then(() => {
		webix.storage.local.remove("user");
		webix.storage.local.remove("authToken");
	});
	//state.app.callEvent("logout");
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


function showMainPage() {
	window.location = "/";
}

function getUserInfo() {
	return webix.storage.local.get("user");
}

export default {
	login,
	logout,
	getToken,
	showMainPage,
	getUserInfo,
	isLoggedIn
};

