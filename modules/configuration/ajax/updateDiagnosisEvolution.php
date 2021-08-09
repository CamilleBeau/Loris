<?php
/**
 * This file is used by the Configuration module to update
 * or insert values into the Project table.
 *
 * PHP version 7
 *
 * @category Main
 * @package  Loris
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */

$user = \User::singleton();
if (!$user->hasPermission('config')) {
    header("HTTP/1.1 403 Forbidden");
    exit;
}

require_once __DIR__ . "/../../../vendor/autoload.php";
$client = new NDB_Client();
$client->makeCommandLine();
$client->initialize();

$DB = \Database::singleton();

$dxEvolutionID = $_POST['DxEvolutionID'] ?? null;

$name = $_POST['Name'] ?? null;
$visit = $_POST['visitLabel'] ?? null;
$instrumentName = $_POST['instrumentName'] ?? null;
$sourceField = $_POST['sourceField'] ?? null;
$orderNumber = $_POST['orderNumber'] ?? null;


// Create or update a Diagnosis Trajectory
if ($dxEvolutionID == 'new') {
    // Validation: Form is complete
    if (!($dxEvolutionID && $name && $visit && $instrumentName && $sourceField && $orderNumber)) {
        printAndExit(400, ['error' => 'Please fill out all fields!']);
    }

    // Validation: Name does not already exist
    $dxNames = $DB->pselectCol(
        "SELECT Name FROM diagnosis_evolution",
        []
    );
    if (in_array($name, $dxNames)) {
        printAndExit(409, ['error' => 'Conflict! Trajectory Name already exists.']);
    }

    // Validation: Instrument is part of Visit's test battery
    $visitInstruments = \Utility::getVisitInstruments($visit);
    if (!array_key_exists($instrumentName, $visitInstruments)) {
        printAndExit(409, ['error' => 'Conflict! Instrument does not exist in selected visit.']);
    }

    // Validation: Source Field belongs to Instrument
    $instrumentFields = array_column(
        \Utility::getSourcefields($instrumentName),
        'SourceField'
    );
    if (!in_array($sourceField, $instrumentFields)) {
        printAndExit(409, ['error' => 'Conflict! Source Field does not exists in instrument.']);
    }

    $DB->insert(
        'diagnosis_evolution',
        [
            "Name"              => $name,
            "visitLabel"        => $visit,
            "instrumentName"    => $instrumentName,
            "sourceField"       => $sourceField,
            "orderNumber"       => $orderNumber
        ]
    );
} else {
    // Update Diagnosis Trajectory
    $DB->update(
        'diagnosis_evolution',
        [
            "Name"              => $name,
            "visitLabel"        => $visit,
            "instrumentName"    => $instrumentName,
            "sourceField"       => $sourceField,
            "orderNumber"       => $orderNumber
        ],
        ['DxEvolutionID' => $dxEvolutionID]
    );

}


printAndExit(201, ["ok" => "Subproject updated successfully"]);


/**
 * Prints a parameter converted to JSON-encoded string.
 *
 * @param int                  $code The HTTP Response Code.
 * @param array<string,string> $msg  A key-value pair representing the JSON to
 *                                   be returned from this file.
 *
 * @return void
 */
function printAndExit(int $code, array $msg): void
{
    http_response_code($code);
    print json_encode($msg);
    exit;
}