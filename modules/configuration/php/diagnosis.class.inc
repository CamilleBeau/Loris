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
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Message\ResponseInterface;

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
class Diagnosis extends \NDB_Page
{
    public $skipTemplate = true;

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
     * This function will return a json object for diagnosis evolution.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        // Ensure GET or POST request.
        switch ($request->getMethod()) {
        case 'GET':
            return $this->_handleGET($request);
            break;
        case 'POST':
            return $this->_handlePOST($request);
            break;
        default:
            return new \LORIS\Http\Response\JSON\MethodNotAllowed(
                $this->allowedMethods()
            );
        }

    }

    /**
     * Initialize setup of the login module.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request.
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    private function _handleGET(ServerRequestInterface $request) : ResponseInterface
    {
        $response = $this->initializeSetup();
        return new \LORIS\Http\Response\JsonResponse(
            $response
        );
    }

        /**
     * Processes the values & saves to database and return a json response.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request.
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    private function _handlePOST(ServerRequestInterface $request) : ResponseInterface
    {
        $this->updateDiagnosisTrajectory($request);
        return new \LORIS\Http\Response\JsonResponse(
            []
        );
    }

    /**
     * Loads the project page.
     *
     * @return array
     */
    function initializeSetup() : array
    {
        $DB = \Database::singleton();

        $projects    = \Utility::getProjectList();
        $visits      = \Utility::getVisitList();
        $instruments = \Utility::getAllInstruments();

        $parameterType = $DB->pselect(
            "SELECT Name FROM parameter_type
            WHERE Queryable='1'
            ORDER BY Name",
            []
        );

        foreach ($parameterType as $key => $record) {
            $sourceFields[$record['Name']] = $record['Name'];
        }

        $diagnosisTracks = $DB->pselectWithIndexKey(
            "SELECT * FROM diagnosis_evolution
            ORDER BY orderNumber",
            [],
            'DxEvolutionID'
        );

        foreach ($diagnosisTracks as $key => $data) {
            $diagnosisTracks[$key]['sourceField'] = 
                explode(",", $diagnosisTracks[$key]['sourceField']);
        }

        $values['projects']        = $projects;
        $values['visits']          = $visits;
        $values['instruments']     = $instruments;
        $values['sourceFields']    = $sourceFields;
        $values['diagnosisTracks'] = $diagnosisTracks;

        return $values;
    }

    /**
     * Processes trajectory data submitted via diagnosis evolution form.
     *
     * @param ServerRequestInterface $request The incoming PSR7 request.
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    function updateDiagnosisTrajectory(ServerRequestInterface $request) : ResponseInterface
    {
        // Parse POST request body.
        $values = json_decode((string) $request->getBody(), true) ?? ['hello'];

        // TODO: finish implementation
        error_log(print_r($values, true));
    }

    /**
     * Return an array of valid HTTP methods for this endpoint
     *
     * @return string[] Valid versions
     */
    protected function allowedMethods(): array
    {
        return [
            'GET',
            'POST',
        ];
    }
}