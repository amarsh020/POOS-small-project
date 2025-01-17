<?php

$inData = getRequestInfo();

$id = 0;
$firstName = $inData["FirstName"];
$lastName = $inData["LastName"];
$phone = $inData["Phone"];
$email = $inData["Email"];
$uid = $inData["UserID"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contactsWebsite");
if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    $stmt = $conn->prepare("INSERT into Contacts (FirstName,LastName,Phone,Email) VALUES(?,?,?,?)");
    $stmt->bind_param("sssss", $firstName, $lastName, $phone, $email, $uid);
    $stmt->execute();
    $stmt->close();
    $conn->close();
    returnWithError("");
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