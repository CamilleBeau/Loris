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
    // TODO: Check if other option than unsafeupdate w/out escaped char
    // TODO: Fix all function descriptions
    // TODO: Overview conditionals
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

        $checkInstrument = $db->pselect(
            "SELECT Test_name FROM test_battery WHERE Test_name=:tbln",
            array("tbln" => $instrumentName)
        );
        if (empty($checkInstrument)) {
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
    public function select($conditionArray)
    {
        $cmids = array();

        foreach ($this->flagData as $cmid => $data) {
            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            // Add CommentID if every condition is met
            if($this->checkConditions($instrData, $conditionArray)) {
                $cmids[] = $cmid;
            }
        }
        return $cmids;
    }

    /**
     * Select value of $selected when $field has $val
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
    public function selectField($selected, $conditionArray)
    {
        $results = array();
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            // Continue if field to select does not exist
            if (!key_exists($selected, $instrData)) {
                continue;
            }

            if ($this->checkConditions($instrData, $conditionArray)) {
                $results[$cmid] = $instrData[$selected];
            }
        }
        return $results;
    }

    /**
     * Select data where a field has certain value
     *
     * @param string $field     Name of field to look for specific value
     * @param string $val       Value to look for for the given field
     *
     * @return array            Array of instrument data with CommentID as key
     */
    public function selectAll($conditionArray)
    {
        $result = array();
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if ($this->checkConditions($instrData, $conditionArray)) {
                $result[$cmid] = $instrData;
            }
        }
        return $result;
    }

    /**
     * Renames field of instrument
     *
     * @param string $oldName Name of field to rename
     * @param string $newName What the field will be renamed as
     *
     * @return int              Return number of fields altered
     * @throws \DatabaseException
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
            if (key_exists($newName, $instrData)) {
                continue;
            }

            if (key_exists($oldName, $instrData)) {

                // replace old field name with new field name
                $fieldNames = array_keys($instrData);
                $fieldNames[array_search($oldName, $fieldNames)] = $newName;
                $instrData = array_combine($fieldNames, $instrData);

                $newData = json_encode($instrData);

                // Update flagData variable
                $this->flagData[$cmid]['Data'] = $newData;

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
     * Drop field from instrument data
     *
     * @param string $field Name of field to be dropped
     *
     * @return int              Return number of fields altered
     * @throws \DatabaseException
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

            if (key_exists($field, $instrData)) {

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
     * @param string $field The name of field whos data will be changed.
     * @param string $newVal The value that the field will be changed to.
     * @param string $conditionalField The name of field to check the value of.
     *                                  Modification is conditional on this field.
     * @param string $conditionalVal Value to check whether the $conditionalField has,
     *                                  and have the modification be conditional of.
     *
     * @return int                      Return number of fields altered
     * @throws \DatabaseException
     */
    public function modify($field, $newVal, $conditionArray)
    {
        $dataAltered = 0;
        foreach ($this->flagData as $cmid => $data) {

            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (!key_exists($field, $instrData)) {
                continue;
            }

            if ($this->checkConditions($instrData, $conditionArray)) {
                // set new value (check if null)
                $instrData[$field] = $newVal === 'null' ? null : $newVal;

                $instrument = \NDB_BVL_Instrument::factory($this->instrName, $cmid, '', true);

                if ($this->validate($instrData, $instrument, $field)) {

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
                    throw new \Exception("Operation can not be performed due to a validation error for CommentID $cmid.");
                }
            }
        }
        return $dataAltered;
    }

    /**
     * Alter value of a field using given operation
     *
     * @param callable $fn                  Function containing the operation to be done
     *                                      on the specified field
     * @param string $field The name of the field to modify
     * @param string|null $conditionalField The field to check the value of, and have the
     *                                      modification be conditional of
     * @param string|null $conditionalVal Value to check whether the $conditionalField has,
     *                                      and have the modification be conditional of
     *
     * @return int                          Return number of fields altered
     * @throws \DatabaseException
     */
    public function customModify(
        callable $fn,
        string $field,
        ?array $conditionArray = null
    ) {
        $alteredData = 0;
        foreach ($this->flagData as $cmid => $data) {
            // Continue if data is empty
            if (is_null($data['Data'])) {
                continue;
            }

            // Array of instrument data
            $instrData = json_decode($data['Data'], true);

            if (!key_exists($field, $instrData)) {
                continue;
            }

            // If conditionals are given, only alter data if the
            // conditions are met. Otherwise, continue.
            if (isset($conditionArray) && !$this->checkConditions($instrData, $conditionArray)) {
                // make sure key exists before checking value
                        continue;
            }

            // set new value
            $instrData[$field] = $fn($instrData[$field]);

            $newData = json_encode($instrData);

            $instrument = \NDB_BVL_Instrument::factory($this->instrName, $cmid, '', true);
            if ($this->validate($instrData, $instrument, $field)) {

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
                throw new Exception("Operation can not be performed due to a validation error for CommentID $cmid.");
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
     * Check if there is a status field in
     * an instrument's data for a given fieldname
     * (e.g. $field "name" given: search for "name_status")
     *
     * @param string $field     Name of the field to check for relative status field
     *
     * @return bool             Return true if status field found
     */
    public function checkConditions($data, $conditionArray) {
        $pass = true;

        // Check each condition in array
        foreach($conditionArray as $field => $value) {
            if (!key_exists($field, $data)) {
                // if the field does not exist in the data, condition not met
                $pass = false;
            } elseif ($data[$field] !== $value &&
                !($value === 'null' && empty($data[$field]))
            ) {
                // if the value does not match the data value, condition not met
                // including null option
                $pass = false;
            }
        }
        return $pass;
    }

    // TODO: fix this function description
    /**
     * Make sure fields are of the correct data type
     *
     * @param $data
     * @param $instrument
     * @return bool
     */
    public function validate($data, $instrument, $field) {
        $form = $instrument->form;
        $values = $data;
        // TODO: check for if key exists
        // TODO: Decide what happens if key does not exist
        // TODO: unset instrument_title from $form->form
        unset($form->form['instrument_title']);

        foreach ($form->form as $elName => $el) {
            if ($el['type'] === 'group') {
                // TODO: only look at relevant field
                if (isset($el['required'])) {
                    foreach ($el['required'] as $elementIndex) {
                        $childEl  = $el['elements'][$elementIndex];
                        $childVal = $values[$childEl['name']];
                        if ($childVal === null || $childVal === '') {
                            return false;
                        }
                    }
                }

                if (isset($el['numeric'])) {
                    foreach ($el['numeric'] as $elementIndex) {
                        $childEl = $el['elements'][$elementIndex];
                        if (!is_numeric($values[$childEl['name']])
                            && !empty($values[$childEl['name']])
                        ) {
                            return false;
                        }
                    }
                }
            } else {
                if (!key_exists('name', $el)) {
                    continue;
                } elseif ($el['name'] !== $field) {
                    continue;
                }

                $value = $values[$el['name']];
                if (isset($el['required'])
                    && $el['required'] === true
                    && $value === ""
                ) {
                    return false;
                }

                if (isset($el['compare'])
                    && $value != $values[$el['compare']]
                ) {
                    return false;
                }

                if (isset($el['numeric'])
                    && $el['numeric'] === true
                    && !is_numeric($value)
                    && !empty($value)
                ) {
                    return false;
                }

                if (isset($el['regex'])) {
                    foreach ($el['regex'] as $regex) {
                        if (!empty($value)
                            && !preg_match($regex['match'], $value)
                        ) {
                            return false;
                        }
                    }
                }

                if (isset($el['email'])
                    && $el['email'] === true
                    && !filter_var($value, FILTER_VALIDATE_EMAIL)
                    && !empty($value)
                ) {
                    return false;
                }

                if (isset($el['maxlength'])
                    && strlen(strval($value)) > $el['maxlength']['maxlength']
                ) {
                    return false;
                }

                // Check if date fields have errors and add them to error list
                if ($el['type'] === 'date') {
                    $date = $values[$elName];
                    if (empty($date)) {
                        continue;
                    }
                    $dt          = \DateTime::createFromFormat('Y-m-d', $date);
                    $isValidDate = $dt && $dt->format('Y-m-d') == $date;
                    if (!$isValidDate) {
                        return false;
                    }
                }
            }
        }
        foreach ($form->formRules as $rule) {
            if (is_callable($rule)) {
                $violations = call_user_func($rule, $values);
                if (!empty($violations)) {
                    return false;
                }
            } else if (isset($rule["requiredIf"])) {
                if (!$form->validateRequireIf(
                    $rule["requiredIf"]["elements"],
                    $rule["requiredIf"]["format"]
                )
                ) {
                    return false;
                }
            }
        }
        return true;
    }
}
