const AVGS = [5, 12, 100]; // will merge into a setting down the road.

/**
 * Starting Code
 */

// Load user data
var userdata = JSON.parse(localStorage.getItem("data"));

// If user data is not available, create JSON object.
if(userdata == null) {
    userdata = {
        solves : [],
        settings : {
            DECIMAL_PLACES : 4, 
            DECIMAL_PLACES_DISP : 3,
            TIMING_DELAY : 1,
            WIDGETS : {
                cube : true,
                list : {
                    toggle : true,
                    solveNum : true,
                    time : true,
                    stamp : true,
                    scramble : true
                },
            }
        }};
}

// Parse dates, if any. 
for(var i = 0; i < userdata.solves.length; i++) {
    userdata.solves[i].timestamp = new Date(userdata.solves[i].timestamp);
}

// Set session-specific global variables.
var GLOBAL_STATE = "main";
var timerState = {
    running : false,
    startTime : 0,
    storedTime : 0,
    scramble : "",
    avgs : [
        {n : 5, time : 0}, 
        {n : 12, time : 0}, 
        {n : 100, time : 0}
    ],
    color : "bg_white",
    downTime : 0,
    showingMenu : false
};

/**
 * Components.
 *    --+- MainComponent
 *      |  |
 *      |  Widgets Components [CubeWidget, ListWidget, etc.]
 *      |
 *      +--+- TimeComponent
 *         |
 *         +--+- MenuComponent
 *            |
 *            +--+- SettingsComponent
 *               |
 *               +- WidgetsComponent
 *               |
 *               +- StatisticsComponent
 */

// Base, loader for other components.
class MainComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // render all needed parts.
        return <div className = "space">

            {/**
             * Ternary operators used here to save space.
             */}
            {GLOBAL_STATE === "menu" 
                || GLOBAL_STATE === "settings" 
                || GLOBAL_STATE === "widgets" 
                || GLOBAL_STATE === "statistics" ?
                    (<MenuComponent />) : null}

            {GLOBAL_STATE === "settings" ?
                (<SettingsComponent />) : null}

            {GLOBAL_STATE === "widgets" ? 
                (<WidgetsComponent />) : null}

            {GLOBAL_STATE === "statistics" ? 
                (<StatisticsComponent />) : null}

            {userdata.settings.WIDGETS.cube ? 
                (<CubeWidget />) : null}

            {userdata.settings.WIDGETS.list.toggle ?
                (<ListWidget />) : null}

            <TimeComponent />
        </div>
    }
}

// Component for timer features - scramble generation, etc. 
// HTML base for all other components.
class TimeComponent extends React.Component {
    constructor(props) {
        super(props);

        // create a listener to handle keystrokes - start/stop timer
        document.addEventListener("keydown", (event) => {
            if(GLOBAL_STATE === "main"){
                // spacebar - hold to start timer, press to stop timer
                if(event.key === " ") {
                    timerState.color = "bg_red";

                    // stops timer
                    if(timerState.running) {
                        timerState.storedTime = (new Date() - timerState.startTime) / 1000.0;
                        
                        // store relevant info in local variable
                        userdata.solves.push({
                                "puzzle" : "3x3",
                                "time" : timerState.storedTime,
                                "timestamp" : new Date(),
                                "scramble" : timerState.scramble});
                        
                        // sync local storage with new data
                        localStorage.setItem("data", JSON.stringify(userdata));

                        timerState.running = false;

                        this.refreshAverages();
                        this.refreshScramble();
                    } 
                    
                    // starts timer
                    else {
                        if (timerState.downTime < userdata.settings.TIMING_DELAY) {
                            timerState.color = "bg_red";
                        } else if (timerState.downTime >= userdata.settings.TIMING_DELAY) {
                            timerState.color = "bg_green";
                        }
                        timerState.downTime++;
                        console.log(timerState.downTime);
                    }
                }
            }
        });

        // handle key release, timer start or No Action.
        document.addEventListener("keyup", (event) => {
            if(GLOBAL_STATE === "main"){
                timerState.color = "bg_white";
                
                if(!timerState.running) {
                    if(timerState.downTime >= userdata.settings.TIMING_DELAY) {
                        timerState.startTime = new Date();
                        timerState.running = true;
                    }
                } else {
                    timerState.running = false;
                }

                timerState.downTime = 0;
            } else {
                if(event.key === "Escape") {
                    GLOBAL_STATE = "main";
                }
            }
        });

        this.refreshAverages();
        this.refreshScramble();
    }

    // Returns a trimmed average of length *n* with *trim* elements trimmed off each end. 
    // Condition: n - 2*trim > 0
    calcTrimmedAverage(n, trim) {
        // The magic line! Gets the last N elements from the array, and sorts them based on time.
        let t = userdata.solves.slice(userdata.solves.length - n).sort((a, b) => { return (a.time > b.time) - (a.time < b.time); });

        // Finding the rest of the average is straightforward.
        var sum = 0;
        var nTrimmed = n - trim * 2;

        for(var i = trim; i < t.length - trim; i++) {
            sum += t[i].time;
        }
        
        return sum / nTrimmed;
    }

    // Recalculates all averages and stores them in the averages array.
    refreshAverages() {
        for(var a = 0; a < timerState.avgs.length; a++) {
            // Check if we have enough elements to do a trimmed average.
            if(timerState.avgs[a].n > userdata.solves.length) {
                var t = 0;
                var i = 0;

                for(; i <= timerState.avgs[a].n; i++) {
                    if(userdata.solves[userdata.solves.length - i - 1] == null) {
                        break;
                    }
                    t += userdata.solves[userdata.solves.length - i - 1].time;
                }

                timerState.avgs[a].time = t / (Math.max(i, 1));
            } else {
                timerState.avgs[a].time = this.calcTrimmedAverage(timerState.avgs[a].n, Math.floor(timerState.avgs[a].n / 5));
            }
        }
    }

    // Generates a new scramble.
    refreshScramble() {
        timerState.scramble = scram_333.getRandomScramble();
    }

    // Creates the Bootstrap "row" div that houses the average cols.
    averageElement() {
        let elements = [];

        for(var i = 0; i < timerState.avgs.length; i++) {
            var x = timerState.avgs[i];
            var d = (<div className = "col-4">
                        {"ao" + x.n + ": " + x.time.toFixed(userdata.settings.DECIMAL_PLACES_DISP)}
                    </div>);
            elements.push(d);
        }

        return elements;
    }

    // Get current amount time displayed on screen.
    getTime() {
        return (timerState.running ? ((new Date() - timerState.startTime) / 1000.0) : timerState.storedTime).toFixed(userdata.settings.DECIMAL_PLACES_DISP);
    }

    // Helper function for the menu click - transitions app state.
    showMenu() {
        GLOBAL_STATE = "menu";
    }

    // Puts all relevant sub-components together into the whole component.
    render() {
        return (<div className = "space timeComponent">
                    <div id = "scramble">
                        {timerState.scramble}
                    </div>
                    <div id = "time" className={timerState.color}>
                        {this.getTime()}
                    </div>
                    <div className = "row align-items-center justify-content-center" id = "averages">
                        {this.averageElement()}
                    </div>
                    <div className = "nothingSpacer"> </div>
                    <div className = "nothingSpacer"> </div>
                    <div className = "space space2" onClick = {this.showMenu} id = "antiClick">
                        <br /> 
                        <br />
                        <h2> Menu </h2>
                    </div>
                </div>);
    }
}

// Component for the main six-item menu.
// Simpler coding, just a bunch of buttons and SVGs.
class MenuComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    // Helper functions to switch states.
    settings() {
        GLOBAL_STATE = "settings";
    }

    widgets() {
        GLOBAL_STATE = "widgets";
    }

    statistics() {
        GLOBAL_STATE = "statistics";
    }

    // Meat and potatoes - nearly pure HTML with just a few function calls.
    // 2 Boostrap "rows" of "col-4" buttons (each col-4 is a third of the row)
    // The ultra long lines of code are codified SVG images (copied from Bootstrap Icons website)
    render() {
        return (<div id = "overlay">
            <div id = "grid" className = "container">
                <div className = "black">
                    <div className = "row align-items-center justify-content-center menu-row">
                        <div className = "col-lg-4 btn btn-dark btn-sm" onClick = {this.settings}>
                            <h2> Settings </h2>

                            <svg xmlns = "http://www.w3.org/2000/svg" fill = "currentColor" className = "bi bi-gear" viewBox = "0 0 16 16">
                                <path d = "M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                <path d = "M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                            </svg>
                        </div>

                        <div className = "col-lg-4 btn btn-dark btn-sm" onClick = {this.widgets}>
                            <h2> Widgets </h2>

                            <svg xmlns = "http://www.w3.org/2000/svg" fill = "currentColor" className = "bi bi-joystick" viewBox = "0 0 16 16">
                                <path d = "M10 2a2 2 0 0 1-1.5 1.937v5.087c.863.083 1.5.377 1.5.726 0 .414-.895.75-2 .75s-2-.336-2-.75c0-.35.637-.643 1.5-.726V3.937A2 2 0 1 1 10 2z"/>
                                <path d = "M0 9.665v1.717a1 1 0 0 0 .553.894l6.553 3.277a2 2 0 0 0 1.788 0l6.553-3.277a1 1 0 0 0 .553-.894V9.665c0-.1-.06-.19-.152-.23L9.5 6.715v.993l5.227 2.178a.125.125 0 0 1 .001.23l-5.94 2.546a2 2 0 0 1-1.576 0l-5.94-2.546a.125.125 0 0 1 .001-.23L6.5 7.708l-.013-.988L.152 9.435a.25.25 0 0 0-.152.23z"/>
                            </svg>
                        </div>

                        <div className = "col-lg-4 btn btn-dark btn-sm">
                            <h2> Sessions </h2>

                            <svg xmlns = "http://www.w3.org/2000/svg" fill = "currentColor" className = "bi bi-list-ol" viewBox = "0 0 16 16">
                                <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
                                <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
                            </svg>
                        </div>
                    </div>

                    <div className = "row align-items-center justify-content-center menu-row">
                        <div className = "col-lg-4 btn btn-dark btn-sm" onClick = {this.statistics}>
                            <h2> Statistics </h2>

                            <svg xmlns = "http://www.w3.org/2000/svg" fill = "currentColor" className = "bi bi-reception-4" viewBox = "0 0 16 16">
                                <path d = "M0 11.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-5zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-8zm4-3a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-11z"/>
                            </svg>
                        </div>

                        <div className = "col-lg-4 btn btn-dark btn-sm">
                            <h2> Trainer </h2>

                            <svg xmlns = "http://www.w3.org/2000/svg" fill = "currentColor" className = "bi bi-trophy" viewBox = "0 0 16 16">
                                <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33.076 33.076 0 0 1 2.5.5zm.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935zm10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935zM3.504 1c.007.517.026 1.006.056 1.469.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.501.501 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667.03-.463.049-.952.056-1.469H3.504z"/>
                            </svg>
                        </div>

                        <div className = "col-lg-4 btn btn-dark btn-sm">
                            <h2> Backup </h2>

                            <svg xmlns = "http://www.w3.org/2000/svg" fill = "currentColor" className = "bi bi-cloud-arrow-up" viewBox = "0 0 16 16">
                                <path fillRule = "evenodd" d = "M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"/>
                                <path d = "M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }
}

// Settings menu with one fillable form and a submit button.
class SettingsComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    // Handles the "clear local storage" button press. 
    // Displays a confirm message.
    clearStorageHelper() {
        var yn = confirm("Are you sure you want to clear Local Storage? This will remove all solve and session data.");

        if(yn) {
            localStorage.clear();
            location.reload();
        }
    }

    // Syncs form values with internal variables.
    updateValues() {
        userdata.settings.DECIMAL_PLACES_DISP = parseInt(document.getElementById("digits").value);
        userdata.settings.TIMING_DELAY = parseInt(document.getElementById("delay").value);

        localStorage.setItem("data", JSON.stringify(userdata));
    }

    // Meat and potatoes, renders the HTML form
    // One Bootstrap "container" with form controls in "form-group"s
    // Submit and clear storage buttons are linked to functions.
    render() {
        var cD = userdata.settings.DECIMAL_PLACES_DISP;

        return (<div id = "overlay">
            <div className = "container">
                <div className = "black">
                    <h1> Settings </h1>
                    <br />
                    <form onSubmit = {this.updateValues}>
                        <div className = "form-group"></div>

                        <div className = "form-group row justify-content-center">
                            <label className = "col-4">
                                <h3> Digits Displayed Beyond Dec: </h3>
                            </label>

                            <select name = "settings-digits" className = "form-control-lg col-3" id = "digits" defaultValue = {cD}>
                                <option value = "0"> 0 </option>
                                <option value = "1"> 1 </option>
                                <option value = "2"> 2 </option>
                                <option value = "3"> 3 </option>
                                <option value = "4"> 4 </option>
                            </select>
                        </div>
                        <br />
                        <div className = "form-group row justify-content-center">
                            <label className = "col-4">
                                <h3> Timer Delay </h3>
                            </label>

                            <select name = "settings-delay" className = "form-control-lg col-3" id = "delay" defaultValue = {cD}>
                                <option value = "1"> 0.5s </option>
                                <option value = "2"> 1s </option>
                                <option value = "3"> 1.5s </option>
                                <option value = "4"> 2s </option>
                            </select>
                        </div>
                        <br />
                        <div className = "form-group row justify-content-center">
                            <h3 className = "col-3">
                                <input name = "settings-save" type = "submit" value = "Save" onClick = {this.updateValues}/>
                            </h3>
                        </div>
                        <br />
                        <div className = "form-group row justify-content-center">
                            <button className = "col-3 btn btn-dark" type = "button" onClick = {this.clearStorageHelper}>
                                <h3 style = {{color:"#FF0000"}}> Clear Local Storage </h3>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>);
    }
}

// Widgets Menu component [WIP]
class WidgetsComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div id = "overlay">
            <div className = "container">
                <div className = "black">
                    <h1> Widgets </h1>
                    <br />
                    <h2> Scramble Display </h2>
                    <br />
                    <h2> Time List </h2>
                </div>
            </div>
        </div>);
    }
}

// Statistics Menu component [WIP]
class StatisticsComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div id = "overlay">
            <div className = "container">
                <div className = "black">
                    <h1> Statistics </h1>
                    <br />
                    <h2> Mean </h2>
                    <br />
                    <h2> Interval Select </h2>
                </div>
            </div>
        </div>);
    }
}

// Component for the visual cube widget
// Utilizes features of twisty.js to render a customized 3D model.
class CubeWidget extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div className = "widget widget-SE">
            <h2> Scramble </h2>
            <twisty-player alg = {timerState.scramble} background = "none" viewer-link = "none" puzzle = "3x3x3"></twisty-player>
        </div>);
    }
}

// Component for the time list.
class ListWidget extends React.Component {
    constructor(props) {
        super(props);
    }

    // Function to fill a Bootstrap responsive table with all solves in session.

    // There are four toggleable widget settings, one for each type of value
    // that can be displayed - number, time, timestamp, and scramble.
    createTable() {
        let elementList = [];

        for(var i = 0; i < userdata.solves.length; i++) {
            if(i === userdata.solves.length) {
                break;
            }

            var solveNumZeroIndexed = userdata.solves.length - i - 1;
            var solveObj = userdata.solves[solveNumZeroIndexed];

            var l = [];

            // Not the cleanest looking solution here, but using ternary
            // operators and pushing null to the array resulted in some errors.
            if(userdata.settings.WIDGETS.list.solveNum) {
                l.push(<div className = "col-1"><h5>{solveNumZeroIndexed + 1}</h5></div>);
            } 

            if(userdata.settings.WIDGETS.list.time) {
                l.push(<div className = "col-2"><h5>{solveObj.time.toFixed(userdata.settings.DECIMAL_PLACES_DISP)}</h5></div>);
            } 

            if(userdata.settings.WIDGETS.list.stamp) {
                l.push(<div className = "col-4"><h6>{solveObj.timestamp.toString().substring(4,24)}</h6></div>);
            }

            if(userdata.settings.WIDGETS.list.scramble) {
                l.push(<div className = "col-5 nph"><small>{solveObj.scramble}</small></div>);
            }
            
            elementList.push(<div className="row"> {l} </div>);
        }
        return elementList;
    }

    // Render in table headers and the bulk of the table with createTable.
    render() {
        return(<div className = "widget widget-SW container">
            <h2> Time List </h2>
            <div className = "row mb-1">
                {userdata.settings.WIDGETS.list.solveNum ? <div className = "col-1 np-bottom nph"><h5 className = "nm">#</h5></div> : null}
                {userdata.settings.WIDGETS.list.time ? <div className = "col-2 np-bottom nph"><h5 className = "nm">Time</h5></div> : null}
                {userdata.settings.WIDGETS.list.stamp ? <div className = "col-4 np-bottom nph"><h5 className = "nm">Timestamp</h5></div> : null}
                {userdata.settings.WIDGETS.list.scramble ? <div className = "col-5 np-bottom nph"><h5 className = "nm">Scramble</h5></div> : null}
            </div>
            <hr className = "my-1"/>
            <div className = "container scroll">
                {this.createTable()}
            </div>
        </div>);
    }
}

// Render all components starting with the root (main) component.
setInterval(() => ReactDOM.render(<MainComponent />, document.getElementById('root')), 1);