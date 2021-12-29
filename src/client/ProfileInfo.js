import React, {Component} from 'react';
import update from 'immutability-helper';
import { Label, Menu, Table, Button, Icon, Header, Image, Modal, Input, Form  } from 'semantic-ui-react';
import randomLocation from 'random-location';

import axios from './utils/axios';

// import './App.css';
// import logo from './assets/images/logo.png';

axios.defaults.headers.Authorization = 'Bearer ' + window.localStorage.getItem('jwt');


class ProfileInfo extends Component {
  constructor(props) {
    super(props);

    let userInfo = { followingLength: 0, followersLength: 0 };
    if (props.userId != null) {
      userInfo = props.userList.find(u => u._id == props.userId);
      // clone the user object, otherwise we are using a ref to the original object.
      // this is slow, only used on small object.
      userInfo = JSON.parse(JSON.stringify(userInfo)); 
    }

    // LATITUDE -90 to +90, LONGITUDE -180 to + 180
    this.geoLocation = {longitude: 0, longitude: 0};
    if (props.userId == null) { // create new user
      this.geoLocation = randomLocation.randomCirclePoint({latitude: 0, longitude: 0}, 6371 * 1000); // 6371 km is the radius of Earth (assuming it's an absolute sphere)
    }

    this.state = {
      userInfo: userInfo,
      errFieldId: null,
      errMessage: '',
    }
  }

  onFieldChange = evt => {
    // console.log('on field change: ', evt.target.dataset.fieldid, '//', evt.target.value);
    let field = evt.target.dataset.fieldid;
    let userInfo = update(this.state.userInfo, {[field]: {$set: evt.target.value}});
    this.setState({ userInfo })
  }

  validationCheck = () => {
    const {name, dob, address, description} = this.state.userInfo;
    if (name == '' || name == null) {
      this.setState({ errFieldId: 'name', errMessage: 'Name cannot be empty'});
      return false;
    }

    if (dob != null && dob != '') {
      // https://stackoverflow.com/questions/30846357/how-to-validate-if-a-string-is-a-valid-date-in-js
      // try using Moment.js to check valid date string.
      if (isNaN( Date.parse(dob) )) {
        this.setState({ errFieldId: 'dob', errMessage: 'Invalid date'});
        return false;
      }
    }

    if (address != null && address.length > 100) {
      this.setState({ errFieldId: 'address', errMessage: 'Exceeded maximum 200 characters'});
      return false;
    }

    if (description != null && description.length > 100) {
      this.setState({ errFieldId: 'description', errMessage: 'Exceeded maximum 200 characters'});
      return false;
    }

    this.setState({ errFieldId: null, errMessage: ''})
    return true;
  }


  onSaveChange = () => {
    if (!this.validationCheck()) {
      return
    }

    if (this.props.userId == null) { // create new user
      axios.post('/API_demo/api/user', this.state.userInfo)
        .then(res => {
          console.log('res from creating new user: ', res);
          this.props.onSaveChange( res.data );
          this.props.toggleModal()
        })
        .catch(err => {
          console.log('err creating user: ', err)
        })
    } else { // edit existing user
      axios.put('/API_demo/api/user', this.state.userInfo)
        .then(res => {
          console.log('res from editing user: ', res);
          this.props.onSaveChange( res.data );
          this.props.toggleModal()
        })
        .catch(err => {
          console.log('err editing user: ', err)
        })
    }
  }

  componentDidMount = () => {
    if (this.props.userId == null) {
      let userInfo = update(this.state.userInfo, {geolocation: {$set: this.geoLocation}})
      this.setState({ userInfo })
    }
  }

  render() {
    let p = this.props;
    let userInfo = this.state.userInfo;
    let {errFieldId, errMessage} = this.state;
    return (
        <div className="modal-wrapper">
            <Modal
              onClose={() => { } }
              onOpen={() => { } }
              open={p.open}
            >
              <Modal.Header>{`${p.userId == null ? 'Add new' : 'Edit'}`} user</Modal.Header>
              <Modal.Content image>
                <Modal.Description>
                  <Form>
                    <Form.Field>
                      <div style={{display: 'flex'}}><label>Name</label>{ errFieldId == 'name' ? <span style={{color: 'red'}}> ({errMessage}</span> : null } </div>
                      <input data-fieldid='name' value={userInfo.name || ''} onChange={this.onFieldChange} />
                    </Form.Field>

                    <Form.Field>
                      <div style={{display: 'flex'}}><label>Date of birth</label>{ errFieldId == 'dob' ? <span style={{color: 'red'}}> ({errMessage}</span> : null }</div> 
                      <input data-fieldid='dob' value={userInfo.dob || ''} onChange={this.onFieldChange} />
                    </Form.Field>

                    <Form.Field>
                      <div style={{display: 'flex'}}><label>Address (ramdonly generated) { p.userId == null ? `lat(${this.geoLocation.latitude}), long(${this.geoLocation.longitude})` : `lat(${userInfo.geolocation.latitude}), long(${userInfo.geolocation.longitude})` })</label>
                      { errFieldId == 'address' ? <span style={{color: 'red'}}> ({errMessage}</span> : null }</div>
                      <input data-fieldid='address' onChange={this.onFieldChange} value={userInfo.address || ''} />
                    </Form.Field>

                    <Form.Field>
                      <div style={{display: 'flex'}}><label>Description</label>{ errFieldId == 'description' ? <span style={{color: 'red'}}> ({errMessage}</span> : null }</div>
                      <input data-fieldid='description' value={userInfo.description || ''} onChange={this.onFieldChange} />
                    </Form.Field>
                  </Form>

                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button color='black' onClick={ this.props.toggleModal }>Cancel</Button>
                <Button
                  content="OK"
                  labelPosition='right'
                  icon='checkmark'
                  onClick={ this.onSaveChange }
                  positive
                />
              </Modal.Actions>
            </Modal>

        </div>
      )
  }
}

export default ProfileInfo;
/*
const mapStateToProps = state => ({
  profile: state.profile,
  sites: state.sites,
  projects: state.projects,
  CRAs: state.CRAs,
});
const mapDispatchToProps = dispatch => bindActionCreators({ initializeProfile, initializeAllCRAs, initializeAllProjects, initializeAllSites }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(App);
*/
