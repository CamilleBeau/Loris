<?php
/**
 * This script updates each candidate's latest diagnosis based on the
 * confidured diagnosis evolution trajectory.
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

// get configured diagnosis trajectories in DESC order by project
$diagnosisTrajectories = $DB->pselect(
    "SELECT * FROM diagnosis_evolution
    ORDER BY orderNumber DESC",
    []
);

// if no diagnosis trajectories are defined, return null
if (is_null($diagnosisTrajectories)) {
    echo "There are no configured Diagnosis Trajectories. Nothing to update.\n";
    exit;
}

// Format trajectories by project
$diagnosisTrajectoryByProject = [];
foreach ($diagnosisTrajectories as $key => $data) {
    $diagnosisTrajectoryByProject[$data['ProjectID']][] = $data;
}

$loris = new \LORIS\LorisInstance(
    \NDB_Factory::singleton()->database(),
    \NDB_Factory::singleton()->config(),
    [
        "project/modules",
        "modules",
    ]
);

foreach ($candIDs as $k => $candID) {
    $candidate       = \Candidate::singleton(new CandID($candID));
    $candidateVisits = $candidate->getListOfVisitLabels();

    foreach ($diagnosisTrajectoryByProject as $projectID => $projectTrajectories) {
        foreach ($projectTrajectories as $key => $data) {
            // search if candidate has a matching visit
            $sessionID = array_search(
                $data['visitLabel'],
                array_reverse($candidateVisits, true)
            );
            if ($sessionID) {
                $matchingVL = $candidateVisits[$sessionID];

                // Find instance of instrument
                // TODO: Decide if we should check for COMPLETE instruments only
                $commentID = $DB->pselectOne(
                    "SELECT CommentID FROM flag f
                    WHERE f.SessionID=:sid
                    AND f.Test_name=:tn
                    AND CommentID NOT LIKE 'DDE%'",
                    [
                        'sid' => $sessionID,
                        'tn'  => $data['instrumentName'],
                    ]
                );

                // If instrument does not exist, go to next diagnosis track
                if (!$commentID) {
                    continue;
                }

                // get instrument instance data
                $instrument     = \NDB_BVL_Instrument::factory(
                    $loris,
                    $data['instrumentName'],
                    $commentID
                );
                $instrumentData = $instrument->getInstanceData();


                $latestDiagnosis = [];
                $sourceFields    = explode(",", $data['sourceField']);
                foreach ($sourceFields as $k => $fieldName) {
                    // None of the diagnosis components should be empty
                    if (!isset($instrumentData[$fieldName])) {
                        continue 2;
                    }
                    $latestDiagnosis[$fieldName] = $instrumentData[$fieldName];
                }

                $set = [
                    'CandID'          => $candID,
                    'ProjectID'       => $projectID,
                    'DxEvolutionID'   => $data['DxEvolutionID'],
                    'LatestDiagnosis' => json_encode($latestDiagnosis)
                ];

                print_r("\nUpdating Latest Diagnosis for CandID: $candID\n");
                print_r("\t" . json_encode($latestDiagnosis) . "\n");

                $DB->unsafeInsertOnDuplicateUpdate(
                    'candidate_latest_diagnosis',
                    $set
                );
                // Go to next candidate
                break;
            }
        }
    }
}