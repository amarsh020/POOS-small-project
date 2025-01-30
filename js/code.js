const urlBase = '104.248.52.44';
const extension = 'php';

let userId = '0';
let fName = "";
let lName = "";
const ids = [];

/* function doLogin() {

	userId = 0;
	fName = "";
	lName = "";

	let login = document.getElementById("loginName").value;
	let pswd = document.getElementById("loginPassword").value;
	var hash = md5(pswd);
} */

function doSignUp() {

	fName = document.getElementById("firstName").value;
	lName = document.getElementById("lastName").value;
	let uName = document.getElementById("signUpUsername").value;
	let pswd = document.getElementById("signUpPassword").value;

	if (validSignUp(fName, lName, uName, pswd) ==  false) {
		document.getElementById("signupResult").innerHTML = "Sign up invalid";
		return;
	}

	var hash = md5(password);

	document.getElementById("signUpResult").innerHTML = "";

	let tmp = {
		firstName: fName,
		lastName: lName,
		userName: uName,
		password: hash
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {

		xhr.onreadystatechange = function () {

			if (this.readyState != 4) {
				return;
			}

			if (this.status == 409) {
				document.getElementById("signupResult").innerHTML = "User already exists";
				return;
			}

			if (this.status == 200) {

				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				document.getElementById("signupResult").innerHTML = "User added";

				fName = jsonObject.firstName;
				lName = jsonObject.lastName;

				saveCookie();
			}
		};

		xhr.send(jsonPayload);

	} catch (err) {
		document.getElementById("signupResult").innerHTML = err.message;
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

function validLogin(logName, logPswd) {

	var logNameE = logPswdE = true;

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

	if (logPswd == "") {

		console.log("Password blank");

	} else {

		var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

		if (regex.test(logPswd) == false) {

			console.log("Password invalid");

		} else {

			console.log("Password valid");
			logPswdE = false;
		}
	}

	if ((logNameE || logPassE) == true) {

		return false;
	}

	return true;
}

function validSignUp(fName, lName, uName, pswd) {

	var fNameE = lNameE = uNameE = pswdE = true;

	if (fName == "") {

		console.log("First name blank");

	} else {

		console.log("First name valid");
		fNameE = false;

	}

	if (lName == "") {

		console.log("Last name blank");

	} else {

		console.log("Last name valid");
		lNameE = false;
	} 

	if (uName == "") {

		console.log("Username blank");

	} else {

		var regex = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{3,18}$/;

		if (regex.test(uName) == false) {

				console.log("Username invalid");

		} else {

				console.log("Username valid");
				uNameE = false;
		}
	}

	if (pswd == "") {

		console.log("Password blank");

	} else {

		var regex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;

		if (regex.test(pswd) == false) {

				console.log("Password invalid");

		} else {

				console.log("Password valid");
				pswdE = false;
		}
	}

	if ((fNameE || lNameE || uNameE || pswdE) == true) {

		return false;

	}

	return true;
}
