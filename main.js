const prompt = require('prompt-sync')({
    sigint: true
});

let keypress = require('keypress');

const hatChar = '^';
const hole = 'O';
const fieldChar = '░';
const pathChar = '*';


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
        const startPercent = (2 / area) * 100;
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

        // Check random field has a valid path to the hat amongst
        // the obstacles


        // Splice the field arr into appropriate broken down arrays
        // by width of the field
        for (let i = 0; i < field.length; i++) {
            field.push(field.splice(0, width));
        }

        return field;
    }
}

const myField = new Field([
    ['*', '░', 'O'],
    ['░', 'O', '░'],
    ['░', '^', '░'],
]);

const newField = Field.generateField(5, 5, 50);

console.log(newField);