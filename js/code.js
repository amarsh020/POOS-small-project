const urlBase = "104.248.52.44/LAMPAPI";

const extension = "php";



let userId = "0";

let firstName = "";

let lastName = "";

allContacts=[]

currentPage = 1;

const contactsPerPage = 12;

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

    document.getElementById("loginResult").innerHTML =

      "invalid username or password";

    return;

  }



  document.getElementById("loginResult").innerHTML = "";



  let tmp = {

    username: login,

    password: hash,

  };



  let jsonPayload = JSON.stringify(tmp);



  let url = "/LAMPAPI/Login." + extension;



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

          document.getElementById("loginResult").innerHTML =

            "User/Password combination incorrect";

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



  if (validSignUp(firstName, lastName, username, password) == false) {

    document.getElementById("signUpResult").innerHTML = "Sign up invalid";

    return;

  }



  var hash = md5(password);



  document.getElementById("signUpResult").innerHTML = "";



  let tmp = {

    FirstName: firstName,

    LastName: lastName,

    Username: username,

    Password: hash,

  };



  let jsonPayload = JSON.stringify(tmp);



  let url = "/LAMPAPI/Register." + extension;



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

    password: hash,

  };



  let jsonPayload = JSON.stringify(tmp);

  let url = "/LAMPAPI/Login." + extension;



  let xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);

  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");



  try {

    xhr.onreadystatechange = function () {

      if (this.readyState == 4 && this.status == 200) {

        let jsonObject = JSON.parse(xhr.responseText);

        userId = jsonObject.id;



        if (userId < 1) {

          document.getElementById("signUpResult").innerHTML =

            "Login failed after signup.";

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



  date.setTime(date.getTime() + minutes * 60 * 1000);



  document.cookie =

    "firstName=" +

    firstName +

    ",lastName=" +

    lastName +

    ",userId=" +

    userId +

    ";expires=" +

    date.toGMTString();

}



function readCookie() {

  userId = -1;

  let data = document.cookie;

  let splits = data.split(";");



  for (var i = 0; i < splits.length; i++) {

    let thisOne = splits[i].trim();

    let tokens = thisOne.split("=");



    if (tokens[0] == "firstName") {

      firstName = tokens[1];

    } else if (tokens[0] == "lastName") {

      lastName = tokens[1];

    } else if (tokens[0] == "userId") {

      userId = parseInt(tokens[1].trim());

    }

  }



  if (userId < 0) {

    window.location.href = "index.html";

  } else {

    document.getElementById("userName").innerHTML =

      "Logged in as " + firstName + " " + lastName;

  }

}



function displayContacts(contacts) {

        let contactsContainer = document.getElementById("contactsContainer");

        contactsContainer.innerHTML = ""; // Clear existing contacts



        let start = (currentPage - 1) * contactsPerPage;

        let end = start + contactsPerPage;

        let paginatedContacts = contacts.slice(start, end);



        paginatedContacts.forEach(contact => {

            let contactCard = document.createElement("div");

            contactCard.classList.add("contact-card");



            // Left - Initials

            let initialsDiv = document.createElement("div");

            initialsDiv.classList.add("initials");

            initialsDiv.textContent = `${contact.FirstName[0].toUpperCase()}${contact.LastName[0].toUpperCase()}`;



            // Center - Contact Info

            let contactDetails = document.createElement("div");

            contactDetails.classList.add("contact-details");

            contactDetails.innerHTML = `

                <h3>${contact.FirstName} ${contact.LastName}</h3>

                <p>${formatPhoneNumber(contact.Phone)}</p>

                <p>${contact.Email}</p>

            `;



            // Right - Buttons

            let buttonsDiv = document.createElement("div");

            buttonsDiv.classList.add("buttons-container");



            let editButton = document.createElement("button");

            editButton.classList.add("edit-btn");

                        editButton.innerHTML = `<img src="../images/edit.png" alt="Edit" class="button-icon">`;

            editButton.addEventListener("click", () =>

                editContact(contactCard, contactDetails, editButton, contact.ID)

            );



            let deleteButton = document.createElement("button");

            deleteButton.classList.add("delete-btn");

                        deleteButton.innerHTML = `<img src="../images/delete.png" alt="Delete" class="button-icon">`;

            deleteButton.addEventListener("click", () =>

                deleteContact(contactCard, contact.FirstName, contact.LastName, contact.ID)

            );



            buttonsDiv.appendChild(editButton);

            buttonsDiv.appendChild(deleteButton);



            // Append Elements

            contactCard.appendChild(initialsDiv);

            contactCard.appendChild(contactDetails);

            contactCard.appendChild(buttonsDiv);

            contactsContainer.appendChild(contactCard);

        });



        updatePaginationButtons(contacts.length);

    }



    // Updates pagination buttons

    function updatePaginationButtons(totalContacts) {

        let paginationContainer = document.getElementById("pagination");

        paginationContainer.innerHTML = ""; // Clear previous buttons



        let totalPages = Math.ceil(totalContacts / contactsPerPage);



        let prevButton = document.createElement("button");

        prevButton.textContent = "Previous";

        prevButton.disabled = currentPage === 1;

        prevButton.addEventListener("click", () => {

            if (currentPage > 1) {

                currentPage--;

                displayContacts(allContacts); // Refresh contacts

            }

        });



        let nextButton = document.createElement("button");

        nextButton.textContent = "Next";

        nextButton.disabled = currentPage === totalPages;

        nextButton.addEventListener("click", () => {

            if (currentPage < totalPages) {

                currentPage++;

                displayContacts(allContacts); // Refresh contacts

            }

        });



        paginationContainer.appendChild(prevButton);

        paginationContainer.appendChild(nextButton);

}





function formatPhoneNumber(phone) {

  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");

}



function loadContacts(searchQuery = "") {

  console.log("Loading contacts... Search Query:", searchQuery);



  let userId = localStorage.getItem("userId");

  if (!userId || parseInt(userId, 10) < 1) {

    console.error("No valid session found, redirecting to login...");

    window.location.href = "index.html";

    return;

  }



  userId = parseInt(userId, 10);



  let tmp = {

    search: searchQuery,

    userId: userId,

  };

  let jsonPayload = JSON.stringify(tmp);



  let url = "/LAMPAPI/SearchContacts." + extension;



  let xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);

  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");



  try {

    xhr.onreadystatechange = function () {

      if (this.readyState === 4 && this.status === 200) {

        let jsonObject = JSON.parse(xhr.responseText);

        let contactsContainer = document.getElementById("contactsContainer");

        contactsContainer.innerHTML = "";



        if (!jsonObject.results || jsonObject.results.length === 0) {

          console.log("No contacts found.");

          contactsContainer.innerHTML = "<p>No contacts found.</p>";

          return;

        }



        jsonObject.results.sort((a, b) => {

          let fullNameA = (a.FirstName + " " + a.LastName).toLowerCase();

          let fullNameB = (b.FirstName + " " + b.LastName).toLowerCase();

          return fullNameA.localeCompare(fullNameB);

        });

        allContacts=jsonObject.results;



        displayContacts(jsonObject.results);

      }

    };

    xhr.send(jsonPayload);

  } catch (err) {

    console.error("Error loading contacts:", err.message);

  }

}



function searchContacts() {

  let searchQuery = document.getElementById("searchText").value.trim();

  loadContacts(searchQuery);

}



function showTable() {

  let form = document.getElementById("addContactForm");

  if (!form) {

    console.error("Error: Element with ID 'addContactForm' not found.");

    return;

  }



  if (form.style.display === "none" || form.style.display === "") {

        console.log("Showing add contact form.");

        form.style.display = "block"; // Force display

        form.style.visibility = "visible"; // Ensure it's visible

    } else {

        console.log("Hiding add contact form.");

        form.style.display = "none";

    }

}



function addContact() {

  console.log("Adding contact...");

  let form = document.getElementById("addContactForm");



  let firstName = document.getElementById("contactTextFirst").value.trim();

  let lastName = document.getElementById("contactTextLast").value.trim();

  let phone = document.getElementById("contactTextNumber").value.trim();

  let email = document.getElementById("contactTextEmail").value.trim();

  let userId = localStorage.getItem("userId");



  // Validate fields

  if (!firstName || !lastName || !phone || !email) {

    alert("Please fill in all fields.");

    return;

  }



  userId = parseInt(userId, 10);



  let tmp = {

    FirstName: firstName,

    LastName: lastName,

    Phone: phone,

    Email: email,

    UserID: userId,

  };

  let jsonPayload = JSON.stringify(tmp);



  let url = "/LAMPAPI/AddContact." + extension;



  let xhr = new XMLHttpRequest();

  xhr.open("POST", url, true);

  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");



  try {

    xhr.onreadystatechange = function () {

      if (this.readyState === 4 && this.status === 200) {

        console.log("Contact added successfully.");

        document.getElementById("addMe").reset();

        loadContacts();

        form.style.display = "none";

      }

    };

    xhr.send(jsonPayload);

  } catch (err) {

    console.error("Error adding contact:", err.message);

  }

}



function editContact(contactCard, contactDetails, editButton, contactID) {

    let nameElements = contactDetails.getElementsByTagName("h3")[0];

    let infoElements = contactDetails.getElementsByTagName("p");



    let firstName = nameElements.textContent.split(" ")[0];

    let lastName = nameElements.textContent.split(" ")[1];

    let phone = infoElements[0].textContent;

    let email = infoElements[1].textContent;



    contactDetails.innerHTML = `

        <input type="text" id="editFirstName" value="${firstName}">

        <input type="text" id="editLastName" value="${lastName}">

        <input type="text" id="editPhone" value="${phone}">

        <input type="text" id="editEmail" value="${email}">

    `;



    editButton.innerHTML = `<img src="../images/save.png" alt="Save" class="button-icon">`;

    editButton.onclick = function () {

        saveContact(contactCard, contactID);

    };

}

function saveContact(contactCard, contactID) {
    let editedFirstName = document.getElementById("editFirstName").value.trim();
    let editedLastName = document.getElementById("editLastName").value.trim();
    let editedPhone = document.getElementById("editPhone").value.trim();
    let editedEmail = document.getElementById("editEmail").value.trim();

    retString = validEdit(editedFirstName, editedLastName, editedPhone, editedEmail);
    if(retString != ""){
      errors = retString.split(" ");
      alertString = "You entered an Invalid ";
        for(let i = 0; i < errors.length; i++){
                alertString = alertString + errors[i];
                if(i != errors.length - 1){
                        alertString = alertString + ", ";
                }
        }
      alert(alertString + "!");
      return;
    }
    let tmp = {
        ContactId: contactID,
        FirstName: editedFirstName,
        LastName: editedLastName,
        Phone: editedPhone,
        Email: editedEmail
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = "/LAMPAPI/UpdateContact." + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
                        console.log("Save response status:", this.readyState, this.status);
            if (this.readyState === 4 && this.status === 200) {
                console.log("Contact updated successfully.");
                loadContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.error("Error updating contact:", err.message);
    }
}

function deleteContact(contactCard, firstName, lastName, contactID) {

    if (!confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) {

        return;

    }



    let tmp = {

                ContactId: contactID,

                FirstName: firstName,

                LastName: lastName

        };



    let jsonPayload = JSON.stringify(tmp);

    let url = "/LAMPAPI/DeleteContact." + extension;



    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");



    try {

        xhr.onreadystatechange = function () {

                        console.log("Delete response:", this.readyState, this.status);

            if (this.readyState === 4 && this.status === 200) {

                console.log("Contact deleted successfully.");

                loadContacts();

            }

        };

        xhr.send(jsonPayload);

    } catch (err) {

        console.error("Error deleting contact:", err.message);

    }

}



function validLogin(logName, logPassword) {

  var logNameE = (logPasswordE = true);



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

  var firstNameE = (lastNameE = usernameE = passwordE = true);



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

    document.getElementById("userName").innerHTML =

      "Logged in as " + firstName + " " + lastName;

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

function validEdit(firstName, lastName, phone, email){
    ret = ""
    phone = formatPhoneNumber(phone);
    if (firstName == "") {
      console.log("First name blank");
      ret = ret + "FirstName "
    } else {
      console.log("First name valid");
    }

    if (lastName == "") {
      console.log("Last name blank");
      ret = ret + "LastName ";
    } else {
      console.log("Last name valid");
    }

    if (phone == "") {
      console.log("Phone blank");
    } else {
      var regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

      if (regex.test(phone) == false) {
        console.log("phone invalid");
        ret = ret + "Phone ";
      } else {
        console.log("Phone valid");
      }
    }

    if (email == "") {
      console.log("email blank");
    } else {
      var regex = /^\S+@\S+\.\S+$/;

      if (regex.test(email) == false) {
        console.log("email invalid");
        ret = ret + "Email ";
      } else {
        console.log("email valid");
      }
    }

    return ret.substring(0, ret.length-1);
}