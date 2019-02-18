import windowWithHeader from "./windowWithHeader";
import authService from "../services/authentication";
import "../parts/passwordInput";

const loginForm = {
	view: "form",
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
			paddingY: 10,
			rows: [
				{
					view: "template",
					template: `	<div>
							Don't have an account yet? <span class='register-link link'>Register here.</span> |
							<span class="forgot-password-link link">Forgot your password?</span>
						</div>`,
					borderless: true,
					autoheight: true,
					onClick: {
						"register-link": function() {
							// close current window
							this.getTopParentView().hide();
							$$("signup-window").show();
						},
						"forgot-password-link": function() {
							// close current window
							this.getTopParentView().hide();
							$$("recovery-window").show();
						}
					}
				}
			]
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
								authService.login(form.getValues(), win.showAfterLoginPage)
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

function cancelLogic() {
	const form = $$(loginForm.id);
	const win = form.getTopParentView();
	win.hide();
	form.elements["error-label"].hide();
	// showAfterLoginPage has been setted after window initialisation or before opening.
	delete win.showAfterLoginPage;
}

function getConfig(id) {
	loginForm.id = `login-form-${webix.uid()}`;
	return windowWithHeader.getConfig(id, loginForm, "Login", cancelLogic);
}

function getIdFromConfig() {
	return windowWithHeader.getIdFromConfig();
}

function getFormId() {
	return loginForm.id;
}

export default {
	getConfig,
	getIdFromConfig,
	getFormId
};
