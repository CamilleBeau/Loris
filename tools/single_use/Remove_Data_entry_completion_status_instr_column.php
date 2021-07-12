<?php
/**
 * This script is written for a one time use only to iterate through
 * instruments and generate a patch to remove the Data_entry_completion_status
 * field from instrument tables. To be run after
 * Set_Required_elements_completed_flag.php.php
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Loris
 * @author   Camille Beaudoin <camille.beaudoin@mcin.ca>
 * @licence  Loris license
 * @link     https://github.com/aces/Loris
 */
require_once __DIR__ . '/../generic_includes.php';

echo "\n*** Remove Data_entry_completion_satus from instrument tables***

This script will generate a patch to drop Data_entry_completion_status 
in every instrument table found in the database. Data_entry_completion_status 
is renamed to Required_elements_completed, and will be found in the flag table 
as it's own column.

##### NOTICE: #####

This script is meant to be run after Set_Required_elements_completed_flag.php
If you have not yet run php Set_Required_elements_completed_flag.php, make sure 
that you do not run the patches generated by this script. Running the patches 
generated from this script without running Set_Required_elements_completed_flag.php 
will result in a loss of data.
\n";

echo "Getting instrument list...\n";
$DB = \Database::singleton();

// Get instrument names
$instruments = [];
foreach (\Utility::getAllInstruments() as $testname => $fullName) {
    // Instantiate instrument
    try {
        $instr = \NDB_BVL_Instrument::factory($testname, '', '');
    } catch (Exception $e) {
        echo "$testname does not seem to be a valid instrument.\n";
        continue;
    }

    if (!$instr->usesJSONData()) {
        $table = $instr->table;
        if (!$table) {
            echo "\n\nERROR: The table name for instrument ".
                "$testname cannot be found.\n";
            continue;
        } else if (!$DB->tableExists($table)) {
            echo "Table $table for instrument $testname does not ".
                "exist in the Database.\n";
            continue;
        } else {
            $instruments[] = $table;
        }
    }
}

$dropColumnPatch = "";

// Generate drop column statement for each instrument
foreach ($instruments as $instrument) {
    echo "Generating patch for $instrument...\n";

    $dropColumnPatch = $dropColumnPatch .
        "-- Drop Data_entry_completion_status for $instrument\n".
        "ALTER TABLE $instrument \n".
        "\tDROP COLUMN Data_entry_completion_status;\n\n";
}

// Write to patch
$filename = __DIR__ .
    "/../../SQL/Archive/autogenerated/single_use".
    "/Remove_Data_entry_completion_status.sql";
$fp       = fopen($filename, "w");
fwrite($fp, $dropColumnPatch);
fclose($fp);

print_r(
    "\nComplete. See ". __DIR__ .
    "/../../SQL/Archive/autogenerated/single_use".
    "/Remove_Data_entry_completion_status.sql ".
    "for patch.\n"
);
