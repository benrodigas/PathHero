'use strict';
/* jshint quotmark: false */
/* jshint expr: true */
/* jshint latedef: false */

var targetLoc = {
  lat: 37.7838075,
  lon: -122.40905669999998
}

var currentLoc = {
  lat: null,
  lon: null
}

var _H = {
  height: window.innerHeight
}


var Router = window.ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;





var PlayerApp = React.createClass({  
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

  toggleBottomNav: function() {

    var activeTab = true; 
    var nonActiveTab = false; 

  },

  componentWillMount: function() {

    $.ajax({
          method: 'GET',
          url: 'http://create.wettowelreactor.com:3000'+window.location.pathname
        }).done(function(data) {
          console.log(data)
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
                    
          this.setState({hunt: data})

        }.bind(this)).fail(function(err){console.log(err)});
    
    gMap.importMap([[37.7902554,-122.42340160000003],[37.7902554,-122.42340160000003]]);
  },

  incrementPinInLocalStorage: function() {
    var currentPin = Number.parseInt(this.state.hunt.get('currentPin'));
    var nextPin = currentPin + 1;
    
    this.state.hunt.set('currentPin', nextPin);

    this.setState({hunt:hunt})
  },

  render: function () {

    var display = (<div></div>);
    
    if (this.state.hunt.huntDesc) {
      display = (<div id="playerApp"><RouteHandler incrementPinInLocalStorage={this.incrementPinInLocalStorage}  hunt={this.state.hunt}/><BottomNav/></div>);
    }
    return (
      <div>{display}</div>
    );
  }
});



var BottomNav = React.createClass({

  render: function () {

    var status = classNames({active: false})

    return (                   
      <div id="bottomNav">
        <div className="row">
          <div className="col-xs-4">
            <span><Link to="status" className={status}>Status</Link></span>
          </div>
          <div className="col-xs-4">
            <span><Link to="clues" className={status}>Clues</Link></span>
          </div>
          <div className="col-xs-4">
            <span><Link to="map" className={status}>Map</Link></span>
          </div>
        </div>
      </div>      
    );
  }
});

var Welcome = React.createClass({
  render: function () {      
    return (
      <div>
        <div id="welcome-msg-container">  
          <div id="welcome-text">
            <Title title={this.props.hunt.huntName}/>
          </div>      
          <div id="start-btn">
            <button className="btn btn-default"><Link to="clues">Start</Link></button>
          </div>          
        </div>
        <HuntSummaryContainer hunt={this.props.hunt}/>
      </div>
    );
  }
});

var Clues = React.createClass({
  hunt: null,
  clueIndex : null,
  pin: null,
  max: null,  
  changeLocalStorage: function(value) {    
    var clueValue = this.clueIndex+value;    
    if (clueValue < this.max && clueValue >= 0) {
      this.hunt.set('currentClue', clueValue);
      this.setState({hunt:hunt.storage});
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
    var backBtn = (<button onClick={this.changeLocalStorage.bind(this, -1)} className="btn btn-default">Back</button>);                    
    var nextBtn = (<button onClick={this.changeLocalStorage.bind(this, 1)} className="btn btn-default">Next</button>);
    var twoButtons = (<div><button onClick={this.changeLocalStorage.bind(this, -1)} className="btn btn-default">Back</button><button onClick={this.changeLocalStorage.bind(this, 1)} className="btn btn-default">Next</button></div>);
    var btnsToDisplay;

    if (this.clueIndex < this.max && this.clueIndex === 0) {
      btnsToDisplay = nextBtn;    
    } else if (this.clueIndex < this.max && this.clueIndex > 0 && this.clueIndex !== this.max-1) {
      btnsToDisplay = twoButtons;
    } else if (this.clueIndex === this.max-1) {
      btnsToDisplay = backBtn;
    }

    return (
      <div id="playerContainer">
        <div className="clue-container" style={_H}>
          <div className="clue-header">
            <h1>{this.pin.hiddenName}</h1>                
          </div>
          <TitleBox title={"Clue " + (this.clueIndex + 1) + " of " +  this.pin.clues.length}>
            {currentClue}
          </TitleBox>
            {btnsToDisplay}        
        </div>
      </div>
    );
  }
});

var Status = React.createClass({

  getInitialState: function() {    
    return {
      currentLoc: currentLoc,
      numOfLocations: this.props.hunt.huntInfo.numOfLocations,
      huntTimeEst: this.props.hunt.huntInfo.huntTimeEst,   
      huntDistance: this.props.hunt.huntInfo.huntDistance,
      listItemArray: [this.numOfLocations + " locations", 
                          this.huntTimeEst + " hr to completion", 
                          this.huntDistance + " miles"]
    };
  },

  getLocation: function () {   
    var that = this;
    navigator.geolocation.getCurrentPosition(showPosition);    
    function showPosition(position) {       
      currentLoc.lat = position.coords.latitude;
      currentLoc.lon = position.coords.longitude;
      that.setState({currentLoc: currentLoc})
    } 
  },

  componentWillMount: function() {
    var nextPinDistance = gMap.getDistanceByLocation(function (value) {
    })
    this.getLocation();
  },

  render: function () {
    var locationStatus;    
    var locationSummary = (<TitleBox title="Location Summary"><List listItemArray={this.state.listItemArray} /></TitleBox>);
    
    var latDiff = targetLoc.lat - currentLoc.lat;
    var lonDiff = targetLoc.lon - currentLoc.lon;
  
    if (latDiff<2 && lonDiff<2) {
      locationStatus = <Success hunt={this.props.hunt} incrementPinInLocalStorage={this.props.incrementPinInLocalStorage}/>;

    } else {
      locationStatus = locationSummary;
    }

    var currentStatus;
    var loading = (<div>Loading...</div>);
    var statusReturn = (<div>{locationStatus}<HuntSummaryContainer hunt={this.props.hunt}/><BottomNav/></div>);    

    if (!currentLoc.lat || !currentLoc.lon) {
      currentStatus = loading;
    } else {
      currentStatus = statusReturn;
    }

    return (
      <div>
        {currentStatus}
      </div>
    )
  }
});

var Map = React.createClass({
  
  componentDidMount: function() {
    gMap.startGMap({lng:-33.73, lat:149.02});
    gMap.getGeolocation(gMap.setCenter);
  },

  render: function () {
    return (
      <div id="gMap" style={_H}>
        
      </div>
    );
  }
});

var Success = React.createClass({

  incrementPinInLocalStorage: function() {    
    this.props.incrementPinInLocalStorage();
  },

  render: function () {

    var currentPin = this.props.hunt.get('currentPin');
    var answer = this.props.hunt.pins[currentPin].answer;

    return (
      <div>
        <h1>Success! You're at the correct location</h1>
        <p>The answer was {answer}</p>
        <button className="btn btn-default" onClick={this.incrementPinInLocalStorage}><Link to="clues">Start next location</Link></button>
      </div>
    )
    
  }
});

var HuntSummaryContainer = React.createClass({
  
  render: function () {
    console.log(this.props.hunt);
    var numOfLocations = this.props.hunt.huntInfo.numOfLocations;
    var huntTimeEst = this.props.hunt.huntInfo.huntTimeEst;
    var huntDistance = this.props.hunt.huntInfo.huntDistance;
    var listItemArray = [ numOfLocations + " locations", 
                          huntTimeEst + " hr to completion", 
                          huntDistance + " miles"];
    return (      
      <div id="huntSummaryContainer">
        <TitleBox title="Hunt Summary">            
          <List listItemArray={listItemArray} />
        </TitleBox>
        <div id="hunt-description-container">
          <TitleBox title="Hunt Description">
            <div>
              {this.props.hunt.huntDesc}
              {this.numOfLocations}
            </div>
          </TitleBox>          
        </div>
      </div>
    ); 
  }
});

var Title = React.createClass({
  render: function () {
    return <h2>{this.props.title}</h2>;
  }
});

var TitleBox = React.createClass({
  render: function () {
    return (
      <div>
        <h2>{this.props.title}</h2>
        <div>{this.props.children}</div>
      </div>
    );
  }
});

var List = React.createClass({
  render: function () {
    return (
      <div>
        <ul>
        {this.props.listItemArray.map(function(listItem) {
            return (<li>{listItem}</li>);
          })
        }
        </ul>
      </div>
    );
  }
});

var routes = (
  <Route handler={PlayerApp}>
    <DefaultRoute handler={Welcome}/>
    <Route name="status" handler={Status}/>
    <Route name="clues" handler={Clues}/>
    <Route name="map" handler={Map}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.getElementById('player-container'));
});










