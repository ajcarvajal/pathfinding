////////////////////////////////////////////
//       Disgusting Global Variables      //
////////////////////////////////////////////
let width = Math.min(window.innerWidth,window.innerHeight) - 20;
let height = width;

let mouse_position = {
    x: 0,
    y: 0 
};

let mouse_down = false;
let pathUpdate = false;
let rows, cols, grid, solved, openSet, closedSet, start, end, current, robot;
let t0;
let t1;

cols = 100;
rows = 100;
grid = new Array(cols);

for(var i = 0; i < cols; ++i) {
    grid[i] = new Array(rows);
}

for(var i = 0; i < cols; ++i) {
    for(var j = 0; j < rows; ++j) {
        grid[i][j] = new Node(i,j);
    }
}

//////////////////////////////
//        GUI Setup         //
//////////////////////////////
let ControlMenu = function() {
    this.Diagonals = false;
    this.Reset = function() {  
        for(var i = 0; i < cols; ++i) {
            for(var j = 0; j < rows; ++j) {
                grid[i][j] = new Node(i,j);
            }
        }
        init();
    }
}

let ControlPanel = new ControlMenu();
let gui = new dat.GUI();
gui.width = window.innerWidth / 4;
gui.add(ControlPanel, 'Diagonals');
gui.add(ControlPanel, 'Reset');



//////////////////////////////
//          Setup           //
//////////////////////////////

function setup() {
    frameRate(60);
    t0 = millis();
    t1 = 0;
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);

    createCanvas(width,height);
    
    init();
    background(0);
    displayGrid();
}

function init() {
    background(0);
    openSet = new BinaryHeap(function(node) {return node.f});
    solved = false;

    start = grid[0][0];
    end = grid[cols-1][rows-1];
    end.setColor(200,200,0);
    current = start;
    robot = new Robot(0, 0);
    

    openSet.push(start);

}
function resetNodes() {
    for(var i = robot.xpos; i < cols; ++i) {
        for(var j = robot.ypos; j < rows; ++j) {
            if(!grid[i][j].obstacle) grid[i][j] = new Node(i,j);
        }
    }
}

////////////////////////////
//         Events         //
///////////////////////////

function onMouseMove(event) {
    mouse_position.x = Math.floor(event.clientX / width * cols);
    mouse_position.y = Math.floor(event.clientY / height * rows);
    if(mouse_down) onMouseDown();
}

function onMouseDown() {
    mouse_down = true;

    if(mouse_position.x < cols && mouse_position.y < rows) {
        pathUpdate = true;
        let x = mouse_position.x;
        let y = mouse_position.y;

        if(grid[x-1] && grid[x-1][y]) {
            grid[x-1][y].obstacle = true;
            grid[x-1][y].setColor(129,59,9);
            grid[x-1][y].display();
        }
    
        // East
        if(grid[x+1] && grid[x+1][y]) {
            grid[x+1][y].obstacle = true;
            grid[x+1][y].setColor(129,59,9);
            grid[x+1][y].display();
        }
    
        // South
        if(grid[x] && grid[x][y-1]) {
            grid[x][y-1].obstacle = true;
            grid[x][y-1].setColor(119,49,0);
            grid[x][y-1].display();
        }
    
        // North
        if(grid[x] && grid[x][y+1]) {
            grid[x][y+1].obstacle = true;
            grid[x][y+1].setColor(75,50,50);
            grid[x][y+1].display();
        }
        //center
        grid[x][y].obstacle = true;
        grid[x][y].setColor(129,59,9);
        grid[x][y].display();
    }
    t0 = millis();


}

function onMouseUp() {
    mouse_down = false;
    if(pathUpdate) {
        solved = false;
        resetNodes();
        openSet = new BinaryHeap(function(node) {return node.f});

        start = grid[robot.xpos][robot.ypos];
        end = grid[cols-1][rows-1];
        end.setColor(200,200,0);
        current = start;

        openSet.push(start);
        pathUpdate = false;
    }
}


//////////////////////////////////////
//         Render Loop             //
/////////////////////////////////////

function draw() {
    requestAnimationFrame(draw);
    t0 = millis();

    if(!solved && openSet.size() > 0){
        updateSets();
        
    }
    else if (t0 - t1 > 70){
        t1 = millis();
        robot.move();
    }
}

//a* implementation uses code and ideas from:
//https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/

function updateSets() {
    current = openSet.pop();

    if(current === end) {
        solved = true;
        drawPath(current);
        displayGrid();
        return;
    } 
    current.closed = true;

    let neighbors = getNeighbors(grid, current);

    for(var i = 0; i < neighbors.length; ++i) {
        let n = neighbors[i];

        if(n.closed || n.obstacle) { 
            continue;
        }

        let gScore = current.g + n.cost;
        let beenVisited = n.visited;

        if(!beenVisited || gScore < n.g) {
            n.visited = true;
            n.parent = current;
            n.h = heuristic(n.xpos, n.ypos, end.xpos, end.ypos);
            n.g = gScore;
            n.f = n.g + n.h;
            
            if(!beenVisited) {
                openSet.push(n);
            } else {
                openSet.rescoreElement(n);
            }
        }
    }
}

function drawPath(node) {
    var current = node;
    robot.path = [];
    while (current.parent) {
      current = current.parent;
      robot.path.push(current);
      grid[current.xpos][current.ypos].setColor(75,75,255);
    }
  }

function getNeighbors(grid, current) {
    let ret = [];
    let x = current.xpos;
    let y = current.ypos;

    // West
    if(grid[x-1] && grid[x-1][y]) {
        ret.push(grid[x-1][y]);
    }

    // East
    if(grid[x+1] && grid[x+1][y]) {
        ret.push(grid[x+1][y]);
    }

    // South
    if(grid[x] && grid[x][y-1]) {
        ret.push(grid[x][y-1]);
    }

    // North
    if(grid[x] && grid[x][y+1]) {
        ret.push(grid[x][y+1]);
    }

    if(ControlPanel.Diagonals) {
        // Southwest
        if(grid[x-1] && grid[x-1][y-1]) {
            grid[x-1][y-1].cost = 1.41421;
            ret.push(grid[x-1][y-1]);
        }

        // Southeast
        if(grid[x+1] && grid[x+1][y-1]) {
            grid[x+1][y-1].cost = 1.41421;
            ret.push(grid[x+1][y-1]);
        }

        // Northwest
        if(grid[x-1] && grid[x-1][y+1]) {
            grid[x-1][y+1].cost = 1.41421;
            ret.push(grid[x-1][y+1]);
        }

        // Northeast
        if(grid[x+1] && grid[x+1][y+1]) {
            grid[x+1][y+1].cost = 1.41421;
            ret.push(grid[x+1][y+1]);
        }
    }

    return ret;
}

function heuristic(p1x, p1y, p2x, p2y) {
    let d1 = Math.abs(p2x - p1x);
    let d2 = Math.abs(p2y - p1y);
    return  d1 + d2;
}

function displayGrid() {
    for(var i = 0; i < cols; i++) {
        for(var j = 0; j < cols; j++) {
            grid[i][j].display();
        }
    }
}
