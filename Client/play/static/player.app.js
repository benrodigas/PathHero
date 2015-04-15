'use strict';
/* jshint quotmark: false */
/* jshint expr: true */
/* jshint latedef: false */


var Router = window.ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;


var PlayerApp = React.createClass({displayName: "PlayerApp",  
  getInitialState: function() { 
    var hunt = {
      huntName: null,
      huntDesc: null,
      huntInfo: {
        numOfLocations: null,
        huntTimeEst: null,    
        huntDistance: null,
      }, 
      pins: [
        {
          hiddenName: null, 
          answer: null,
          geo: {
            lat: null,
            lng: null
          },
          timeToNextPin: null,
          distanceToNextPin: null,
          clues: []                    
        }
      ]
    };
    hunt.storage = {};
    return {hunt: hunt};
  },

  componentWillMount: function() {
    
    $.ajax({
      method: 'GET',
      url: 'http://create.wettowelreactor.com:3000'+window.location.pathname
    }).done(function(data) {
                  
      data.storage = {};

      data.set = function(key, value) {
        this.storage[key] = value;
        localStorage.setItem(key, value);
      };
      data.get = function(key) {
        if (this.storage[key] !== undefined) {
          return this.storage[key];

        } else if (localStorage[key] !== undefined) {
          this.storage[key] = localStorage[key];
          return localStorage[key];

        } else {
          this.set(key, 0);
          return 0;
        }
      };

      this.setState({hunt: data});

    }.bind(this));

    gMap.importMap([[37.7902554,-122.42340160000003],[37.7902554,-122.42340160000003]]);
  },

  render: function () {

    var display = (React.createElement("div", null, "Loading..."));

    if (this.state.hunt) {
      display = (React.createElement("div", {id: "playerApp"}, React.createElement(RouteHandler, {hunt: this.state.hunt})));
    }

    return (
      React.createElement("div", null, display)
    );
  }
});

var BottomNav = React.createClass({displayName: "BottomNav",
  render: function () {
    return (                   
      React.createElement("div", {id: "bottomNav"}, 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-xs-4"}, 
            React.createElement("span", null, React.createElement(Link, {to: "status"}, "Status"))
          ), 
          React.createElement("div", {className: "col-xs-4"}, 
            React.createElement("span", null, React.createElement(Link, {to: "clues"}, "Clues"))
          ), 
          React.createElement("div", {className: "col-xs-4"}, 
            React.createElement("span", null, React.createElement(Link, {to: "map"}, "Map"))
          )
        )
      )      
    );
  }
});

var Title = React.createClass({displayName: "Title",
  render: function () {
    return React.createElement("h2", null, this.props.title);
  }
});

var TitleBox = React.createClass({displayName: "TitleBox",
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement("h2", null, this.props.title), 
        React.createElement("div", null, this.props.children)
      )
    );
  }
});

var List = React.createClass({displayName: "List",
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement("ul", null, 
        this.props.listItemArray.map(function(listItem) {
            return (React.createElement("li", null, listItem));
          })
        
        )
      )
    );
  }
});

var HuntSummaryContainer = React.createClass({displayName: "HuntSummaryContainer",
  render: function () {
    var numOfLocations = this.props.hunt.huntInfo.numOfLocations;
    var huntTimeEst = this.props.hunt.huntInfo.huntTimeEst;
    var huntDistance = this.props.hunt.huntInfo.huntDistance;
    var listItemArray = [ numOfLocations + " locations", 
                          huntTimeEst + " hr to completion", 
                          huntDistance + " miles"];
    return (      
      React.createElement("div", {id: "huntSummaryContainer"}, 
        React.createElement(TitleBox, {title: "Hunt Summary"}, 
          React.createElement(List, {listItemArray: listItemArray})
        ), 
        React.createElement("div", {id: "hunt-description-container"}, 
          React.createElement(TitleBox, {title: "Hunt Description"}, 
            React.createElement("div", null, 
              this.props.hunt.huntDesc, 
              this.numOfLocations
            )
          )
        )
      )
    ); 
  }
});

var Status = React.createClass({displayName: "Status",

  componentWillMount: function() {
    var nextPinDistance = null;
    gMap.getDistanceByLocation(function (value) {
      nextPinDistance = value;
    });
  },

  render: function () {
    var numOfLocations = this.props.hunt.huntInfo.numOfLocations;
    var huntTimeEst = this.props.hunt.huntInfo.huntTimeEst;
    var huntDistance = this.props.hunt.huntInfo.huntDistance;
    var listItemArray = [ numOfLocations + " locations", 
                          huntTimeEst + " hr to completion", 
                          huntDistance + " miles"];
    return (
      React.createElement("div", null, 
        React.createElement(TitleBox, {title: "Location Summary"}, 
          React.createElement(List, {listItemArray: listItemArray})
        ), 
        React.createElement(HuntSummaryContainer, {hunt: this.props.hunt}), 
        React.createElement(BottomNav, null)
      )
    );
  }
});

var PinSuccess = React.createClass({displayName: "PinSuccess",
  incrementPinInLocalStorage: function() {    
    this.props.incrementPinInLocalStorage();
  },
  render: function () {
    var currentPin = this.props.hunt.get('currentPin');
    var answer = this.props.hunt.pins[currentPin].answer;

    return (
      React.createElement("div", null, 
        React.createElement("h1", null, "Success! You're at the correct location"), 
        React.createElement("p", null, "The answer was ", answer), 
        React.createElement("button", {className: "btn btn-default", onClick: this.incrementPinInLocalStorage}, React.createElement(Link, {to: "clues"}, "Start next location"))
      )
    )
  }
});

var HuntSuccess = React.createClass({displayName: "HuntSuccess",
  render: function () {
    return (
      React.createElement("div", null, 
        React.createElement("h1", null, "You've completed the hunt!"), 
        React.createElement("p", null, "Congratulation")
      )
    )    
  }
});

var Welcome = React.createClass({displayName: "Welcome",
  render: function () {      
    return (
      React.createElement("div", null, 
        React.createElement("div", {id: "welcome-msg-container"}, 
          React.createElement("div", {id: "welcome-text"}, 
            React.createElement(Title, {title: this.props.hunt.huntName})
          ), 
          React.createElement("div", {id: "start-btn"}, 
            React.createElement("button", null, React.createElement(Link, {to: "clues"}, "Start"))
          )
        ), 
        React.createElement(HuntSummaryContainer, {hunt: this.props.hunt})
      )
    );
  }
});

var Clues = React.createClass({displayName: "Clues",
  hunt: null,
  clueIndex : null,
  pin: null,
  max: null,  
  changeLocalStorage: function(value) {    
    var clueValue = this.clueIndex+value;    
    if (clueValue < this.max && clueValue >= 0) {
      this.hunt.set('currentClue', clueValue);
      this.setState({hunt:this.hunt.storage});
    }  
  },
  init: function() {
    this.hunt = this.props.hunt;
    this.clueIndex = Number.parseInt(this.hunt.get('currentClue'));
    this.pin = this.hunt.pins[this.hunt.get('currentPin')];
    this.max = this.pin.clues.length;
  },
  render: function () {    
    this.init();
    var currentClue = this.pin.clues[this.clueIndex];    
    var backBtn = (React.createElement("button", {onClick: this.changeLocalStorage.bind(this, -1), className: "btn btn-default"}, "Back"));                    
    var nextBtn = (React.createElement("button", {onClick: this.changeLocalStorage.bind(this, 1), className: "btn btn-default"}, "Next"));
    var twoButtons = (React.createElement("div", null, React.createElement("button", {onClick: this.changeLocalStorage.bind(this, -1), className: "btn btn-default"}, "Back"), React.createElement("button", {onClick: this.changeLocalStorage.bind(this, 1), className: "btn btn-default"}, "Next")));
    var btnsToDisplay;

    if (this.clueIndex < this.max && this.clueIndex === 0) {
      btnsToDisplay = nextBtn;    
    } else if (this.clueIndex < this.max && this.clueIndex > 0 && this.clueIndex !== this.max-1) {
      btnsToDisplay = twoButtons;
    } else if (this.clueIndex === this.max-1) {
      btnsToDisplay = backBtn;
    }

    return (
      React.createElement("div", {id: "playerContainer"}, 
        React.createElement("div", {className: "clue-container"}, 
          React.createElement("div", {className: "clue-header"}, 
            React.createElement("h1", null, "Under the Bridge")
          ), 
          React.createElement(TitleBox, {title: "Clue " + (this.clueIndex + 1) + " of " +  this.pin.clues.length}, 
            currentClue
          ), 
            btnsToDisplay
        ), 
        React.createElement(BottomNav, null)
      )
    );
  }
});

var routes = (
  React.createElement(Route, {handler: PlayerApp}, 
    React.createElement(DefaultRoute, {handler: Welcome}), 
    React.createElement(Route, {name: "status", handler: Status}), 
    React.createElement(Route, {name: "clues", handler: Clues}), 
    React.createElement(Route, {name: "map", handler: Map})
  )
);

Router.run(routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.getElementById('player-container'));
});










