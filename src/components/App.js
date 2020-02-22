import React, { Component } from "react";
import Controls from './Controls';
import Info from './Info';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = { 
      error: null, 
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      error,
    };
  }

  render() {
    const {
      error,
    } = this.state;

    if (error) {
      return (
        <div className="App">
          <div className="Controls">
            <Info />
          </div>
          <div className="Image">
            <h2>Params broke the app, sorry!</h2>
            <a href="/">
              Click to reload
            </a>
          </div>
        </div>
      );
    }

    return (
      <Controls error={ error } />
    );
  }
}
