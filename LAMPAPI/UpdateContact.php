<?php
    $inData = getRequestInfo();

    $firstName = $inData["FirstName"];
    $lastName = $inData["LastName"];
    $phone = $inData["Phone"];
    $email = $inData["Email"];
    $contactId = $inData["ContactId"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "contactsWebsite");
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName=?, Phone= ?, Email= ? WHERE ID= ?");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $contactId);
        $stmt->execute();
        $stmt->close();
        $conn->close();
		returnWithInfo( $firstName, $lastName,$email, $phone, $contactId );
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
    function returnWithInfo( $firstName, $lastName,$email, $phone, $contactId )
	{
		$retValue = '{"ID":' . $contactId . ',"FirstName":"' . $firstName . '","LastName":"' . $lastName  . '","Email":"' . $email . '","Phone":"' . $phone . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
?>