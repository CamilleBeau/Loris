<?php
/**
 * This script updates each candidate's latest diagnosis based on the 
 * confidured diagnosis evolution trajectory.
 *
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Various <example@example.com>
 * @license  Loris license
 * @link     https://www.github.com/aces/Loris-Trunk/
 */
require_once __DIR__ . '/../generic_includes.php';

use LORIS\StudyEntities\Candidate\CandID;

$candIDs = $DB->pselectCol(
    "SELECT CandID FROM candidate
    WHERE Entity_type='Human' AND Active='Y'",
    []
);

foreach ($candIDs as $k => $candID) {
    $candidate = \Candidate::singleton(new CandID($candID));
    $latestDx = $candidate->getLatestDiagnosis();

    // $latestDx is formatted as JSON and ensures that this is safe. 
    // If we use the safe wrapper, HTML encoding the quotation marks 
    // will make it invalid JSON.
    $DB->unsafeUpdate(
        'candidate',
        ['LatestDiagnosis' => $latestDx],
        ['CandID' => $candID]
    );
}