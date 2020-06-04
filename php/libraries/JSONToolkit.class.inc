<?php
/**
 * File implements the JSONToolkit class
 *
 * PHP Version 7
 *
 * @category Main
 * @package  Behavioural
 * @author   Camille Beaudoin <camille.beaudoin@mcin.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */
namespace LORIS;

/**
 * JSON data toolkit class.
 *
 * This class provides a toolkit for accessing and manipulating
 * JSON instrument data.
 *
 * PHP version 7
 *
 * @category Behavioural
 * @package  Main
 * @author   Camille Beaudoin <camille.beaudoin@mcin.ca>
 * @license  GPLv3 <http://www.gnu.org/licenses/gpl-3.0.en.html>
 * @link     https://www.github.com/aces/Loris-Trunk/
 */

class JSONToolkit
{
    // TODO: Add checks for if fields don't exist / messages for when wrong inputs
    // TODO: Check if other option than unsafeupdate w/out escaped char


    var $instrName;
    var $flagData;

    /**
     * JSONToolkit constructor.
     *
     * @param string $instrumentName Name of instrument whos data to manipulate
     * @throws \LorisException
     */
    function __construct(string $instrumentName)
    {
        $db = \Database::singleton();

        $instrCheck = $db->pselect(
            "SELECT Test_name FROM test_battery WHERE Test_name=:tbln",
            array("tbln" => $instrumentName)
        );
        if (empty($instrCheck)) {
            throw new Exception("The instrument ". $instrumentName . "was not found in the database.");
        }

        $queryData = $db->pselectWithIndexKey(
            "SELECT CommentID, Data FROM flag WHERE Test_name =:tbln",
            array("tbln" => $instrumentName),
            'CommentID'
        );

        $this->instrName = $instrumentName;
        $this->flagData = $queryData;
    }

    /**
     * Select list of CommentIDs where a field has certain value
     *
     * @param string $field     Name of field to look for specific value
     * @param string $val       Value to look for for the given field
     *
     * @return array            List of commentIDs
     */
    public function select($field, $val)
    {
        $cmids = array();
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (isset($instrData[$field]) && $instrData[$field] === $val) {
                $cmids[] = $cmid;
            }
        }
        return $cmids;
    }

    /**
     * Select value of a field where a field has specific value
     * (Select value of $selected where $field has $val)
     *
     * @param string $selected      Name of field to return values of
     * @param string $field         Name of field to check value of
     *                              (can be the same as $selected)
     * @param string $val           Value of $field to check before
     *                              returning value of $selected
     *
     * @return array                Array of values for $selected
     *                              CommentID as key
     */
    public function selectField($selected, $field, $val)
    {
        $results = array();
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (isset($instrData[$selected])
                && isset($instrData[$field])
                && $instrData[$field] === $val
            ) {
                $results[$cmid] = $instrData[$selected];
            }
        }
        return $results;
    }

    /**
     * Renames field of instrument
     *
     * @param string $oldName   Name of field to rename
     * @param string $newName   What the field will be renamed as
     *
     * @return int              Return number of fields altered
     */
    public function rename(string $oldName, string $newName)
    {
        $dataAltered = 0;
        foreach ($this->flagData as $cmid => $data) {
            // Continue if data is empty
            if (empty($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            // Do not rename if there is already field with $newName
            if (isset($instrData[$newName])) {
                continue;
            }

            if (isset($instrData[$oldName])) {

                $value = $instrData[$oldName];

                // replace old field name with new field name
                $fieldNames = array_keys($instrData);
                $fieldNames[array_search($oldName, $fieldNames)] = $newName;
                $instrData = array_combine($fieldNames, $instrData);
                $renamedData = json_encode($instrData);

                // Update flagData variable
                $this->flagData[$cmid]['Data'] = $renamedData;

                // Update database
                $db = \Database::singleton();
                $db->unsafeupdate(
                    "flag",
                    array("Data" => $renamedData),
                    array("CommentID" => $cmid)
                );
                $dataAltered++;
            }
        }
        return $dataAltered;
    }

    /**
     * Drop field from instrument data
     *
     * @param string $field     Name of field to be dropped
     *
     * @return int              Return number of fields altered
     */
    public function drop(string $field)
    {
        $dataAltered = 0;

        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (isset($instrData[$field])) {

                // Remove field
                unset($instrData[$field]);
                $newData = json_encode($instrData);

                // Update flagData variable
                $this->flagdata[$cmid]['Data'] = $newData;

                // Update database
                $db = \Database::singleton();
                $db->unsafeupdate(
                    "flag",
                    array("Data" => $newData),
                    array("CommentID" => $cmid)
                );
                $dataAltered++;
            }
        }
        return $dataAltered;
    }

    /**
     * Alter value of a field
     * (Alter value of $field to $newVal if the
     * $conditionalField has value $conditionalValue)
     *
     * @param string $field             The name of field whos data will be changed.
     * @param string $newVal            The value that the field will be changed to.
     * @param string $conditionalField  The name of field to check the value of.
     *                                  Modification is conditional on this field.
     * @param string $conditionalVal    Value to check whether the $conditionalField has,
     *                                  and have the modification be conditional of.
     *
     * @return int                      Return number of fields altered
     */
    public function modify($field, $newVal, $conditionalField, $conditionalVal)
    {
        $dataAltered = 0;
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (key_exists($field, $instrData)
                && key_exists($conditionalField, $instrData)
                && $instrData[$conditionalField] === $conditionalVal
            ) {

                // set new value (check if null)
                $instrData[$field] = $newVal === 'null' ? null : $newVal;

                if ($this->validate($instrData, $cmid)) {

                    $newData = json_encode($instrData);

                    // Update flagData variable
                    $this->flagdata[$cmid]['Data'] = $newData;

                    // Update database
                    $db = \Database::singleton();
                    $db->unsafeupdate(
                        "flag",
                        array("Data" => $newData),
                        array("CommentID" => $cmid)
                    );
                    $dataAltered++;
                } else {
                    // TODO: error that value is not allowed
                }
            }
        }
        return $dataAltered;
    }

    /**
     * Alter value of a field using given operation
     *
     * @param function $fn                  Function containing the operation to be done
     *                                      on the specified field
     * @param string $field                 The name of the field to modify
     * @param string|null $conditionalField The field to check the value of, and have the
     *                                      modification be conditional of
     * @param string|null $conditionalVal   Value to check whether the $conditionalField has,
     *                                      and have the modification be conditional of
     *
     * @return int                          Return number of fields altered
     */
    public function customModify(
        $fn,
        string $field,
        ?string $conditionalField = null,
        ?string $conditionalVal = null
    ) {
        $alteredData = 0;
        foreach ($this->flagData as $cmid => $data) {
            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (key_exists($field, $instrData)) {

                // If conditionals are given, only alter data if the
                // conditional field has conditional value
                if (isset($conditionalField)
                    && isset($conditionalVal)
                ) {
                    if($instrData[$conditionalField] !== $conditionalVal) {
                    continue;
                    }
                }

                // set new value
                $instrData[$field] = $fn($instrData[$field]);

                $newData = json_encode($instrData);

                if ($this->validate($newData, $cmid)) {

                    // Update flagData variable
                    $this->flagdata[$cmid]['Data'] = $newData;

                    // Update database
                    $db = \Database::singleton();
                    $db->unsafeupdate(
                        "flag",
                        array("Data" => $newData),
                        array("CommentID" => $cmid)
                    );
                    $alteredData++;
                } else {
                    // TODO: error that value is not allowed
                }
            }
        }
        return $alteredData;
    }


    /**
     * Check if there is a status field in
     * an instrument's data for a given fieldname
     * (e.g. $field "name" given: search for "name_status")
     *
     * @param string $field     Name of the field to check for relative status field
     *
     * @return bool             Return true if status field found
     */
    public function checkStatusField($field)
    {
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            // Check for status field
            if (isset($instrData[$field . "_status"])) {
                return true;
            }
        }
        // return false if no status field found
        return false;
    }

    /**
     * Make sure fields are of the correct data type
     *
     * @param $data
     * @param $cmid
     * @return bool
     */
    function validate($data, $cmid) {
        // TODO: Validate that new data is allowed
        return true;
    }
}
