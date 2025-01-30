const urlBase = '104.248.52.44/LAMPAPI';
const extension = 'php';

let userId = '0';
let firstName = "";
let lastName = "";
const ids = [];

function doLogin() {

	userId = 0;
	firstName = "";
	lastName = "";

	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;

	var hash = md5(password);

	if (validLoginForm(login, password) == false) {

		document.getElementById("loginResult").innerHTML = "invalid username or password";
		return;
    }

	document.getElementById("loginResult").innerHTML = "";

	let tmp = {
		login: login,
		password: hash
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = '/LAMPAPI/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {

		xhr.onreadystatechange = function () {

			if (this.readyState == 4 && this.status == 200) {

				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1) {

					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
				window.location.href = "contacts.html";
			}
		};

		xhr.send(jsonPayload);

	} catch (err) {

		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doSignUp() {

	firstName = document.getElementById("firstName").value;
	lastName = document.getElementById("lastName").value;
	let username = document.getElementById("signUpUsername").value;
	let password = document.getElementById("signUpPassword").value;

	if (validSignUp(firstName, lastName, username, password) ==  false) {
		document.getElementById("signUpResult").innerHTML = "Sign up invalid";
		return;
	}

	var hash = md5(password);

	document.getElementById("signUpResult").innerHTML = "";

	let tmp = {
		FirstName: firstName,
		LastName: lastName,
		Username: username,
		Password: hash
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = '/LAMPAPI/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {

		xhr.onreadystatechange = function () {

			if (this.readyState != 4) {
				return;
			}

			if (this.status == 409) {
				document.getElementById("signUpResult").innerHTML = "User already exists";
				return;
			}

			if (this.status == 200) {

				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				document.getElementById("signUpResult").innerHTML = "User added";

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
			}
		};

		xhr.send(jsonPayload);

	} catch (err) {
		document.getElementById("signUpResult").innerHTML = err.message;
	}
}

function saveCookie() {

	let minutes = 20;
	let date = new Date();

	date.setTime(date.getTime() + (minutes * 60 * 1000));

	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie() {

	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");

	for(var i = 0; i < splits.length; i++) {

		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");

		if(tokens[0] == "firstName") {

			firstName = tokens[1];

		} else if(tokens[0] == "lastName") {

			lastName = tokens[1];

		} else if(tokens[0] == "userId") {

			userId = parseInt(tokens[1].trim());
		}
	}
	
	if(userId < 0) {

		window.location.href = "index.html";

	} else {

		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function validLogin(logName, logPassword) {

	var logNameE = logPasswordE = true;

	if (logName == "") {

		console.log("Username blank");

	} else {

		var regex = /(?=.*[a-zA-Z])[a-zA-Z0-9-_]{3,18}$/;

		if (regex.test(logName) == false) {

			console.log("Username invalid");

		} else {

			console.log("Username valid");
			logNameE = false;
		}
	}

	if (logPassword == "") {

		console.log("Password blank");

	} else {

		var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

		if (regex.test(logpassword) == false) {

			console.log("Password invalid");

		} else {

			console.log("Password valid");
			logPasswordE = false;
		}
	}

	if ((logNameE || logPassE) == true) {

		return false;
	}

	return true;
}

function validSignUp(firstName, lastName, username, password) {

	var firstNameE = lastNameE = usernameE = passwordE = true;

	if (firstName == "") {

		console.log("First name blank");

	} else {

		console.log("First name valid");
		firstNameE = false;

	}

	if (lastName == "") {

		console.log("Last name blank");

	} else {

		console.log("Last name valid");
		lastNameE = false;
	} 

	if (username == "") {

		console.log("Username blank");

	} else {

		var regex = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{3,18}$/;

		if (regex.test(username) == false) {

				console.log("Username invalid");

		} else {

				console.log("Username valid");
				usernameE = false;
		}
	}

	if (password == "") {

		console.log("Password blank");

	} else {

		var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

		if (regex.test(password) == false) {

				console.log("Password invalid");

		} else {

				console.log("Password valid");
				passwordE = false;
		}
	}

	if ((firstNameE || lastNameE || usernameE || passwordE) == true) {

		return false;

	}

	return true;
}
