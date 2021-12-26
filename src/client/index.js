import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
// import {fromJS} from 'immutable';
import reducers from './reducers';

import './index.css';
import App from './App';
// import 'antd/dist/antd.css';
import 'semantic-ui-css/semantic.min.css'

// import 'react-datepicker/dist/react-datepicker.css';

let initialState = {
  profile: {username: '', role: '', loggedIn: false, entries: []},
  sites: [],
  projects: [],
  CRAs: [],
  queryTerms: {CRA: '', site: '', project: '', region: []}
};

let store = createStore(reducers, initialState, compose(
  applyMiddleware(thunk),
  window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, document.getElementById('root')
);
