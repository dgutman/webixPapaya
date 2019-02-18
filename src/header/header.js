import LoginWindow from "./windows/loginWindow";
import LogoutPanel from "./parts/logoutPanel";

const ID_LOGOUT_PANEL = "id-logout-panel";
const ID_LOGIN_PANEL = "id-login-panel";
const ID_WINDOW_LOGIN = "id-window-login";

function createConfig() {
	const logo = {
		template: "Webix Papaya",
		css: "main-header-logo",
		borderless: true,
	};

	const loginMenu = {
		template: "<span class='menu-login login-menu-item'>Login</span>",
		css: "login-menu",
		borderless: true,
		width: 150,
		onClick: {
			"menu-login": () => {
				const loginWindow = $$(ID_WINDOW_LOGIN) || webix.ui(LoginWindow.getConfig(ID_WINDOW_LOGIN));
				loginWindow.show();
			}
		}
	};

	const loginPanel = {
		id: ID_LOGIN_PANEL,
		cols: [
			{},
			loginMenu
		]
	};

	const logoutPanel = {
		id: ID_LOGOUT_PANEL,
		cols: [
			LogoutPanel
		]
	};

	const userPanel = {
		view: "multiview",
		css: "userbar",
		cells: [
			loginPanel,
			logoutPanel
		]
	};

	const header = {
		height: 60,
		width: 1220,
		cols: [
			logo,
			userPanel
		]
	};

	return {
		rows: [
			{
				cols: [
					{},
					header,
					{}
				]
			}
		]
	};
}

export default {
	createConfig
}