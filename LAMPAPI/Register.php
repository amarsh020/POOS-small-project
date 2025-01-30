<?php

$inData = getRequestInfo();

$firstName = $inData["FirstName"];
$lastName = $inData["LastName"];
$userName = $inData["Username"];
$password = $inData["Password"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contactsWebsite");
if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    // Check if the username already exists in db
    $check_username_sql = "SELECT * FROM Users WHERE Username = ?";
    $stmt = $conn->prepare($check_username_sql);
    $stmt->bind_param("s", $userName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0){

        // Username already exists in db
        returnWithError("Username already taken.");
    }else{

        //Username doesn't exist in db        
        $stmt = $conn->prepare("INSERT into Users (FirstName,LastName,Username,Password ) VALUES(?,?,?,?)");
        $stmt->bind_param("ssss", $firstName, $lastName, $userName, $password);
        $stmt->execute();
        $stmt->close();
        $conn->close();
        returnWithError("");
    }

}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}
function sendResultInfoAsJson( $obj )
{
    header('Content-type: application/json');
    echo $obj;
}
function returnWithError( $err )
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
}
?>