import React, {Component} from 'react';
import {TabPane, VerticalTabs} from 'Tabs';
import PropTypes from 'prop-types';
import Loader from 'Loader';
import '../css/configuration.css';

/**
 * Candidate date of death component
 */
class DiagnosisEvolution extends Component {
    /**
     * @constructor
     * @param {object} props - React Component properties
     */
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            formData: {
                new: {
                    DxEvolutionID: 'new',
                    Name: null,
                    ProjectID: null,
                    instrumentName: null,
                    sourceField: null,
                    visitLabel: null,
                    pendingSourceField: null,
                },
            },
            error: false,
            isLoaded: false,
        };

        this.fetchData = this.fetchData.bind(this);
        this.setFormData = this.setFormData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addSourceField = this.addSourceField.bind(this);
        this.removeSourceField = this.removeSourceField.bind(this);
    }

    /**
     * Called by React when the component has been rendered on the page.
     */
    componentDidMount() {
        console.log('mounting');
        this.fetchData()
            .then(() => this.setState({isLoaded: true}));
    }

    /**
     * Fetch data
     * @return {Promise<void>}
     */
    fetchData() {
        return fetch(this.props.dataURL, {credentials: 'same-origin'})
            .then((resp) => resp.json())
            .then((data) => this.setState({
                formData: {
                    ...this.state.formData,
                    ...data,
                },
            }))
            .catch((error) => {
                this.setState({error: true});
                console.error(error);
            });
    }

    /**
     * Set form data
     * @param {string} formElement
     * @param {*} value
     */
    setFormData(formElement, value) {
        let formData = this.state.formData;
        formData[formElement] = value;
        this.setState({
            formData: formData,
        });
    }

    /**
     * renders the diagnosis trajectory form
     * @param {int} dxEvolutionID
     * @return {JSX} React markup for the component
     */
    renderDiagnosisForm(dxEvolutionID) {
        console.log(dxEvolutionID);
        const trajectoryData = dxEvolutionID == 'new' ?
            this.state.formData.new :
            this.state.formData.diagnosisTracks[dxEvolutionID];
        console.log(trajectoryData);
        return (
            <TabPane TabId={`${dxEvolutionID}`} key={dxEvolutionID}>
                <div className='row'>
                    <h3>Diagnosis Evolution</h3>
                    <br />
                    <FormElement
                        name='diagnosisEvolution'
                        onSubmit={this.handleSubmit}
                        ref='form'
                    >
                        <FieldsetElement
                            legend='Register Trajectory'
                        >
                            <TextboxElement
                                name='name'
                                label='Trajectory Name'
                                onUserInput={this.setFormData}
                                value={trajectoryData.Name}
                                required={true}
                            />
                            <SearchableDropdown
                                name='project'
                                label='Project'
                                options={this.state.formData.projects}
                                onUserInput={this.setFormData}
                                value={trajectoryData.ProjectID}
                                required={true}
                            />
                            <SearchableDropdown
                                name='visit'
                                label='Visit'
                                options={this.state.formData.visits}
                                onUserInput={this.setFormData}
                                value={trajectoryData.visitLabel}
                                required={true}
                            />
                            <SearchableDropdown
                                name='instrument'
                                label='Instrument'
                                options={this.state.formData.instruments}
                                onUserInput={this.setFormData}
                                value={trajectoryData.instrumentName}
                                required={true}
                            />
                            <TagsElement
                                name='sourceField'
                                id={dxEvolutionID}
                                label='Source Field'
                                options={this.state.formData.sourceFields}
                                useSearch={true}
                                strictSearch={true}
                                onUserInput={this.setFormData}
                                value={trajectoryData.pendingSourceField ?
                                    trajectoryData.pendingSourceField :
                                    null}
                                items={trajectoryData.sourceField ?
                                    trajectoryData.sourceField.split(',') :
                                    []}
                                required={true}
                                btnLabel='Add Field'
                                pendingValKey='pendingSourceField'
                                onUserAdd={this.addSourceField}
                                onUserRemove={this.removeSourceField}
                            />
                            <NumericElement
                                name='orderNumber'
                                min={1}
                                max={100}
                                label='Order Number'
                                onUserInput={this.setFormData}
                                value={trajectoryData.orderNumber}
                                required={true}
                            />
                            <div>
                                <ButtonElement
                                    label='Save'
                                    type='submit'
                                    onUserInput={this.handleSubmit}
                                />
                                <ButtonElement
                                    label='Reset'
                                    type='reset'
                                    onUserInput={this.handleReset}
                                />
                            </div>
                        </FieldsetElement>
                    </FormElement>
                </div>
            </TabPane>
        );
    }

    /**
     * Renders the React component.
     *
     * @return {JSX} - React markup for the component
     */
    render() {
        if (this.state.error) {
            return <h3>An error occured while loading the page.</h3>;
        }

        if (!this.state.isLoaded) {
            return <Loader />;
        }

        let tabList = [];
        tabList.push({id: 'new', label: 'New Diagnosis Trajectory'});

        let diagnosisTracks = [];
        console.log(this.state.formData);
        const trajectories = this.state.formData.diagnosisTracks;
        if (trajectories) {
            Object.values(trajectories).map((trajectory) => {
                const dxID = trajectory.DxEvolutionID;
                const dxName = trajectory.Name;
                diagnosisTracks.push(this.renderDiagnosisForm(dxID));
                tabList.push({id: `${dxID}`, label: dxName});
            });
        }

        return (
            <div>
                <p>
                    Use this page to manage the configuration of the study's
                    diagnosis trajectory.
                </p>
                <p>
                    To configure study subprojects
                     <a href="{$baseurl}/configuration/subproject/">
                        click here
                    </a>.
                    To configure study projects
                     <a href="{$baseurl}/configuration/project/">
                        click here
                    </a>.
                </p>
                <VerticalTabs
                    tabs={tabList}
                    defaultTab='new'
                    updateURL={false}
                    onTabChange={(tabId) => console.log(tabId)}
                >
                    {this.state.isLoaded && this.renderDiagnosisForm('new')}
                    {diagnosisTracks}
                </VerticalTabs>
            </div>
        );
    }

    /**
     * Handles form submission
     *
     * @param {event} e - Form submission event
     */
    handleSubmit(e) {
        e.preventDefault();
    }

    /**
     * Handles form reset
     *
     * @param {event} e - Form submission event
     */
    handleReset(e) {

    }

    /**
     * Add source field
     * @param {*} formElement
     * @param {string} value
     * @param {*} pendingValKey
     * @param {*} id
     */
    addSourceField(formElement, value, pendingValKey, id) {
        console.log(id);
        let formData = this.state.formData;
        let listItems = formData[formElement] || [];
        listItems.push(value);
        formData[formElement] = listItems;
        formData[pendingValKey] = null;
        this.setState({
          formData: formData,
        });
    }

    /**
     * Add source field
     * @param {*} formElement
     * @param {string} value
     * @param {*} pendingValKey
     */
    removeSourceField(formElement, value) {
        let formData = this.state.formData;
        let listItems = formData[formElement];
        let index = listItems.indexOf(value);

        if (index > -1) {
          listItems.splice(index, 1);

          formData[formElement] = listItems;
          this.setState({
            formData: formData,
          });
        }
    }
}

DiagnosisEvolution.propTypes = {
  dataURL: PropTypes.string,
  tabName: PropTypes.string,
  action: PropTypes.string,
};

window.addEventListener('load', () => {
    ReactDOM.render(
        <DiagnosisEvolution
            dataURL={`${loris.BaseURL}/configuration/diagnosis`}
            tabName={''}
            action={''}
        />,
        document.getElementById('lorisworkspace')
    );
});
