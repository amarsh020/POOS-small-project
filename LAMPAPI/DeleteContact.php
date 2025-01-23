<?php

$inData = getRequestInfo();

$userID = $inData["UserID"];
$firstName = $inData["FirstName"];
$lastName = $inData["LastName"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contactsWebsite");
if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    try
    {
        $stmt = $conn->prepare("DELETE from Contacts WHERE UserID=? AND FirstName=? AND LastName=?");
        $stmt->bind_param("sss", $userID, $firstName, $lastName);
        $stmt->execute();
        $stmt->close();
        $conn->close();
        returnWithError("");
    }
    catch(Exception $e)
    {
        returnWithError("No Contact Found.");
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