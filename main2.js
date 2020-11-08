const prompt = require('prompt-sync')({
    sigint: true
});

let keypress = require('keypress');

const hatChar = '^';
const hole = 'O';
const fieldChar = '░';
const pathChar = '*';
const visited = 'x';


class Field {
    constructor(field, x, y) {
        this._field = field;
        this._x = x;
        this._y = y;
    }

    direction() {
        // make `process.stdin` begin emitting "keypress" events
        keypress(process.stdin);
        let direction = '';
        // listen for the "keypress" event
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.ctrl && key.name == 'c') {
                process.stdin.pause();
            } else if (key.name == 'up' || key.name == 'down' || key.name == 'left' || key.name == 'right') {
                direction = key;
            } else {
                console.log('Use the arrow keys to navigate.');
            }
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();

        return direction;
    }

    print() {
        this._field.forEach(n => {
            console.log(n)
        });
    }

    playGame() {
        print();
    }

    get startLoci() {
        // Returns index of start position of the field
        // flattened as an array.
        let field = this._field;
        let d = field.length;
        let i = field.flat(d).indexOf('*');
        return i;
    }

    set nextLoci(direction) {

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
                    if (field[j] === "*") {
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

            console.log(location);

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
            let gridSize = grid.length;
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

            // If this new location is valid, mark it as 'Visited'
            if (newLocation.status === 'Valid') {
                grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = visited;
            }

            return newLocation;
        };

        let startLocus = findStartLocation(field);

        let endField = findShortestPath(startLocus, field);

        console.log(endField);
        return field;
    }
}

const myField = new Field([
    ['*', '░', 'O'],
    ['░', 'O', '░'],
    ['░', '^', '░'],
]);

const newField = Field.generateField(4, 4, 50);

console.log(newField);