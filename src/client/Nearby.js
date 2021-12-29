import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import update from 'immutability-helper';
import { Label, Menu, Table, Button, Icon, Header, Image, Modal, Input, Form  } from 'semantic-ui-react'


import axios from './utils/axios';
import './App.css';

axios.defaults.headers.Authorization = 'Bearer ' + window.localStorage.getItem('jwt');

class Nearby extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loading: true,

      distances: [ ],

    }
  }

  componentDidMount = () => {
    let p = this.props;
    axios.get(`/API_demo/api/user/${p.userId}/nearby`)
      .then(res => {
        console.log('res from getting nearby: ', res);
        this.setState({distances: res.data })
      })
      .catch(err => {
        console.log('err getting nearbys: ', err)
      })
  }

  render() {
    let p = this.props;
    return (
        <div className="modal-wrapper">
            <Modal
              onClose={() => { } }
              onOpen={() => { } }
              open={p.open}
            >
              <Modal.Header>{p.name}'s nearby friends</Modal.Header>
              <Modal.Content image>
                <Modal.Description>

                  <Table celled>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Date of birth</Table.HeaderCell>
                        <Table.HeaderCell>Address</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Distance from you(km)</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                    <Table.Body>
                      {
                        this.state.distances.map(d => {
                          return (
                            <Table.Row key={d._id}>
                              <Table.Cell>{d.name}</Table.Cell>
                              <Table.Cell>{d.dob}</Table.Cell>
                              <Table.Cell>{d.address}</Table.Cell>
                              <Table.Cell>{d.description}</Table.Cell>
                              <Table.Cell>{d.distance}/km</Table.Cell>
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

export default Nearby;
