import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import update from 'immutability-helper';
import { Label, Menu, Table, Button, Icon, Header, Image, Modal, Input, Form  } from 'semantic-ui-react'


import axios from './utils/axios';
import './App.css';

axios.defaults.headers.Authorization = 'Bearer ' + window.localStorage.getItem('jwt');

// after follow/unfollow, the one being followed also need to be updated
// what value need to be returned by server after a follow/unfollow operation:

class FollowingInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loading: true,

      followingResult: [ ],

      // when searching, table show the result of search,
      // when not searching(click the clear button), table show the result of current user's following info
      searchingMode: false,
      searchTerm: '',
      searchResult: null, // for the sake of performance, only one search result is returned, if none is matched, use null
    }
  }

  // when modal open, show:
  // my following people's info, since they are the one already being followed by me, each one record has a 'unfollow' button

  // a search box: 
  // userId, follower name (fuzzy search), only return one record (or none) for performance concern
  // return: {followerInfo, following: true/false}, true: I already followed this one(with a unfollow button), false: not yet (with a follow button)

  // 可否关注自己????????
  // query parameter: userId/friendId, action: follow/unfollow
  // return: 该friend的info, 客户端: 如果是follow, 则把其信息append到当前界面, 如果是unfollow, 找到其id, 当前界面上删除之.
  // 同时勿忘本地的 following length +/- 1
  // 该friend的follower +/- 1

  // 点击clear的一刻, 再次发起getFollowingInfo fn, 用返回的数据覆盖当前, 别折腾了, 这个最简单.-

  onSearchChange = evt => this.setState({ searchTerm: evt.target.value })

  // 返回的记录可能是已经follow, or unfollow了
  // 不管点击follow还是unfollow, 后端返回followerInfo, 此时setState, 覆盖原有的followingResult, 
  // 但由于此时还处于searching mode, 界面上手动调用parent 的 onFollow/onUnfollow, 把parent的信息更新一下
  // 
  goSearch = () => {
    if (this.state.searchTerm.trim() == '') {
      // todo: pop up a message box telling user: it can't be empty
      return;
    }
    let p = this.props;
    axios.post(`/API_demo/api/check-following`, { userId: p.userId, searchTerm: this.state.searchTerm })
      .then(res => {
        console.log('res from running search: ', res);
        this.setState({ searchResult: res.data, searchingMode: true })
      })
      .catch(err => {
        console.log('err running search: ', err)
      })
  }

  clearSearch = () => {
    this.setState({ searchingMode: false, searchTerm: '' })
    this.getFollowingInfo();
  }

  getFollowingInfo = () => {
    let p = this.props;
    axios.get(`/API_demo/api/user/${p.userId}/following`)
    .then(res => {
      console.log('res from getting followingListof: ', res);
      this.setState({ followingResult: res.data })
    })
    .catch(err => {
      console.log('err getting following list: ', err)
    })
  }

  onFollow = (evt) => {
    let p = this.props;
    let followingId = evt.target.dataset.followingid
    axios.post('/API_demo/api/user/follow', {userId: p.userId, followingId: followingId })
      .then(res => {
        let followingResult = update(this.state.followingResult, {$push: [res.data]})
        this.setState({ searchResult: res.data, followingResult });
        p.onFollow(p.userId, followingId)
      })
      .catch(err => {
        console.log('err following other: ', err)
      })
    console.log('on follow evt: ', followingId)
  }


  // search界面上先点击 follow, 再unfollow, 此时记录为空, 但记录所在的横条, 还在, 按钮还在.
  onUnfollow = (evt) => {
    let p = this.props;
    let followingId = evt.target.dataset.followingid
    axios.post('/API_demo/api/user/unfollow', {userId: p.userId, followingId: followingId})
      .then(res => {
        // todo: 这里要判断是searching mode or not
        if (this.state.searchingMode) {
          console.log(' in searching mmode, unfollow res: ', res.data)
          // in searching mode, only one record is returned, and since we are unfollowing the only record
          // the result should be null
          this.setState({ searchResult: null });
        } else {
          let followingIdx = this.state.followingResult.findIndex(f => f._id == followingId);
          if (followingIdx == -1) {
            return
          }
          let followingResult = update(this.state.followingResult, {$splice: [[ followingIdx, 1 ]]});
          this.setState({ followingResult })
        }

        p.onUnfollow(p.userId, followingId)
      })
      .catch(err => {
        console.log('err unfollowing user: ', err)
      })
    console.log('on unfollow evt: ', followingId)
  }

  componentDidMount = () => {
    this.getFollowingInfo();
  }

  render() {
    let p = this.props;
    let { searchResult, followingResult, searchingMode } = this.state;
    return (
        <div className="modal-wrapper">
            <Modal
              onClose={() => { } }
              onOpen={() => { } }
              open={p.open}
            >
              <Modal.Header>{p.name}'s following</Modal.Header>
              <Modal.Content image>
                <Modal.Description>
                  <Input placeholder='the name you want to follow' value={this.state.searchTerm} onChange={this.onSearchChange} />
                  <Button onClick={this.goSearch}>Go</Button>
                  <Button onClick={this.clearSearch}>Clear</Button>

                  <div>{searchingMode ? 'search result' : 'my following info'}</div>
                  <Table celled>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Date of birth</Table.HeaderCell>
                        <Table.HeaderCell>Address</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {
                        searchingMode ? 
                        ((searchResult == null || searchResult == '') ? 
                        <Table.Row><Table.HeaderCell colSpan='3'>no match found</Table.HeaderCell></Table.Row>
                           :
                          <Table.Row>
                            <Table.Cell>{searchResult.name}</Table.Cell>
                            <Table.Cell>{searchResult.dob}</Table.Cell>
                            <Table.Cell>{searchResult.address}</Table.Cell>
                            <Table.Cell>{searchResult.description}</Table.Cell>
                            <Table.Cell>{searchResult.isFollowing ? 
                              <Button data-followingid={searchResult._id} onClick={this.onUnfollow}>unfollow</Button> : 
                              <Button data-followingid={searchResult._id} onClick={this.onFollow}>follow</Button>}
                            </Table.Cell>
                          </Table.Row>)                          
                          :
                          
                            followingResult.map(f => {
                              return (
                                <Table.Row key={f._id}>
                                  <Table.Cell>{f.name}</Table.Cell>
                                  <Table.Cell>{f.dob}</Table.Cell>
                                  <Table.Cell>{f.address}</Table.Cell>
                                  <Table.Cell>{f.description}</Table.Cell>
                                  <Table.Cell>
                                    <Button data-followingid={f._id} onClick={this.onUnfollow}>unfollow</Button>
                                  </Table.Cell>
                                </Table.Row>
                              )
                            })
                          
                      }

                    </Table.Body>
                  </Table>



                </Modal.Description>
              </Modal.Content>
              <Modal.Actions>
                <Button color='black' onClick={ p.toggleModal }>OK</Button>
              </Modal.Actions>
            </Modal>

        </div>
      )
  }
}

export default FollowingInfo;
