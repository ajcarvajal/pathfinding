//a* implementation uses code and ideas from:
//https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/

let width = Math.min(window.innerWidth,window.innerHeight) - 20;
let height = width;

let mouse_position = {
    x: 0,
    y: 0 
};

let mouse_down = false;

let rows, cols, grid, solved, openSet, closedSet, start, end, current, robot;

function Node(x,y) {
    this.xpos = x;
    this.ypos = y; 

    this.visited = false;
    this.closed = false;
    this.parent = null;
    this.obstacle = false;

    this.color = [25,25,25];

    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.cost = 1;

    this.setColor = function(r,g,b) {
        this.color = [r,g,b];
    }
    this.display = function() {
        fill(this.color);
        stroke(50);
        //strokeWeight(2);
        rect(this.xpos * width / cols, this.ypos * height / rows, (width / cols) - 1, (height / rows) - 1);
    }
}

function Robot(x,y) {
    this.xpos = x;
    this.ypos = y;

    this.move = function(newX, newY) {
        this.xpos = lerp(this.xpos, newX, 0.0001);
        this.ypos = lerp(this.ypos, newY, 0.0001);
        this.display();
    }
    this.display = function() {
        fill(150,0,0);
        stroke(0);
        strokeWeight(3);
        rect(this.xpos * width / cols, this.ypos * height / rows, (width / cols) - 1, (height / rows) - 1);
    }
}

//setup grid
cols = 30;
rows = 30;
grid = new Array(cols);

for(var i = 0; i < cols; ++i) {
    grid[i] = new Array(rows);
}

for(var i = 0; i < cols; ++i) {
    for(var j = 0; j < rows; ++j) {
        grid[i][j] = new Node(i,j);
    }
}

//setup gui
let ControlMenu = function() {
    this.Diagonals = true;
}

let ControlPanel = new ControlMenu();
let gui = new dat.GUI();
gui.width = window.innerWidth / 4;
gui.add(ControlPanel, 'Diagonals');



//////////////////////////////
//          Setup           //
//////////////////////////////

function setup() {
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mouseup', onMouseUp, false);

    createCanvas(width,height);
    
    init();
}

function init() {
    openSet = new BinaryHeap(function(node) {return node.f});
    solved = false;

    start = grid[0][0];
    end = grid[cols-1][rows-1];
    end.setColor(0,150,0);
    current = start;

    openSet.push(start);

    robot = new Robot(start.xpos,start.ypos);
}

function resetNodes() {
    for(var i = 0; i < cols; ++i) {
        for(var j = 0; j < rows; ++j) {
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
    resetNodes();
    init();

    if(mouse_position.x < cols && mouse_position.y < rows) {
        let target = grid[mouse_position.x][mouse_position.y];
        target.obstacle = true;
        target.setColor(139,69,19);
        target.display();
    }


}

function onMouseUp() {
    mouse_down = false;
}


//////////////////////////////////////
//         runtime functions       //
/////////////////////////////////////

function draw() {
    requestAnimationFrame(draw);
    if(!solved && openSet.size() > 0){
        updateSets();
    }

}

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

function drawPath(current) {
    while (current.parent) {
      current = current.parent;
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
