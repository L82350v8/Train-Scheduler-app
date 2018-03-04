
// ======================================< initialize firebase >=================================== // 
var config = {
    apiKey: "AIzaSyAnkTellYaOD5125j3VXqqaKgVDITxj4Dw",
    authDomain: "l82350v8-trainschedules.firebaseapp.com",
    databaseURL: "https://l82350v8-trainschedules.firebaseio.com",
    projectId: "l82350v8-trainschedules",
    storageBucket: "l82350v8-trainschedules.appspot.com",
    messagingSenderId: "598173653605"
};
firebase.initializeApp(config);

var database = firebase.database();

var connectionsRef = firebase.database().ref("/connections");
var connectedRef = firebase.database().ref(".info/connected");
// ======================================< variables >============================================= // 

var currDateTime = "";
var trainName = "";
var trainDestination = "";
var trainFirstTime = "";
var trainFrequency = 0;
var minsTilArrival = 0;
var nextArrivalTime = "";

// ======================================< functions >============================================ // 

// CHANGE ALERTS TO USE MODALS !! 

function getTrainInput() {
    trainName = $("#train-name-input").val().trim();
    if (trainName === "") {
        alert("The Train Name field cannot equal spaces.\nPlease enter a valid train name.")
    }
    $("#train-name-input").val('');
    trainDestination = $("#train-destination-input").val().trim();
    if (trainDestination === "") {
        alert("The Train Destination field cannot equal spaces.\nPlease enter a valid destination name.")
    }

    $("#train-destination-input").val('');
    trainFirstTime = $("#train-first-time-input").val().trim();
    $("#train-first-time-input").val('');
    if (trainFirstTime === "") {
        alert("The First Train Time cannot equal spaces or alphabetic characters.\nPlease enter a valid first train time.")
    }

    trainFrequency = parseInt($("#train-frequency-input").val().trim());
    $("#train-frequency-input").val('');
    if (trainFrequency === "") {
        alert("The Train Frequency field cannot equal spaces or alphabetic characters.\nPlease enter a valid train time frequency - in minutes.")
    }
}

function calcNextArrival() {
    // get first train time.
    var firstTimeCnv = moment(trainFirstTime, "HH:mm").subtract(1, "years");
    // get current time. 
    var currTime = moment();
    var currTimeCnv = moment(currTime).format("HH:mm");
    var diffTime = moment().diff(moment(firstTimeCnv), "minutes");
    // Time apart (remainder)
    var tRemainder = diffTime % trainFrequency;
    // Minute Until Train
    minsTilArrival = trainFrequency - tRemainder;
    // Next Train
    nextArrivalTime = moment().add(minsTilArrival, "minutes").format("hh:mm");
}

function addNewTrain() {
    if (trainName !== "" &&
        trainDestination !== "" &&
        trainFirstTime !== "" &&
        trainFrequency !== "") {

        calcNextArrival();

        database.ref().push({
            train_name: trainName,
            train_dest: trainDestination,
            train_first_time: trainFirstTime,
            train_frequency: trainFrequency,
            mins_til_arrival: minsTilArrival,
            next_arrival_time: nextArrivalTime,
            record_added: firebase.database.ServerValue.TIMESTAMP
        })
    }
}

function getDateTime() {
    currDateTime = moment().format('MMMM Do YYYY, h:mm a');
    $("#curr-date-time").html(currDateTime);
}

// ======================================< main process >============================================ // 

setInterval(getDateTime, 500);

connectedRef.on("value", function (snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
    }
});

$("#add-train-btn").on("click", function (event) {
    event.preventDefault();
    getTrainInput();
    addNewTrain();
});

database.ref().orderByChild("mins_til_arrival").on("child_added", function (snapshot) {
    var tBody = $("tbody");
    var tRow = $("<tr>");

    var trainNameRow = $("<td>").text(snapshot.val().train_name);
    var trainDestRow = $("<td>").text(snapshot.val().train_dest);
    var trainFreqRow = $("<td>").text(snapshot.val().train_frequency);
    var nextArrivalRow = $("<td>").text(snapshot.val().next_arrival_time);
    var minsTilArrivalRow = $("<td>").text(snapshot.val().mins_til_arrival);
    tRow.addClass("table-borderless");
    tRow.append(trainNameRow, trainDestRow, trainFreqRow, nextArrivalRow, minsTilArrivalRow);

    tBody.append(tRow);
})
