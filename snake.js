//coordinate (point) class
function Point(x, y)
{
    this.x = x;
    this.y = y;
}

//array of table cells
var field = [];

//dimension of the field
var dim = 9;

//array of snake's coordinates
var snake = [];

//coordinate of apple
var apple = null;

//direction of moving
var direction = "up";

//is the game playing
var isPlaying = false;

//snake's timer
var timer = null;

//start/stop button
var startBtn = document.querySelector(".gamebox__control_btn");

//game dimension select
var dimSelect = document.querySelector(".gamebox__control_dim");

//score counter
var scoreDiv = document.querySelector(".gamebox__score");

//fill the table after page load
window.addEventListener("load", fillTable);

//start/stop the game
startBtn.onclick = function() {
    if (isPlaying)
        gameOver();
    else
        startGame();
};

//change the table
dimSelect.onchange = fillTable;

//move the snake by arrow keys
window.onkeydown = function(event) {
    switch (event.keyCode)
    {
        case 38: if (direction !== "down") direction = "up"; break;
        case 40: if (direction !== "up") direction = "down"; break;
        case 39: if (direction !== "left") direction = "right"; break;
        case 37: if (direction !== "right") direction = "left"; break;
    }
};

//move the snake by swype on the screen
var xStart, yStart;
var xEnd, yEnd;
window.ontouchstart = function(event) {
    xStart = event.touches[0].clientX;
    yStart = event.touches[0].clientY;
    xEnd = xStart;
    yEnd = yStart;
};
window.ontouchmove = function(event) {
    xEnd = event.touches[0].clientX;
    yEnd = event.touches[0].clientY;
};
window.ontouchend = function() {
    //if there was a touch, not a swype
    if (xEnd === xStart && yEnd === yStart)
        return;

    //paths in percents ('+ 1' to prevent division by zero)
    var xPath = 100/document.body.clientWidth * (xEnd - xStart + 1);
    var yPath = 100/document.body.clientHeight * (yEnd - yStart + 1);

    //define the direction
    switch (true)
    {
        case (xPath > 0 && Math.abs(xPath) > Math.abs(yPath) && direction !== "left"):
            direction = "right"; break;

        case (xPath < 0 && Math.abs(xPath) > Math.abs(yPath) && direction !== "right"):
            direction = "left"; break;

        case (yPath > 0 && Math.abs(xPath) < Math.abs(yPath) && direction !== "up"):
            direction = "down"; break;

        case (yPath < 0 && Math.abs(xPath) < Math.abs(yPath) && direction !== "down"):
            direction = "up"; break;
    }
};

//fill the table
function fillTable() {

    //get the dimension value
    switch (dimSelect.value)
    {
        case "9x9": dim = 9; break;
        case "11x11": dim = 11; break;
        case "15x15": dim = 15; break;
    }

    //reset vars to initial values
    field = [];
    snake = [];
    apple = null;

    var table = document.querySelector(".field tbody");

    //remove all children
    while (table.firstChild)
        table.removeChild(table.firstChild);

    //add new children according to dimension
    for (var i = 0; i < dim; i++)
    {
        //add a string
        table.appendChild(document.createElement("tr"));

        //add cells in the string
        for (var j = 0; j < dim; j++)
            table.children[i].appendChild(document.createElement("td"));

        //fill the field array
        field[i] = table.children[i].children;
    }

    scoreDiv.innerHTML = 0;
}

//start the game
function startGame() {
    //clearing the field after previous game
    for (var i = 0; i < snake.length; i++)
        field[snake[i].x][snake[i].y].classList.remove("snake-gray");

    //set coordinates of initial snake's body
    snake = [];
    snake[0] = new Point(7, parseInt(dim/2));
    snake[1] = new Point(8, parseInt(dim/2));

    direction = "up";
    isPlaying = true;
    startBtn.innerHTML = "Stop";
    dimSelect.setAttribute("disabled", "");
    var score = 0;
    scoreDiv.innerHTML = 0;
    generateApple();

    //moving of snake
    timer = setInterval(function() {

        //adding the new point in snake's coordinates according to the direction
        switch (direction)
        {
            case "up":
                snake.unshift(new Point(snake[0].x-1, snake[0].y)); break;

            case "down":
                snake.unshift(new Point(snake[0].x+1, snake[0].y)); break;

            case "right":
                snake.unshift(new Point(snake[0].x, snake[0].y+1)); break;

            case "left":
                snake.unshift(new Point(snake[0].x, snake[0].y-1)); break;
        }

        //if snake's head coordinate equals to apple coordinate
        if (snake[0].x === apple.x && snake[0].y === apple.y)
        {
            scoreDiv.innerHTML = ++score;
            generateApple();
        }
        //removing the last point in snake's coordinates if apple isn't eaten
        else
        {
            field[snake[snake.length-1].x][snake[snake.length-1].y].classList.remove("snake-sect");
            snake.pop();
        }

        //paint the snake's body according to its coordinates if new point intersects nothing
        if (checkForIntersection())
        {
            field[snake[0].x][snake[0].y].classList.add("snake-head");
            if (snake.length > 1)
            {
                field[snake[1].x][snake[1].y].classList.remove("snake-head");
                field[snake[1].x][snake[1].y].classList.add("snake-sect");
            }
        }
        //remove the just added point if it intersects something and end the game
        else
        {
            snake.shift();
            gameOver();
        }
    }, 500);
}

//generate the apple
function generateApple()
{
    //remove the previous apple from the field if it was added
    if (apple)
        field[apple.x][apple.y].classList.remove("apple");

    //generate the new coordinate of apple
    apple = new Point(parseInt(Math.random() * dim), parseInt(Math.random() * dim));

    //check if coordinate of apple equals to any snake's coordinate
    for (var i = 0; i < snake.length; i++)
        if (field[apple.x][apple.y] === field[snake[i].x][snake[i].y])
            generateApple();

    //add the apple to the field
    field[apple.x][apple.y].classList.add("apple");
}

//check for intersection
function checkForIntersection()
{
    //checking for intersection with borders
    if (snake[0].x < 0 || snake[0].y < 0 || snake[0].x >= dim || snake[0].y >= dim)
        return false;

    //checking for self-intersection
    for (var i = 4; i < snake.length; i++)
        if (field[snake[0].x][snake[0].y] === field[snake[i].x][snake[i].y])
            return false;

    return true;
}

//end the game
function gameOver()
{
    clearInterval(timer);

    //repaint the snake's body in gray color according to its coordinates
    field[snake[0].x][snake[0].y].classList.remove("snake-head");
    field[snake[0].x][snake[0].y].classList.add("snake-gray");
    for (var i = 1; i < snake.length; i++)
    {
        field[snake[i].x][snake[i].y].classList.remove("snake-sect");
        field[snake[i].x][snake[i].y].classList.add("snake-gray");
    }

    isPlaying = false;
    startBtn.innerHTML = "Start";
    dimSelect.removeAttribute("disabled");
}
