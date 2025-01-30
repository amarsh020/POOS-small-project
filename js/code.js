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
	console.log("Password Hash Sent:", hash);

	if (validLogin(login, password) == false) {

		document.getElementById("loginResult").innerHTML = "invalid username or password";
		return;
    }

	document.getElementById("loginResult").innerHTML = "";

	let tmp = {
		username: login,
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

				console.log("Server Response:", this.responseText);

				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1) {

					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				console.log("Saving User Session");
				saveSession();

				console.log("Redirecting to contacts.html...");
				window.location.assign("/contacts.html");
			}
		};

		xhr.send(jsonPayload);

	} catch (err) {

		console.error("Error parsing JSON:", error);
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

			if (this.status == 200) {

				let jsonObject = JSON.parse(xhr.responseText);
				
				if (jsonObject.error && jsonObject.error !== "") {
                    // If an error exists in the response, display it
                    document.getElementById("signUpResult").innerHTML = jsonObject.error;
                    return;
                }

				document.getElementById("signUpResult").innerHTML = "User added";
				doAutoLogin(username, password);
			}
		};

		xhr.send(jsonPayload);

	} catch (err) {
		document.getElementById("signUpResult").innerHTML = err.message;
	}
}

function doAutoLogin(username, password) {
    console.log("Auto-login after signup..."); // Debugging

    let hash = md5(password);

    let tmp = {
        username: username,
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
                    document.getElementById("signUpResult").innerHTML = "Login failed after signup.";
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveSession(); // Save session info
                console.log("Auto-login successful. Redirecting...");

                // Redirect to contacts page
                window.location.assign("/contacts.html");
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
	let splits = data.split(";");

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

function loadContacts() {
	
	let tmp = {
		search: "",
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = '/LAMPAPI/SearchContacts.' + extension;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {

		xhr.onreadystatechange = function () {

			if (this.readyState == 4 && this.status == 200) {

				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error) {

					console.log(jsonObject.error);
					return;
				}

				let text = "<table border='1'>"

				for (let i = 0; i < jsonObject.results.length; i++) {

					ids[i] = jsonObject.results[i].ID

					text += "<tr id='row" + i + "'>"
					text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
					text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
					text += "<td id='email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
					text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";

					text += "<td>" +
						"<button type='button' id='edit_button" + i + "' class='w3-button w3-circle w3-lime' onclick='edit_row(" + i + ")'>" + "<span class='glyphicon glyphicon-edit'></span>" + "</button>" +
						"<button type='button' id='save_button" + i + "' value='Save' class='w3-button w3-circle w3-lime' onclick='save_row(" + i + ")' style='display: none'>" + "<span class='glyphicon glyphicon-saved'></span>" + "</button>" +
						"<button type='button' onclick='delete_row(" + i + ")' class='w3-button w3-circle w3-amber'>" + "<span class='glyphicon glyphicon-trash'></span> " + "</button>" + "</td>";
					text += "<tr/>"
				}

				text += "</table>"
				document.getElementById("tbody").innerHTML = text;
			}
		};

		xhr.send(jsonPayload);

	} catch (err) {
		
		console.log(err.message);
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

		if (regex.test(logPassword) == false) {

			console.log("Password invalid");

		} else {

			console.log("Password valid");
			logPasswordE = false;
		}
	}

	if ((logNameE || logPasswordE) == true) {

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

function saveSession() {
    console.log("Saving session..."); // Debugging

    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("userId", userId.toString());

    console.log("Session Data Set:", localStorage);
}

function readSession() {
    userId = localStorage.getItem("userId");
    firstName = localStorage.getItem("firstName");
    lastName = localStorage.getItem("lastName");

    console.log("Reading session:", { userId, firstName, lastName }); // Debugging

        // Ensure userId is a valid number before checking
    userId = userId ? parseInt(userId, 10) : -1;

    if (!userId || userId < 1) {
        console.warn("Invalid user session! Redirecting to login.");
        window.location.href = "index.html";
    } else {
        document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
    }
}

function doLogout() {
    console.log("Logging out..."); // Debugging

    // Clear session storage
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("userId");

    console.log("Session cleared:", localStorage); // Debugging

    // Redirect to login page
    window.location.href = "index.html";
}