define(() => ({
    getInstance: function () {
        return game;
    }
}));

//constants
const AMOUNT_OF_TILES = 16;

const BUTTON_DOWN = 40;
const BUTTON_UP = 38;
const BUTTON_LEFT = 37;
const BUTTON_RIGHT = 39;

const INTERVAL_1_SEC = 1000;

let game = {
    //Move counter
    moveCounter: 0,
    //Game timer
    timer: null,
    //Time counter in seconds
    timePassed: 0,
    //Mapping index offset when making a move
    moves: {up: -4, left: -1, down: 4, right: 1},
    //Randomize input
    order: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].sort(() => Math.random() - .5).concat(0),
    //Index of empty tile
    hole: 15,

    /**
     * Initial setup: draws layout, creates bindings, checks if game is solvable and adds event listener
     */
    initialize: function initialize() {

        let gameArea = drawLayout();

        let moveCounter = document.getElementById('move-counter');
        createBinding(game, "moveCounter", moveCounter, 'innerHTML');

        game.timer = setInterval(updateTimer, INTERVAL_1_SEC);

        //if game is unsolvable, make it solvable
        console.log(game.solvable(game.order));
        if (!game.solvable(game.order)) {
            game.swap(0, 1);
        }

        redraw(gameArea);
        window.addEventListener('keydown', function (e) {
            //This is deprecated and requires additional steps to achieve cross browser support
            gameMove(e.keyCode);

            redraw(gameArea);
            checkFinished();
        });
    },
    /**
     * Check if input is solvable
     * Game instance is solvable if number of inversions is even
     */
    solvable: array => {
        let invCount = getInversionCount(array);
        return !(invCount % 2);
    },

    /**
     * Check if game is finished
     * @return {boolean} true if game is finished
     */
    isFinished: function() {
        return !this.order.some((item, i) => {
            return item > 0 && item - 1 !== i;
        });
    },
    /**
     * Trades places of tiles
     * @param tile1
     * @param tile2
     */
    swap: function(tile1, tile2) {
        let temp = this.order[tile1];
        this.order[tile1] = this.order[tile2];
        this.order[tile2] = temp;
    },

    /**
     * Makes a move
     * @param step represents index offset depending on which direction step is performing
     * @returns {boolean} true if step was successful, false if step cant be performed
     */
    move: function(step) {
        let index = this.hole + step;

        //check if step is viable
        if (!this.order[index]) {
            return false;
        }

        if (step === game.moves.left || step === game.moves.right) {
            if (Math.floor(this.hole / 4) !== Math.floor(index / 4)) {
                return false;
            }
        }

        this.swap(index, this.hole);
        this.hole = index;
        game.moveCounter++;
        return true;
    }
};

/**
 * Creates initial layout
 * @return HTMLElement created game area
 */
function drawLayout() {
    let gameArea = document.getElementById('game-area');
    for (let i = 0; i < AMOUNT_OF_TILES; i++) {
        gameArea.appendChild(document.createElement('div'));
    }

    return gameArea;
}

/**
 * Fills tiles with values
 */
function redraw(gameArea) {
    //iterate through tiles and fill them with  values
    for (let i = 0; i < AMOUNT_OF_TILES; i++) {
        let tile = gameArea.childNodes[i];
        tile.textContent = game.order[i];

        //hide empty tile
        tile.style.visibility = game.order[i] === 0 ? 'hidden' : 'visible';
    }
}

function gameMove(keyCode) {
    switch (keyCode) {
        case BUTTON_LEFT:
            game.move(game.moves['right']);
            break;

        case BUTTON_UP:
            game.move(game.moves['down']);
            break;

        case BUTTON_RIGHT:
            game.move(game.moves['left']);
            break;

        case BUTTON_DOWN:
            game.move(game.moves['up']);
            break;

        default:
            console.log('incorrect key');
            break;
    }
}

function checkFinished() {
    if (game.isFinished()) {
        let win = document.body.appendChild(document.createElement('div'));
        win.textContent = 'Game finished!';
        window.removeEventListener('keydown', arguments.callee);
        clearInterval(game.timer);
    }
}

/**
 * Utility function to count inversions in given array
 * @param array
 * @returns number of inversions in array
 */
function getInversionCount(array) {
    let invCount = 0;
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = i + 1; j < array.length; j++) {
            //count pairs (i, j) where i appears before j but i > j
            if (array[i] && array[j] && array[i] > array[j]) {
                invCount++;
            }
        }
    }
    return invCount;
}

/**
 * Creates one way binding for object's property and element's attribute
 * @param object parent
 * @param property to bind
 * @param element which will display bind value
 * @param attribute of element to insert bind value
 */
function createBinding(object, property, element, attribute) {
    let _this = this;
    this.element = element;
    this.value = object[property];
    this.attribute = attribute;

    this.valueGetter = () => {
        return _this.value;
    };

    this.valueSetter = (value) => {
        _this.value = value;
        _this.element[_this.attribute] = value;
    };

    Object.defineProperty(object, property, {
        get: this.valueGetter,
        set: this.valueSetter
    });

    object[property] = this.value;
    this.element[this.attribute] = this.value;
}

/**
 * Updates time counter and reflects on UI
 */
function updateTimer() {
    game.timePassed++;
    let element = document.getElementById('game-timer');
    element.textContent = game.timePassed;
}