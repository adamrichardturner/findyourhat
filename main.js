const prompt = require('prompt-sync')({
    sigint: true
});

let keypress = require('keypress');

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';


class Field {
    constructor(field) {
        this._field = field;
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

    get loci() {
        let field = this._field;
        for (let i = 0; i <= field.length; i++) {
            if (field[i] === '*') {
                console.log(i);
            } else {
                console.log(field[i]);
            }
        }
    }
}

const myField = new Field([
    ['*', '░', 'O'],
    ['░', 'O', '░'],
    ['░', '^', '░'],
]);

console.log(myField.loci);