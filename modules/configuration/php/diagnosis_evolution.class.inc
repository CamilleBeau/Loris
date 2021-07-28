<?php
/**
 * The configuration module is used to manage the configuration of Loris.
 *
 * PHP version 7
 *
 * @category Behavioural
 * @package  Main
 * @author   Jessica Callegaro <jessica.callegaro@mcin.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris-Trunk
 */

namespace LORIS\configuration;

/**
 * Admin_Config Class
 *
 * This class is to configure the system settings
 *
 * @category Behavioural
 * @package  Main
 * @author   Jessica Callegaro <jessica.callegaro@mcin.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris-Trunk
 */
class Diagnosis_Evolution extends \NDB_Form
{
    /**
     * _has_access returns true
     * if the user has the specific permission
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        return $user->hasPermission('config');
    }


    /**
     * Loads the project page.
     *
     * @return void
     */
    function setup()
    {
        parent::setup();
        $DB      = \Database::singleton();

        $visits      = \Utility::getVisitList();
        $instruments = \Utility::getAllInstruments();

        $parameterType = $DB->pselect(
            "SELECT Name, SourceField FROM parameter_type
            WHERE Queryable='1'
            ORDER BY Name",
            []
        );

        foreach ($parameterType as $key => $record) {
            $sourceFields[$record['Name']] = $record['SourceField'];
        }
        
        $diagnosisTracks = $DB->pselectWithIndexKey(
            "SELECT * FROM diagnosis_evolution
            ORDER BY orderNumber",
            [],
            'DxEvolutionID'
        );

        $this->tpl_data['visits']           = $visits;
        $this->tpl_data['instruments']      = $instruments;
        $this->tpl_data['sourceFields']     = $sourceFields;
        $this->tpl_data['diagnosisTracks']  = $diagnosisTracks;
    }

    /**
     * Include additional CSS files:
     *  1. configuration
     *
     * @return array of CSS to be inserted
     */
    function getCSSDependencies()
    {
        $factory = \NDB_Factory::singleton();
        $baseURL = $factory->settings()->getBaseURL();
        $deps    = parent::getCSSDependencies();
        return array_merge(
            $deps,
            [$baseURL . "/configuration/css/configuration.css"]
        );
    }
}