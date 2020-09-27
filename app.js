var express = require('express');
var app = express();
app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(express.json())
var fs = require("fs");


//Global Variables
var MaxColLen = 7
var MaxRowLen = 6
var user1 = "Red";
var user2 = "Yellow";
var winner = "";




app.get('/connect4/games/:gameid/users/:userid/steps', function (req, res) {
    //reading file
    var obj = fileRead();
    var games = obj.games;

    //reading params
    var gameId = req.params['gameid'];
    var userId = req.params['userid'];
    var response;
    var gameIndex = findGamesIndex(games, gameId);
    if (gameIndex > -1) {
        var gameObj = games[gameIndex]
        if (userId == "user1") {
            response = gameObj.user1Moves;
        }
        if (userId == "user2") {
            response = gameObj.user2Moves;
        }

    }
    res.end(response.toString());
})

app.get('/connect4/games/:gameid/users/:userid/:col', function (req, res) {
    //reading file
    var obj = fileRead();
    var games = obj.games;

    //reading params
    var gameId = req.params['gameid'];
    var userId = req.params['userid'];
    var col = req.params['col'];

    //error message
    var errorMessage = ""
    var validMoveInd = false

    //fetching game related info
    var gameIndex = findGamesIndex(games, gameId);
    console.log("game index", gameIndex);

    //validating gameId
    if (gameIndex > -1) {
        var gameObj = games[gameIndex]
        if (gameObj.win == "Yellow" || gameObj.win == "RED") {
            res.send(gameObj.win + "Wins")
        }
        if (gameObj.previousUser != userId) {
            if (userId == "user1" || userId == "user2") {
                validMoveInd = validateMoves(col, gameObj);
                if (validMoveInd == true) {
                    gameObj.previousUser = userId;
                    gameObj = dropCoin(col, userId, gameObj);
                }
            } else {
                errorMessage = "Please Enter Valid UserId"


            }
        } else {
            errorMessage = " It is another players turn "
        }


    } else {
        errorMessage = "Please Enter Valid GameID"
    }


    if (validMoveInd) {
        var win = validateWin(gameObj.board);
        if (win) {
            if (gameObj.win != "Red" || gameObj.win != "Yellow") {
                if (userId == "user1") {
                    gameObj.win = "Red";
                } else {
                    gameObj.win = "yellow";
                }
            }
            res.end("user :  " + gameObj.win + " wins");
        } else {
            res.end("valid");
        }
    } else {
        res.end("Invalid  --  Error Message : " + errorMessage)
    }

    obj.games[gameIndex] = gameObj;
    //writing to json;
    fileWrite(obj);

    res.end("Hello");
})


app.get("/connect4/start", function (req, res) {
    var obj = fileRead();
    var userName = "game" + obj.userCount;
    obj.userCount = obj.userCount + 1;
    var newData = newUserCreation(obj, userName);
    fileWrite(newData);
    res.end("your gameId : " + userName + " Players User ID's : user1 , user2 ");
})


//------------------------------------------------------------------------

function findGamesIndex(games, gameId) {
    var index = -1;
    for (var i = 0; i < games.length; i++) {
        if (games[i].gameName == gameId) {
            index = i;
        }
    }
    return index;
}

function fileRead() {
    var obj = JSON.parse(fs.readFileSync('Result.json', 'utf8'));
    return obj
}

function fileWrite(data) {
    fs.writeFileSync('Result.json', JSON.stringify(data));
}

function validateWin(a) {
    var win = false;
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 4; j++) {
            try {
                if (a[i][j] != '-') {
                    if (a[i][j] == a[i][j + 1] && a[i][j] == a[i][j + 2] && a[i][j] == a[i][j + 3]) {
                        win = true;
                    }
                    if (a[i][j] == a[i + 1][j] && a[i][j] == a[i + 2][j] && a[i][j] == a[i + 3][j]) {
                        win = true;
                    }
                    if (a[i][j] == a[i + 1][j + 1] && a[i][j] == a[i + 2][j + 2] && a[i][j] == a[i + 3][j + 3]) {
                        win = true;
                    }
                }

            } catch (e) {
            }
        }
    }
    return win;
}

function validateMoves(col, a) {
    var valid = false;
    try {
        if (a.board[col][MaxColLen - 1] != 'Red' && a.board[col][MaxRowLen - 1] != 'Yellow' && col < MaxColLen) {
            valid = true;
        }
    } catch (e) {

    }
    return valid;
}

function dropCoin(col, user, gameObj) {
    var ind = gameObj.board[col].indexOf('-');
    if (ind > -1) {
        if (user == "user1") {
            gameObj.board[col][ind] = user1;
            gameObj.user1Moves.push(col);

        } else {
            gameObj.board[col][ind] = user2;
            gameObj.user2Moves.push(col);
        }
    }
    return gameObj
}

function newUserCreation(data, userName) {
    var newUserId = userName;
    var board = new Array(MaxColLen);
    var row = new Array(MaxRowLen);
    row.fill('-')
    board.fill(row);
    var gameObj = {
        "gameName": newUserId,
        "board": board,
        "user1Moves": [],
        "user2Moves": [],
        "previousUser": "-",
        "Winner": ""
    }
    console.log(data)
    data.games.push(gameObj);
    return data;
}


var server = app.listen(8084, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Connect 4  app listening at http://%s:%s", host, port)
})