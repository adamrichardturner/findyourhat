const _ = require("lodash")

const prompt = require('prompt-sync')({
    sigint: true
});

const {
    startsWith
} = require("lodash");

const hatChar = '^';
const hole = 'O';
const fieldChar = '░';
const pathChar = '*';
const visited = 'x';


class Field {
    constructor(field) {
        this._field = field;
    }

    playGame() {
        let play = true;
        let field = this._field;
        let startLoci = this.startLoci;
        let x = startLoci[0][0];
        let y = startLoci[1][0];
        console.log('x at start is: ' + x, 'y at start is ' + y);
        while (play) {
            this.print();
            const answer = prompt('Which way do you want to go? ').toUpperCase();
            switch (answer) {
                case 'W':
                    y -= 1;
                    break;
                case 'D':
                    x += 1;
                    break;
                case 'S':
                    y += 1;
                    break;
                case 'A':
                    x -= 1;
                    break;
                default:
                    console.log('Enter W A D or S.');
                    break;
            }
            if (x < 0 || x >= field[0].length) {
                console.log('Off the grid!');
                play = false;
                break;
            } else if (y < 0 || y >= field.length) {
                console.log('Off the grid');
                play = false;
                break;
            } else if (field[y][x] === hatChar) {
                console.log('You found your hat!!!');
                play = false;
                break;
            } else if (field[y][x] === hole) {
                console.log('Oops you fell down a hole!');
                play = false;
                break;
            } else {
                field[y][x] = pathChar;
            }

        }
    }

    print() {
        // Print as an array
        this._field.forEach(n => {
            console.log(n)
        });

        //Print as a joined string
        // const fieldString = this._field.join(' \n');
        // console.log(fieldString);
    }

    get startLoci() {
        // Find the start loci of the * and store it in 
        // an array as yx
        let start = [];
        let fields = this._field;
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            for (let j = 0; j < field.length; j++) {
                if (field[j] === pathChar) {
                    start.push([j]);
                    start.push([i]);
                }
            }
        }
        return start;
    }

    get hatLoci() {
        let start = [];
        let fields = this._field;
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            for (let j = 0; j < field.length; j++) {
                if (field[j] === hatChar) {
                    start.push([j]);
                    start.push([i]);
                }
            }
        }
        return start;
    }

    promptUser() {
        const answer = prompt('Which way do you want to go? ').toUpperCase();
        switch (answer) {
            case 'W':
                this._locationY -= 1;
                break;
            case 'D':
                this._locationX += 1;
                break;
            case 'S':
                this._locationY += 1;
                break;
            case 'A':
                this._locationX -= 1;
                break;
            default:
                console.log('Enter W A D or S.');
                this.promptUser();
                break;
        }
    }

    static generateField(width, height, percent) {
        // Assemble area with width and height
        // Assemble percent of area to be covered in 
        // field chars
        const area = width * height;
        const percentage = (area / 100) * percent;

        let field = []; // The final field generated

        // Generate an index for a hat locus
        const generateHatLoc = () => {
            const hatLoc = Math.floor(Math.random(0) * area);
            return hatLoc;
        }
        // Generate index for a start locus
        const generateStartLoc = () => {
            let startLoc = Math.floor(Math.random(0) * area);
            return startLoc;
        }

        // Shuffle the field randomly
        const shuffle = (arr) => {
            arr.sort(() => Math.random() - 0.5);
            return arr;
        }

        // Sanitise field start location (*), hat and hole locations
        // so they don't overlap (start in same indexes) and return 
        // an array ready to be spliced into smaller equally sized
        // arrays determined by width, to create a 2D maze.
        const sanitiseStart = (area) => {
            let hat = generateHatLoc();
            let start = generateStartLoc();
            let arr = [];
            let finalField = [];
            if (hat === start) {
                arr.push(Math.floor(Math.random() * area));
                arr.push(Math.floor(Math.random() * area));
            } else {
                arr.push(hat);
                arr.push(start);
            }
            // Generate hole location which does not overlap with hat or start
            const generateRandomHoles = (min, max) => {
                let num = Math.floor(Math.random() * (max - min + 1)) + min;
                return (num === hat || num === start) ? generateRandomHoles(min, max) : num;
            }
            // Generate the field with appropriate holes (as a percentage) of the total
            // positions available in the field.
            for (let i = 0; i < area; i++) {
                if (i === arr[0]) {
                    finalField.push(hatChar);
                } else if (i === arr[1]) {
                    finalField.push(pathChar);
                } else if (finalField.length <= percentage) {
                    finalField.push(hole);
                } else {
                    finalField.push(fieldChar);
                }
            }

            return finalField;
        }

        field = sanitiseStart(area);

        field = shuffle(field);
        field = shuffle(field);
        field = shuffle(field);
        field = shuffle(field);
        // Splice the field arr into appropriate broken down arrays
        // by width of the field. Now we have a 'valid' field but we 
        // need to confirm paths are accessible to the goal using 
        // path finding algo before returning it from the static
        // method

        for (let i = 0; i < field.length; i++) {
            field.push(field.splice(0, width));
        }

        // Finds start location in 2D array
        const findStartLocation = (fields) => {
            let start = [];
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                for (let j = 0; j < field.length; j++) {
                    if (field[j] === pathChar) {
                        start.push([i]);
                        start.push([j]);
                    }
                }
            }
            return start;
        };

        // Start location will be in the following format:
        // [distanceFromTop, distanceFromLeft]
        const findShortestPath = (startCoordinates, grid) => {
            let distanceFromTop = startCoordinates[0][0];
            let distanceFromLeft = startCoordinates[1][0];

            // Each "location" will store its coordinates
            // and the shortest path required to arrive there
            let location = {
                distanceFromTop: distanceFromTop,
                distanceFromLeft: distanceFromLeft,
                path: [],
                status: 'Start'
            };

            // Initialize the queue with the start location already inside
            let queue = [location];

            // Loop through the grid searching for the goal
            while (queue.length > 0) {
                // Take the first location off the queue
                let currentLocation = queue.shift();

                // Explore North
                let newLocation = exploreInDirection(currentLocation, 'North', grid);
                if (newLocation.status === 'Goal') {
                    return newLocation.path;
                } else if (newLocation.status === 'Valid') {
                    queue.push(newLocation);
                }

                // Explore East
                newLocation = exploreInDirection(currentLocation, 'East', grid);
                if (newLocation.status === 'Goal') {
                    return newLocation.path;
                } else if (newLocation.status === 'Valid') {
                    queue.push(newLocation);
                }

                // Explore South
                newLocation = exploreInDirection(currentLocation, 'South', grid);
                if (newLocation.status === 'Goal') {
                    return newLocation.path;
                } else if (newLocation.status === 'Valid') {
                    queue.push(newLocation);
                }

                // Explore West
                newLocation = exploreInDirection(currentLocation, 'West', grid);
                if (newLocation.status === 'Goal') {
                    return newLocation.path;
                } else if (newLocation.status === 'Valid') {
                    queue.push(newLocation);
                }
            }
            // No valid path found
            return false;

        };

        // This function will check a location's status
        // (a location is "valid" if it is on the grid, is not an "obstacle",
        // and has not yet been visited by our algorithm)
        // Returns "Valid", "Invalid", "Blocked", or "Goal"

        const locationStatus = (location, grid) => {
            let gridSize = width;
            let dft = location.distanceFromTop;
            let dfl = location.distanceFromLeft;

            if (location.distanceFromLeft < 0 ||
                location.distanceFromLeft >= gridSize ||
                location.distanceFromTop < 0 ||
                location.distanceFromTop >= gridSize) {
                // location is not on the grid--return false
                return 'Invalid';
            } else if (grid[dft][dfl] === hatChar) {
                return 'Goal';
            } else if (grid[dft][dfl] === hole) {
                // location is either an obstacle or has been visited
                return 'Blocked';
            } else if (grid[dft][dfl] === visited) {
                return 'Blocked';
            } else {
                return 'Valid';
            }
        };

        // Explores the grid from the given location in the given
        // direction

        const exploreInDirection = (currentLocation, direction, grid) => {
            let newPath = currentLocation.path.slice();
            newPath.push(direction);

            let dft = currentLocation.distanceFromTop;
            let dfl = currentLocation.distanceFromLeft;

            if (direction === 'North') {
                dft -= 1;
            } else if (direction === 'East') {
                dfl += 1;
            } else if (direction === 'South') {
                dft += 1;
            } else if (direction === 'West') {
                dfl -= 1;
            }

            let newLocation = {
                distanceFromTop: dft,
                distanceFromLeft: dfl,
                path: newPath,
                status: 'Unknown'
            };

            newLocation.status = locationStatus(newLocation, grid);

            //If this new location is valid, mark it as 'Visited'
            if (newLocation.status === 'Valid') {
                grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = visited;
            }

            return newLocation;
        };

        let startLocus = findStartLocation(field);

        // Deep clone of field (we don't want to return the maze modified by the path finding algo)

        const maze = _.cloneDeep(field);

        // If endField is true, we return maze (the umodified version of the maze), else we return
        // a recursive call to generateField until we get a valid field
        let endField = findShortestPath(startLocus, field);

        if (endField) {
            return maze;
        } else {
            return this.generateField(width, height, percent);
        }
    }
}

// Define the width and height of the grid and percentage of obstacles
// Mazes are automatically defined with random allocation of field characters
// and holes (O). A path finding algorithm is run on every random generation 
// and instance of the field generated to check it can be solved before 
// being returned to the user.  
const newField = Field.generateField(4, 8, 25);

const newGame = new Field(newField);

newGame.playGame();