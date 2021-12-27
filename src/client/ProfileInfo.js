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
      this.geoLocation = randomLocation.randomCirclePoint({latitude: 0, longitude: 0}, 6371 * 1000); // 6371 is the radius of Earth (assuming it's an absolute sphere)
    }

    this.state = {
      userInfo: userInfo,
    }
  }

  onFieldChange = evt => {
    // console.log('on field change: ', evt.target.dataset.fieldid, '//', evt.target.value);
    let field = evt.target.dataset.fieldid;
    let userInfo = update(this.state.userInfo, {[field]: {$set: evt.target.value}});
    this.setState({ userInfo })
  }

  onSaveChange = () => {
    if (this.props.userId == null) { // create new user
      axios.post('/api/user', this.state.userInfo)
        .then(res => {
          console.log('res from creating new user: ', res);
          this.props.onSaveChange( res.data );
          this.props.toggleModal()
        })
        .catch(err => {
          console.log('err creating user: ', err)
        })
    } else { // edit existing user
      axios.put('/api/user', this.state.userInfo)
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
    // console.log("geoLocation: ", this.geoLocation);
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
                      <label>Name</label>
                      <input data-fieldid='name' value={userInfo.name || ''} onChange={this.onFieldChange} />
                    </Form.Field>

                    <Form.Field>
                      <label>Date of birth</label>
                      <input data-fieldid='dob' value={userInfo.dob || ''} onChange={this.onFieldChange} />
                    </Form.Field>

                    <Form.Field>
                      <label>Address (ramdonly generated) { p.userId == null ? `lat(${this.geoLocation.latitude}), long(${this.geoLocation.longitude})` : `lat(${userInfo.geolocation.latitude}), long(${userInfo.geolocation.longitude})` })</label>
                      <input data-fieldid='address' onChange={this.onFieldChange} value={userInfo.address || ''} />
                    </Form.Field>

                    <Form.Field>
                      <label>Description</label>
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