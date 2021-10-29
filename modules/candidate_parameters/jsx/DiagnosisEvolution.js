import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Loader from 'Loader';
import StaticDataTable from 'jsx/StaticDataTable';

/**
 * Candidate date of birth component
 */
class DiagnosisEvolution extends Component {
  /**
   * @constructor
   * @param {object} props - React Component properties
   */
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      formData: {},
      error: false,
      isLoaded: false,
    };

    this.fetchData = this.fetchData.bind(this);
    this.setFormData = this.setFormData.bind(this);
    this.formattedDiagnosisEvolution =
    this.formattedDiagnosisEvolution.bind(this);
    this.renderLatestDiagnosis =
    this.renderLatestDiagnosis.bind(this);
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
      .then((data) => this.setState({data: data, formData: data}))
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
   * @return {array}
   */
  formattedDiagnosisEvolution() {
    const dxEvolution = this.state.data.diagnosisEvolution;
    let formattedDxEvolution = [];
    dxEvolution.map((record) => {
      let formattedDiagnosis = [];
      Object.entries(JSON.parse(record.Diagnosis)).map((entry) => {
        const [fieldName, dx] = entry;
        formattedDiagnosis.push(<p>{fieldName}: <strong>{dx}</strong></p>);
      });
      const confirmed = record.Confirmed === 'Y' ?
        <p style={{color: 'green', fontSize: '3rem', textAlign: 'center'}}>
          &#10004;
        </p> :
        <p style={{color: 'red', fontSize: '3rem', textAlign: 'center'}}>
          &#10007;
        </p>;
      formattedDxEvolution.push(
        [
          record.TrajectoryName,
          record.Project,
          record.OrderNumber,
          record.visitLabel,
          record.instrumentName,
          record.sourceField,
          formattedDiagnosis,
          confirmed,
          record.LastUpdate,
        ]
      );
    });
    return formattedDxEvolution;
  }

  /**
   * Render latest diagnosis element
   * @param {*} latestDiagnosis
   * @return {JSX} - React markup for the component
   */
  renderLatestDiagnosis(latestDiagnosis) {
    let element = [];

    latestDiagnosis.map((entry) => {
      const projectName = this.state.data.projects[entry.ProjectID];
      let diagnosis = [];
      Object.entries(JSON.parse(entry.Diagnosis)).map((entry) => {
        const [fieldName, dx] = entry;
        diagnosis.push(
          <StaticElement
            key={fieldName}
            label={fieldName}
            text={dx}
          />
        );
      });

      element.push(
        <FieldsetElement
          key={entry.DxEvolutionID}
          legend={<h5>{projectName} - {entry.Name}</h5>}
          class='col-md-6'
        >
          {diagnosis}
        </FieldsetElement>
      );
    });
    return element;
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
        return <Loader/>;
    }
    console.log(this.state.formData);

    const latestDiagnosis = this.state.data.latestProjectDiagnosis.length > 0 ?
      <div className='col-md-10'>
        <h3>Latest Diagnosis</h3>
        <p>This diagnosis is <strong style={{color: 'red'}}>
          unconfirmed</strong>.
          A confirmed diagnosis is one that belongs to an approved visit.
        </p>
        {this.renderLatestDiagnosis(this.state.data.latestProjectDiagnosis)}
      </div>
      : null;
    const latestConfirmedDiagnosis =
      this.state.data.latestConfirmedProjectDiagnosis.length > 0 ?
        <div className='col-md-10'>
          <h3>Latest Confirmed Diagnosis</h3>
          <p>This diagnosis is <strong style={{color: 'green'}}>
            confirmed</strong>.
            A confirmed diagnosis is one that belongs to an approved visit.
          </p>
          {this.renderLatestDiagnosis(
            this.state.data.latestConfirmedProjectDiagnosis
          )}
        </div>
        : null;

    return (
      <div className='row'>
        <FormElement
          name='diagnosisEvolution'
          onSubmit={this.handleSubmit}
          ref='form'
          class='col-md-12'
        >
          <StaticElement
            label='PSCID'
            text={this.state.data.pscid}
          />
          <StaticElement
            label='DCCID'
            text={this.state.data.candID}
          />
          {latestDiagnosis}
          {latestConfirmedDiagnosis}
          <h3>Diagnosis Evolution</h3>
          <StaticDataTable
            Headers={[
              'Trajectory Name',
              'Project',
              'Configuration Order',
              'Visit',
              'Instrument',
              'Source Field',
              'Diagnosis',
              'Confirmed',
              'Last Update',
            ]}
            Data={this.formattedDiagnosisEvolution()}
            Hide={{rowsPerPage: true, downloadCSV: true}}
          />
        </FormElement>
      </div>
    );
  }
}
DiagnosisEvolution.propTypes = {
  dataURL: PropTypes.string,
  tabName: PropTypes.string,
};
export default DiagnosisEvolution;
