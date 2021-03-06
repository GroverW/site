const PubSub = require('./PubSub');
const defaultSnake = [
    [0,0],
    [0,1],
    [0,2]
];

const boardWidth = 64;
const boardHeight = 64;


const Snake = (initialSnake) => {
    let snake = initialSnake;
    let head = snake[snake.length - 1];

    const getSnake = () => PubSub.publish('getSnake',snake);

    const updateHead = () => head = snake[snake.length - 1];

    const moveSnake = (direction) => {
        snake.shift();
        snake.push([
            head[0] + direction[0],
            head[1] + direction[1]
        ]);

        getSnake();
        updateHead();
    }

    return { getSnake, moveSnake };
}

const Game = (boardWidth, boardHeight) => {
    const start = () => {
        PubSub.publish('gameState',true);
    }

    const stop = () => {
        PubSub.publish('gameState',false);
    }

    const gameOver = (() => {
        PubSub.subscribe('getSnake',(snake) => {
            let segmentLocations = {};

            snake.forEach(segment => {
                let coords = segment.join('');

                if( (segment[0] < 0 || segment[0] >= boardWidth) ||
                    (segment[1] < 0 || segment[1] >= boardHeight) ||
                    (coords in segmentLocations))
                        PubSub.publish('gameOver',true)
                
                segmentLocations[coords] = true;
            })
        })
    })();

    return { start, stop };
}

module.exports = {
    PubSub: PubSub,
    defaultSnake,
    Snake: Snake(defaultSnake),
    Game: Game()
};