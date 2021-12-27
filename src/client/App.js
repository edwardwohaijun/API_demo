import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import update from 'immutability-helper';
import {initializeProfile, initializeAllCRAs, initializeAllProjects, initializeAllSites } from './actions';
import { Label, Menu, Table, Button, Icon, Header, Image, Modal, Input, Form  } from 'semantic-ui-react';

import ProfileInfo from './ProfileInfo';
import FollowingInfo from './FollowingInfo';
import Nearby from './Nearby';

// import logo from './logo.svg';
// import { Route, BrowserRouter, Switch } from "react-router-dom";
import axios from './utils/axios';
import './App.css';

axios.defaults.headers.Authorization = 'Bearer ' + window.localStorage.getItem('jwt');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loading: true,
      userList: [ ],

      // ProfileInfo component is used for both user creation and editing, 
      // this variable's non-null value indicate we are editing, otherwise, we are creating.
      currentUserId: null,

      profileOpen: false,
      followingOpen: false,
      nearbyOpen: false,
    }
  }

  toggleProfileModal = () => {
    if (this.state.profileOpen) { // about to close modal, we need to reset currentUserId to prevent the next open use the old userId
      this.setState({ profileOpen: !this.state.profileOpen, currentUserId: null })
    } else { // about to open modal
      this.setState({ profileOpen: !this.state.profileOpen })
    }
  }

  toggleFolloingModal = () => {
    if (this.state.followingOpen) { // ditto
      this.setState({ followingOpen: !this.state.followingOpen, currentUserId: null })
    } else { // ditto
      this.setState({ followingOpen: !this.state.followingOpen })
    }
  }

  toggleNearby = () => {
    if (this.state.nearbyOpen) { // ditto
      this.setState({ nearbyOpen: !this.state.nearbyOpen, currentUserId: null })
    } else { // ditto
      this.setState({ nearbyOpen: !this.state.nearbyOpen })
    }
  }

  showNearby = evt => {    
    this.setState({ currentUserId: evt.target.dataset.userid }, this.toggleNearby)
  }

  onDeleteUser = evt => {
    alert("not implemented yet")
    // to be implemented
    /*
    let userId = evt.target.dataset.userid
    axios.delete(`/api/user/${userId}`)
      .then(res => {
        console.log('res from deleting user: ', res);
        let userIdx = this.state.userList.findIndex(u => u._id == userId);
        const userList = update(this.state.userList, {$splice: [[ userIdx, 1 ]]});
        console.log('idx of to be deleted: ', userIdx, '///', userList)
        this.setState({ userList })
      })
      .catch(err => {
        console.log('err deleteing user: ', err)
      })
      */
  }

  onEditUser = evt => {
    console.log('on editing user: ', evt.target.dataset.userid);
    this.setState({ currentUserId: evt.target.dataset.userid }, this.toggleProfileModal);
  }
  onEditFollowing = evt => {
    console.log('on editing following of current user: ', evt.target.dataset.userid);
    this.setState({ currentUserId: evt.target.dataset.userid }, this.toggleFolloingModal);
  }

  onSaveChange = (userInfo) => {
    let userIdx = this.state.userList.findIndex(u => u._id == userInfo._id);
    let userList = this.state.userList;
    if (userIdx == -1) { // create new user
      userList = update(userList, {$push: [userInfo]})
    } else { // edit existing user
      userList = update(userList, {[userIdx]: {$set: userInfo}})
    }
    this.setState({ userList })
  }

  onFollow = (userId, followerId) => {
    let userIdx = this.state.userList.findIndex(u => u._id == userId);
    let followerIdx = this.state.userList.findIndex(u => u._id == followerId);
    if (userIdx == -1 || followerIdx == -1) {
      return
    }

    let userList = update(this.state.userList, {[userIdx]: {followingLength: {$set: this.state.userList[userIdx].followingLength + 1 }}})
    userList = update(userList, {[followerIdx]: {followersLength: {$set: this.state.userList[followerIdx].followersLength + 1}} });
    this.setState({ userList })
  }

  onUnfollow = (userId, followerId) => {
    let userIdx = this.state.userList.findIndex(u => u._id == userId);
    let followerIdx = this.state.userList.findIndex(u => u._id == followerId);
    if (userIdx == -1 || followerIdx == -1) {
      return
    }

    let userList = update(this.state.userList, {[userIdx]: {followingLength: {$set: this.state.userList[userIdx].followingLength - 1 }}})
    userList = update(userList, {[followerIdx]: {followersLength: {$set: this.state.userList[followerIdx].followersLength - 1 }}});
    this.setState({ userList })
  }


  componentDidMount = () => {
    axios.get('/api/users')
    .then(res => {
      console.log('get user res: ', res);
      this.setState({ userList: res.data })
    })
    .catch(err => {
      console.log('err getting user: ', err)
    })
  }

  render() {
    // console.log('entries from backend: ', this.props.profile);
    const {currentUserId, profileOpen, followingOpen, nearbyOpen, userList} = this.state;
    let currentUserName = '';
    if (currentUserId != null) {
      currentUserName = userList.find(u => u._id == currentUserId).name;
    }
    return (
        <div className="App">
          <div className='app-header'>app-header</div>
          <div className='app-body' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>

            {!profileOpen ? null : 
              <ProfileInfo userList={userList} userId={currentUserId} open={true} toggleModal={this.toggleProfileModal} onSaveChange={this.onSaveChange} />
            }

            {
              !followingOpen ? null :
              <FollowingInfo userId={currentUserId} name={currentUserName} open={true} toggleModal={this.toggleFolloingModal} onFollow={this.onFollow} onUnfollow={this.onUnfollow} />
            }

            {
              !nearbyOpen ? null :
              <Nearby userId={currentUserId} name={currentUserName} open={true} toggleModal={this.toggleNearby} />
            }

            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>name</Table.HeaderCell>
                  <Table.HeaderCell>Date of Birth</Table.HeaderCell>
                  <Table.HeaderCell>Address</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.HeaderCell>Following</Table.HeaderCell>
                  <Table.HeaderCell>Followers</Table.HeaderCell>
                  <Table.HeaderCell>Action</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {
                  this.state.userList.map(u => {
                    return (
                      <Table.Row key={u._id}>
                        <Table.Cell><span className='username-link' data-userid={u._id} onClick={this.onEditUser}>{u.name}</span></Table.Cell>
                        <Table.Cell>{u.dob}</Table.Cell>
                        <Table.Cell>{u.address}</Table.Cell>
                        <Table.Cell>{u.description}</Table.Cell>
                        <Table.Cell><span className='username-link' data-userid={u._id} onClick={this.onEditFollowing}>{u.followingLength}</span> </Table.Cell>
                        <Table.Cell>{u.followersLength}</Table.Cell>
                        <Table.Cell >
                          <Button icon data-userid={u._id} onClick={this.onDeleteUser}>Remove</Button>
                          <Button icon data-userid={u._id} onClick={this.showNearby}>Nearby friends</Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })
                }
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell colSpan='6'></Table.HeaderCell>

                  <Table.HeaderCell>
                    <Button icon onClick={this.toggleProfileModal}><Icon name='plus' /></Button>
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>

            </Table> 

              {/* <button onClick={this.newUser}>add new</button> */}
          </div>
          <div className='app-footer'> app footer</div>
        </div>
      )
  }
}

export default App;
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