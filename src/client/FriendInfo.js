import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import update from 'immutability-helper';
import {initializeProfile, initializeAllCRAs, initializeAllProjects, initializeAllSites } from './actions';
import { Label, Menu, Table, Button, Icon, Header, Image, Modal, Input, Form  } from 'semantic-ui-react'


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

      profileOpen: false,
      profileFriendOpen: false,
    }
    // this.profile = { loggedIn: false, email: 'haijun.wo@dmedGlobal.com', username: 'Edward Wo' }
  }

  initialize = () => {
    // all these data should be saved in redux store for other component to access.
    // say: user input the url '/sites?id=1001' directly in browser, I checked profile in redux store, if not logged-in, redirect it to /login
    // and don't forget to add 
    // todo: 需要记住当前url，一旦login成功后，再返回该url: /login?returnto=*****
    const token = window.localStorage.getItem('jwt');
    if (!token) {
      this.setState({loggedIn: false, loading: false})
      return
    }
    // console.log('jwt exist, ask server for initialization')
    axios.post('/api/initialize', {})
    .then((res) => { // todo: code duplicate with Login.js
      console.log('/init res: ', res); // res.data: {profile, result: [cra, site, project], token}
        // this.props.filterData(username);
        // console.log('login response: ', res);
        // 这里除了写jwt入localstorage，还需要把返回的sites，projects，** 等都一并写入。
        const {profile, result} = res.data;
        this.props.initializeProfile(profile);
        this.props.initializeAllCRAs(result[0]);
        this.props.initializeAllSites(result[1]);
        this.props.initializeAllProjects(result[2])
      this.setState({loggedIn: true, loading: false});

    })
    .catch( err => { // todo: 需要判断： 是401，403，500，最好，有个提示：session过期，请重新登录，然后过3，2，1跳到/login
      console.log('init failed: ', err)
      this.setState({loggedIn: false, loading: false})
    })
  }

  toggleProfileModal = () => {
    this.setState({ profileOpen: !this.state.profileOpen })
  }

  toggleFriendModal = () => {
    this.setState({ profileFriendOpen: !this.state.profileFriendOpen })
  }

  onCreateUser = () => {
    axios.post('/api/user', {
      name: 'Edw', dob: new Date(), address: 'Earth', description: 'hehe', 
    })
    .then(res => {
      console.log('res from creating user: ', res);
      res.data.followingLength = 0; // bad practice, it's server's job to do this
      res.data.followersLength = 0;
      const userList = update(this.state.userList, {$push: [res.data]} );
      this.setState({ userList })
    })
    .catch(err => {
      console.log('creating user failed: ', err)
    })

    console.log('clicked')
  }

  onDeleteUser = evt => {
    let userId = evt.target.dataset.userid
    // console.log('deleting user: ', evt.target.dataset, '//', evt.target, '///', evt.target.dataset.userid);
    axios.delete(`/api/user/${ userId }`)
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
  }

  componentDidMount = () => {
    // this.initialize();
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
    // console.log('entries from backend: ', this.props.profile)
    return (
        <div className="App">
          <div className='app-header'>app-header</div>
          <div className='app-body' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Modal
              onClose={() => { } }
              onOpen={() => { } }
              open={this.state.profileOpen}
            >
              <Modal.Header>Select a Photo</Modal.Header>
              <Modal.Content image>
                <Modal.Description>
                  <Header>Add new user</Header>

                  <Form>
                    <Form.Field>
                      <label>Name</label>
                      <input placeholder='First Name' />
                    </Form.Field>
                  </Form>




                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button color='black' onClick={ this.toggleProfileModal }>Cancel</Button>
                <Button
                  content="OK"
                  labelPosition='right'
                  icon='checkmark'
                  onClick={ this.toggleProfileModal }
                  positive
                />
              </Modal.Actions>
            </Modal>

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
                        <Table.Cell>{u.name}</Table.Cell>
                        <Table.Cell>{u.dob}</Table.Cell>
                        <Table.Cell>{u.address}</Table.Cell>
                        <Table.Cell>{u.description}</Table.Cell>
                        <Table.Cell>{u.followingLength}</Table.Cell>
                        <Table.Cell>{u.followersLength}</Table.Cell>
                        <Table.Cell >
                          <Button icon data-userid={u._id} onClick={this.onDeleteUser}>Remove</Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })
                }
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell colSpan='6'>
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