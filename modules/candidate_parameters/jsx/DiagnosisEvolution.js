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
   *
   * @return {array}
   */
  formattedDiagnosisEvolution() {
    const dxEvolution = this.state.data.diagnosisEvolution;
    let formattedDxEvolution = [];
    dxEvolution.map((entry, index) => {
      formattedDxEvolution.push(
        [
          entry.name,
          entry.diagnosis,
        ]
      );
    });
    console.log(formattedDxEvolution);
    return formattedDxEvolution;
  }

  /**
   * Render latest diagnosis element
   * @return {JSX} - React markup for the component
   */
  renderLatestDiagnosis() {
    const dx = this.state.data.diagnosisEvolution;
    const latestDx = dx[dx.length-1];
    const diagnosis = latestDx.diagnosis;

    return (
      <StaticElement
        label={<h4>Latest Diagnosis</h4>}
        text={diagnosis}
      />
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
        return <Loader/>;
    }

    console.log(this.state.data.diagnosisEvolution);

    return (
      <div className='row'>
        <FormElement
          name='diagnosisEvolution'
          onSubmit={this.handleSubmit}
          ref='form'
          class='col-md-6'
        >
          <StaticElement
            label='PSCID'
            text={this.state.data.pscid}
          />
          <StaticElement
            label='DCCID'
            text={this.state.data.candID}
          />
          {this.renderLatestDiagnosis()}
          <br></br>
          <h3>Diagnosis Evolution</h3>
          <StaticDataTable
            Headers={[
              'Trajectory Name',
              'Diagnosis',
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
