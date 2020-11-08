const prompt = require('prompt-sync')({
    sigint: true
});

let keypress = require('keypress');

const hat = '^';
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
        let area = width * height;
        let percentage = (area / 100) * percent;
        let field = [];
        for (let i = 0; i <= area.length; i++) {

        }
        console.log(area);
        return field;
    }
}

const myField = new Field([
    ['*', '░', 'O'],
    ['░', 'O', '░'],
    ['░', '^', '░'],
]);

const newField = Field.generateField(2, 2, 5);
console.log(newField);