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
            currentTab: 'new',
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
        const tabID = this.state.currentTab;
        let formData = this.state.formData;

        if (tabID == 'new') {
            let tabData = {
                ...formData.new,
                [formElement]: value,
            };
            formData.new = tabData;
        } else {
            let tabData = {
                ...formData.diagnosisTracks[tabID],
                [formElement]: value,
            };
            formData.diagnosisTracks[tabID] = tabData;
        }

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
        console.log(this.state.formData);
        const id = typeof dxEvolutionID !== 'undefined' ?
            dxEvolutionID : this.state.currentTab;
        const trajectoryData = id == 'new' ?
            this.state.formData.new :
            this.state.formData.diagnosisTracks[id];

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
                                name='Name'
                                label='Trajectory Name'
                                onUserInput={this.setFormData}
                                value={trajectoryData.Name}
                                required={true}
                            />
                            <SearchableDropdown
                                name='ProjectID'
                                label='Project'
                                options={this.state.formData.projects}
                                onUserInput={this.setFormData}
                                value={trajectoryData.ProjectID}
                                required={true}
                            />
                            <SearchableDropdown
                                name='visitLabel'
                                label='Visit'
                                options={this.state.formData.visits}
                                onUserInput={this.setFormData}
                                value={trajectoryData.visitLabel}
                                required={true}
                            />
                            <SearchableDropdown
                                name='instrumentName'
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
                                items={trajectoryData.sourceField || []}
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
                    onTabChange={(tabId) => this.setState({currentTab: tabId})}
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
        console.log('submit');

        const tabID = this.state.currentTab;
        let formData = tabID == 'new' ?
            this.state.formData.new :
            this.state.formData.diagnosisTracks[tabID];
        console.log(formData);
        let formObject = new FormData();
        for (let key in formData) {
            console.log(key);
            if (formData[key] !== '') {
                formObject.append(key, formData[key]);
            }
        }
        formObject.append('fire_away', 'Diagnosis Trajectory');
        console.log(formObject);
        fetch(this.props.submitURL, {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'same-origin',
            body: formObject,
        }).then((resp) => {
            if (resp.ok && resp.status === 201) {
                resp.json().then((data) => console.log(data));
            } else {
                resp.json().then((message) => console.log(message));
            }
        }).catch((error) => {
            console.log(error);
        });
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
        const tabID = this.state.currentTab;
        let formData = this.state.formData;

        if (tabID == 'new') {
            let listItems = formData.new[formElement] || [];
            listItems.push(value);
            formData.new[formElement] = listItems;
            formData.new[pendingValKey] = null;
        } else {
            let listItems =
                formData.diagnosisTracks[tabID][formElement] || [];
            console.log(listItems);
            listItems.push(value);
            formData.diagnosisTracks[tabID][formElement] = listItems;
            formData.diagnosisTracks[tabID][pendingValKey] = null;
        }
        this.setState({formData: formData});
    }

    /**
     * Add source field
     * @param {*} formElement
     * @param {string} value
     * @param {*} pendingValKey
     */
    removeSourceField(formElement, value) {
        const tabID = this.state.currentTab;
        let formData = this.state.formData;

        if (tabID == 'new') {
            let listItems = formData.new[formElement];
            let index = listItems.indexOf(value);
            if (index > -1) {
                listItems.splice(index, 1);
            }
            formData.new[formElement] = listItems;
        } else {
            let listItems =
                formData.diagnosisTracks[tabID][formElement];
            let index = listItems.indexOf(value);
            if (index > -1) {
                listItems.splice(index, 1);
            }
            formData.diagnosisTracks[tabID][formElement] = listItems;
        }
        this.setState({formData: formData});
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
            submitURL={`${loris.BaseURL}/configuration/diagnosis`}
        />,
        document.getElementById('lorisworkspace')
    );
});
