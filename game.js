/* =========================================
   BATTLESHIP
   OPERATION: DEEP SEA
   GAME JAVASCRIPT
   ========================================= */


/* =========================================
   GAME SETTINGS
   ========================================= */

const BOARD_SIZE = 6;


/* =========================================
   LOAD PLAYER FLEETS
   ========================================= */

const player1Fleet =
    JSON.parse(
        localStorage.getItem("player1Fleet")
    ) || [];


const player2Fleet =
    JSON.parse(
        localStorage.getItem("player2Fleet")
    ) || [];


/* =========================================
   CHECK FLEETS
   ========================================= */

if (
    player1Fleet.length === 0 ||
    player2Fleet.length === 0
) {

    alert(
        "Fleet data not found. Please deploy both fleets first."
    );

    window.location.href =
        "mode.html";
}


/* =========================================
   GAME VARIABLES
   ========================================= */

let currentPlayer = 1;

let totalTurns = 0;

let totalHits = 0;

let totalMisses = 0;


/*
 * Attacks made by each commander.
 */

let player1Shots =
    createEmptyBoard();

let player2Shots =
    createEmptyBoard();


/* =========================================
   CREATE EMPTY BOARD
   ========================================= */

function createEmptyBoard() {

    const board = [];

    for (
        let row = 0;
        row < BOARD_SIZE;
        row++
    ) {

        board[row] = [];

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            board[row][col] = null;

        }

    }

    return board;
}


/* =========================================
   CREATE PLAYER BOARDS
   ========================================= */

const player1Board =
    createEmptyBoard();

const player2Board =
    createEmptyBoard();


/* =========================================
   LOAD SHIPS INTO BOARD
   ========================================= */

function loadFleet(
    board,
    fleet
) {

    fleet.forEach(ship => {

        ship.positions.forEach(position => {

            board[
                position.row
            ][
                position.col
            ] = ship.name;

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
   CREATE GAME BOARD
   ========================================= */

function createGameBoard(
    elementId,
    board,
    attacks,
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
                document.createElement(
                    "div"
                );


            cell.className =
                "game-cell";


            cell.dataset.row = row;

            cell.dataset.col = col;


            /* =========================
               SHOW OWN SHIPS
               ========================= */

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


            /* =========================
               SHOW HIT
               ========================= */

            if (
                attacks[row][col] ===
                "hit"
            ) {

                cell.classList.add(
                    "hit"
                );

                cell.textContent =
                    "✦";

            }


            /* =========================
               SHOW MISS
               ========================= */

            if (
                attacks[row][col] ===
                "miss"
            ) {

                cell.classList.add(
                    "miss"
                );

                cell.textContent =
                    "•";

            }


            /* =========================
               CLICKABLE ENEMY CELL
               ========================= */

            if (clickable) {

                if (
                    !attacks[row][col]
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

                } else {

                    cell.classList.add(
                        "disabled"
                    );

                }

            }


            element.appendChild(cell);

        }

    }

}


/* =========================================
   REFRESH BOTH BOARDS
   ========================================= */

function refreshBoards() {

    /*
     * Current player's own fleet.
     */

    if (currentPlayer === 1) {

        createGameBoard(
            "myBoard",
            player1Board,
            player2Shots,
            true,
            false
        );


        createGameBoard(
            "enemyBoard",
            player2Board,
            player1Shots,
            false,
            true
        );

    } else {

        createGameBoard(
            "myBoard",
            player2Board,
            player1Shots,
            true,
            false
        );


        createGameBoard(
            "enemyBoard",
            player1Board,
            player2Shots,
            false,
            true
        );

    }

}


/* =========================================
   ATTACK FUNCTION
   ========================================= */

function attack(
    row,
    col
) {

    let enemyBoard;

    let currentShots;


    /* =========================
       SELECT ENEMY
       ========================= */

    if (currentPlayer === 1) {

        enemyBoard =
            player2Board;

        currentShots =
            player1Shots;

    } else {

        enemyBoard =
            player1Board;

        currentShots =
            player2Shots;

    }


    /* =========================
       PREVENT REPEAT ATTACK
       ========================= */

    if (
        currentShots[row][col]
    ) {

        setEnemyStatus(
            "⚠ This coordinate has already been attacked."
        );

        return;

    }


    /* =========================
       COUNT TURN
       ========================= */

    totalTurns++;


    /* =========================
       CHECK HIT / MISS
       ========================= */

    if (
        enemyBoard[row][col]
    ) {

        currentShots[row][col] =
            "hit";

        totalHits++;


        setEnemyStatus(
            "🎯 DIRECT HIT! Enemy ship damaged."
        );

    } else {

        currentShots[row][col] =
            "miss";

        totalMisses++;


        setEnemyStatus(
            "○ MISS — Nothing but water."
        );

    }


    /* =========================
       UPDATE SCREEN
       ========================= */

    updateStatistics();

    refreshBoards();


    /* =========================
       CHECK WINNER
       ========================= */

    if (
        checkWinner(
            enemyBoard,
            currentShots
        )
    ) {

        finishGame();

        return;

    }


    /* =========================
       CHANGE PLAYER
       ========================= */

    currentPlayer =
        currentPlayer === 1
            ? 2
            : 1;


    updateTurn();


    /*
     * Show secure handover.
     */

    setTimeout(
        showHandover,
        350
    );

}


/* =========================================
   CHECK IF ALL SHIPS ARE DESTROYED
   ========================================= */

function checkWinner(
    enemyBoard,
    attacks
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

            /*
             * If a ship cell has not
             * been hit, the battle
             * is still continuing.
             */

            if (
                enemyBoard[row][col] &&
                attacks[row][col] !==
                "hit"
            ) {

                return false;

            }

        }

    }


    return true;

}


/* =========================================
   FINISH GAME
   ========================================= */

function finishGame() {

    const winner =
        `COMMANDER 0${currentPlayer}`;


    /*
     * Save final result.
     */

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


    /*
     * Hide handover if it is open.
     */

    const handover =
        document.getElementById(
            "handoverScreen"
        );


    if (handover) {

        handover.style.display =
            "none";

    }


    /*
     * Small delay so the
     * final hit can be seen.
     */

    setTimeout(
        function () {

            window.location.href =
                "result.html";

        },
        900
    );

}


/* =========================================
   UPDATE TURN
   ========================================= */

function updateTurn() {

    const turnPlayer =
        document.getElementById(
            "turnPlayer"
        );


    if (!turnPlayer) {
        return;
    }


    turnPlayer.textContent =
        `COMMANDER 0${currentPlayer}`;

}


/* =========================================
   UPDATE STATISTICS
   ========================================= */

function updateStatistics() {

    const hitCount =
        document.getElementById(
            "hitCount"
        );


    const missCount =
        document.getElementById(
            "missCount"
        );


    const turnCount =
        document.getElementById(
            "turnCount"
        );


    if (hitCount) {

        hitCount.textContent =
            totalHits;

    }


    if (missCount) {

        missCount.textContent =
            totalMisses;

    }


    if (turnCount) {

        turnCount.textContent =
            totalTurns;

    }

}


/* =========================================
   ENEMY STATUS
   ========================================= */

function setEnemyStatus(
    message
) {

    const status =
        document.getElementById(
            "enemyStatus"
        );


    if (status) {

        status.textContent =
            message;

    }

}


/* =========================================
   SHOW HANDOVER
   ========================================= */

function showHandover() {

    const screen =
        document.getElementById(
            "handoverScreen"
        );


    const text =
        document.getElementById(
            "handoverText"
        );


    if (!screen) {
        return;
    }


    if (text) {

        text.textContent =
            `Pass the device to COMMANDER 0${currentPlayer}. Do not reveal your fleet positions.`;

    }


    screen.style.display =
        "flex";

}


/* =========================================
   CONTINUE TURN
   ========================================= */

function continueTurn() {

    const screen =
        document.getElementById(
            "handoverScreen"
        );


    if (screen) {

        screen.style.display =
            "none";

    }


    updateTurn();

    refreshBoards();


    setEnemyStatus(
        "🎯 Select an enemy coordinate to fire."
    );

}


/* =========================================
   INITIAL GAME SETUP
   ========================================= */

updateTurn();

updateStatistics();

refreshBoards();


setEnemyStatus(
    "🎯 Select an enemy coordinate to fire."
);


/* =========================================
   OPTIONAL CLEANUP
   ========================================= */

/*
 * Prevent accidental browser refresh
 * from clearing the game state.
 *
 * The fleets are safely stored in
 * localStorage.
 */