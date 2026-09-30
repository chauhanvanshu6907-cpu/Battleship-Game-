/* =========================================
   BATTLESHIP GAME
   OPERATION: DEEP SEA
========================================= */

const BOARD_SIZE = 6;


/* =========================================
   GAME MODE
========================================= */

const gameMode =
    localStorage.getItem("gameMode") || "pvp";


/* =========================================
   LOAD FLEETS
========================================= */

const player1Fleet =
    JSON.parse(
        localStorage.getItem("player1Fleet")
    ) || [];


let player2Fleet =
    JSON.parse(
        localStorage.getItem("player2Fleet")
    ) || [];


/* =========================================
   CHECK PLAYER 1 FLEET
========================================= */

if (player1Fleet.length === 0) {

    alert("PLAYER 1 FLEET NOT FOUND.");

    window.location.href =
        "mode.html";
}


/* =========================================
   COMPUTER FLEET
========================================= */

if (
    gameMode === "pvc" &&
    player2Fleet.length === 0
) {

    player2Fleet = [

        {
            name: "Carrier",

            positions: [
                { row: 0, col: 0 },
                { row: 0, col: 1 },
                { row: 0, col: 2 }
            ]

        },

        {
            name: "Destroyer",

            positions: [
                { row: 3, col: 3 },
                { row: 4, col: 3 }
            ]

        },

        {
            name: "Submarine",

            positions: [
                { row: 5, col: 0 },
                { row: 5, col: 1 }
            ]

        }

    ];

}


/* =========================================
   EMPTY BOARD
========================================= */

function createEmptyBoard() {

    return Array.from(
        { length: BOARD_SIZE },
        () => Array(BOARD_SIZE).fill(null)
    );

}


/* =========================================
   BOARDS
========================================= */

const player1Board =
    createEmptyBoard();

const player2Board =
    createEmptyBoard();

const player1Shots =
    createEmptyBoard();

const player2Shots =
    createEmptyBoard();


/* =========================================
   LOAD SHIPS
========================================= */

function loadFleet(board, fleet) {

    fleet.forEach(ship => {

        ship.positions.forEach(position => {

            board[position.row][position.col] = {
                ship: ship.name
            };

        });

    });

}


loadFleet(
    player1Board,
    player1Fleet
);


loadFleet(
    player2Board,
    player2Fleet
);


/* =========================================
   GAME VARIABLES
========================================= */

let currentPlayer = 1;

let totalTurns = 0;

let totalHits = 0;

let totalMisses = 0;

let matchActive = true;


/* =========================================
   PAGE LOAD
========================================= */

window.addEventListener(
    "load",
    function () {

        const modeText =
            document.getElementById(
                "display-game-mode"
            );

        const title =
            document.getElementById(
                "gameArenaTitle"
            );


        if (modeText) {

            modeText.textContent =
                gameMode === "pvc"
                    ? "Vs Computer Bot"
                    : "Two Commander Battle";

        }


        if (title) {

            title.textContent =
                gameMode === "pvc"
                    ? "TACTICAL BOT ENGAGEMENT"
                    : "BATTLE ENGAGED";

        }


        refreshBoards();

        updateStatistics();

    }
);


/* =========================================
   CREATE GAME BOARD
========================================= */

function createGameBoard(
    elementId,
    board,
    shots,
    showShips,
    clickable
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.innerHTML = "";


    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            const cell =
                document.createElement("div");


            cell.className =
                "game-cell";


            /* =================================
               IMPORTANT:
               SHIPS ARE HIDDEN DURING PVP
            ================================= */

            if (
                showShips &&
                board[row][col]
            ) {

                cell.classList.add(
                    "ship"
                );

                cell.textContent =
                    "⚓";

            }


            /* =================================
               HIT
            ================================= */

            if (
                shots[row][col] === "hit"
            ) {

                cell.classList.add(
                    "hit"
                );

                cell.textContent =
                    "✦";

            }


            /* =================================
               MISS
            ================================= */

            else if (
                shots[row][col] === "miss"
            ) {

                cell.classList.add(
                    "miss"
                );

                cell.textContent =
                    "•";

            }


            /* =================================
               ATTACK
            ================================= */

            if (
                clickable &&
                matchActive &&
                !shots[row][col]
            ) {

                cell.addEventListener(
                    "click",
                    function () {

                        attack(
                            row,
                            col
                        );

                    }
                );

            }


            if (
                shots[row][col]
            ) {

                cell.classList.add(
                    "disabled"
                );

            }


            element.appendChild(cell);

        }

    }

}


/* =========================================
   REFRESH BOARDS
========================================= */

function refreshBoards() {

    const p1Arena =
        document.getElementById(
            "p1-arena-block"
        );

    const p2Arena =
        document.getElementById(
            "p2-arena-block"
        );


    /* =====================================
       PLAYER VS COMPUTER
    ===================================== */

    if (gameMode === "pvc") {

        p1Arena.style.display =
            "block";

        p2Arena.style.display =
            "none";


        createGameBoard(
            "p1-attack-grid",

            player2Board,

            player1Shots,

            false,

            true
        );


        createGameBoard(
            "p1-defense-grid",

            player1Board,

            player2Shots,

            true,

            false
        );


        document.getElementById(
            "turnPlayer"
        ).textContent =
            "YOUR TURN — COMMANDER 01";


        return;
    }


    /* =====================================
       PLAYER 1 TURN
    ===================================== */

    if (currentPlayer === 1) {

        p1Arena.style.display =
            "block";

        p2Arena.style.display =
            "none";


        /* P1 ATTACK BOARD
           ENEMY SHIPS HIDDEN */

        createGameBoard(
            "p1-attack-grid",

            player2Board,

            player1Shots,

            false,

            true
        );


        /* P1 DEFENSE BOARD
           OWN SHIPS ALSO HIDDEN
           BECAUSE THIS IS ONE SHARED SCREEN */

        createGameBoard(
            "p1-defense-grid",

            player1Board,

            player2Shots,

            false,

            false
        );


        document.getElementById(
            "turnPlayer"
        ).textContent =
            "PLAYER 1 — YOUR TURN";

    }


    /* =====================================
       PLAYER 2 TURN
    ===================================== */

    else {

        p1Arena.style.display =
            "none";

        p2Arena.style.display =
            "block";


        /* P2 ATTACK BOARD
           ENEMY SHIPS HIDDEN */

        createGameBoard(
            "p2-attack-grid",

            player1Board,

            player2Shots,

            false,

            true
        );


        /* P2 DEFENSE BOARD
           OWN SHIPS ALSO HIDDEN
           BECAUSE THIS IS ONE SHARED SCREEN */

        createGameBoard(
            "p2-defense-grid",

            player2Board,

            player1Shots,

            false,

            false
        );


        document.getElementById(
            "turnPlayer"
        ).textContent =
            "PLAYER 2 — YOUR TURN";

    }

}


/* =========================================
   ATTACK
========================================= */

function attack(row, col) {

    if (!matchActive) {
        return;
    }


    let enemyBoard;

    let currentShots;


    if (currentPlayer === 1) {

        enemyBoard =
            player2Board;

        currentShots =
            player1Shots;

    }

    else {

        enemyBoard =
            player1Board;

        currentShots =
            player2Shots;

    }


    if (
        currentShots[row][col]
    ) {
        return;
    }


    totalTurns++;


    /* =====================================
       HIT
    ===================================== */

    if (
        enemyBoard[row][col]
    ) {

        currentShots[row][col] =
            "hit";

        totalHits++;


        showStatus(
            "🎯 DIRECT HIT! Enemy fleet damaged."
        );

    }


    /* =====================================
       MISS
    ===================================== */

    else {

        currentShots[row][col] =
            "miss";

        totalMisses++;


        showStatus(
            "○ MISS — No target detected."
        );

    }


    updateStatistics();


    /* =====================================
       WINNER
    ===================================== */

    if (
        checkWinner(
            enemyBoard,
            currentShots
        )
    ) {

        finishGame();

        return;

    }


    /* =====================================
       COMPUTER
    ===================================== */

    if (
        gameMode === "pvc"
    ) {

        matchActive = false;


        document.getElementById(
            "turnPlayer"
        ).textContent =
            "COMPUTER BOT — CALCULATING...";


        setTimeout(
            computerMove,
            900
        );


        return;
    }


    

    /* =====================================
       CHANGE PLAYER
    ===================================== */

    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;


    refreshBoards();

}


/* =========================================
   COMPUTER MOVE
========================================= */

function computerMove() {

    let row;

    let col;


    do {

        row =
            Math.floor(
                Math.random() *
                BOARD_SIZE
            );

        col =
            Math.floor(
                Math.random() *
                BOARD_SIZE
            );

    }

    while (
        player2Shots[row][col]
    );


    totalTurns++;


    if (
        player1Board[row][col]
    ) {

        player2Shots[row][col] =
            "hit";

        totalHits++;


        showStatus(
            "💥 COMPUTER HIT YOUR FLEET."
        );

    }

    else {

        player2Shots[row][col] =
            "miss";

        totalMisses++;


        showStatus(
            "• COMPUTER MISSED."
        );

    }


    if (
        checkWinner(
            player1Board,
            player2Shots
        )
    ) {

        finishGame(true);

        return;

    }


    matchActive = true;


    refreshBoards();

    updateStatistics();

}


/* =========================================
   CHECK WINNER
========================================= */

function checkWinner(
    board,
    shots
) {

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            if (
                board[row][col] &&
                shots[row][col] !== "hit"
            ) {

                return false;

            }

        }

    }


    return true;

}


/* =========================================
   STATUS
========================================= */

function showStatus(message) {

    const status =
        document.getElementById(
            "battleStatus"
        );


    if (status) {

        status.textContent =
            message;

    }

}


/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {

    let p1Remaining = 0;

    let p2Remaining = 0;


    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            if (
                player1Board[row][col] &&
                player2Shots[row][col] !== "hit"
            ) {

                p1Remaining++;

            }


            if (
                player2Board[row][col] &&
                player1Shots[row][col] !== "hit"
            ) {

                p2Remaining++;

            }

        }

    }


    const p1Health =
        document.getElementById(
            "p1-fleet-health"
        );


    const p2Health =
        document.getElementById(
            "p2-fleet-health"
        );


    if (p1Health) {

        p1Health.textContent =
            p1Remaining > 0
                ? Math.ceil(
                    p1Remaining / 7 * 100
                ) + "%"
                : "SUNK";

    }


    if (p2Health) {

        p2Health.textContent =
            p2Remaining > 0
                ? Math.ceil(
                    p2Remaining / 7 * 100
                ) + "%"
                : "SUNK";

    }

}


/* =========================================
   FINISH GAME
========================================= */

function finishGame(
    computerWon = false
) {

    matchActive = false;


    let winner;


    if (
        gameMode === "pvc"
    ) {

        winner =
            computerWon
                ? "COMPUTER BOT"
                : "COMMANDER 01";

    }

    else {

        winner =
            currentPlayer === 1
                ? "COMMANDER 01"
                : "COMMANDER 02";

    }


    localStorage.setItem(
        "winner",
        winner
    );


    localStorage.setItem(
        "totalHits",
        totalHits
    );


    localStorage.setItem(
        "totalMisses",
        totalMisses
    );


    localStorage.setItem(
        "totalTurns",
        totalTurns
    );


    setTimeout(
        function () {

            window.location.href =
                "result.html";

        },
        1000
    );

}