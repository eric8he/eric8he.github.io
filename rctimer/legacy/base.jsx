'use strict';

const e = React.createElement;
const DECIMAL_PLACES = 1;

var keyInc = 0;

var userdata = JSON.parse(localStorage.getItem("data"));
if(userdata == null) {
    userdata = {solves:[]};
}

class Timer extends React.Component{
    constructor(props) {
        super(props);
        this.state = { running: false, color: "bg_aqua" };
        this.startTime = new Date();
        this.dispTime = 0.00;
        this.downTime = 0;

        document.addEventListener("keydown", (event) => {
            this.setState({color:"bg_red"});
            if(this.state.running) {
                console.log("stopped");
                this.dispTime = (new Date() - this.startTime)/1000.0;
                userdata.solves.push({"puzzle":"3x3","time":this.dispTime,"timestamp":new Date()});
                console.log(userdata.solves);
                localStorage.setItem("data",JSON.stringify(userdata));
                this.state.running = false;
            } else {
                if (this.downTime < 10) {
                    this.setState({color:"bg_red"});
                } else if (this.downTime >= 10) {
                    this.setState({color:"bg_green"});
                }
                this.downTime++;
                console.log(this.downTime);
            }
        });

        document.addEventListener("keyup", (event) => {
            this.setState({color:"bg_white"});
            console.log(this.downTime);
            if(!this.state.running) {
                console.log("released");
                if(this.downTime >= 10) {
                    console.log("started");
                    this.startTime = new Date();
                    this.state.running = true;
                }
            } else {
                this.state.running = false;
            }
            this.downTime = 0;
        });
    }

    render() {
        if (this.state.running) {
            return ( 
                <div className={"fs_div "+this.state.color}>
                    <p id="time">{((new Date()-this.startTime)/1000.0)}</p>
                </div>
            );
        }
        
        return (
            <div className={"fs_div "+this.state.color}>
                <p id="time">{this.dispTime.toFixed(DECIMAL_PLACES)}</p>
            </div>
        );
    }
}

var avgN = (arr, maxPos, n) => {
    var l = arr.length;

    var min = Infinity;
    var max = -Infinity;
    for(var i = maxPos; i > maxPos-n && i >= 0; i--) {
        
    }
}

class TimeTable extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        let solveHTML = [];

        for(var i = userdata.solves.length-1; i >= 0; i--) {
            solveHTML.push(<tr key={keyInc}>
                <th className="time_element">{userdata.solves[i].time}</th>
                {/*<th class="time_element">{(userdata.solves[i].time+userdata.solves[i-1].time+userdata.solves[i-2].time+userdata.solves[i-3].time+userdata.solves[i-4].time)/5}</th>*/}
            </tr>);
            keyInc++; 
        }

        return (
            <div id="stats">
                <br />
                <h2>Times</h2>
                <table><tbody>{solveHTML}</tbody></table>
            </div>
        );
    }
}

function App() {
    return(
        <div id="timer_container">
            <Timer />
            <TimeTable />
        </div>
    );
}

/*
document.onkeypress = (evt) => {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    alert(charStr);
}*/

setInterval(() => ReactDOM.render(<App />, document.getElementById('root')), 1);