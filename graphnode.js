function Node(x,y) {
    this.xpos = x;
    this.ypos = y; 

    this.visited = false;
    this.closed = false;
    this.parent = null;
    this.obstacle = false;
    this.visible = true;

    this.color = [25,25,25];

    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.cost = 1;

    this.setColor = function(r,g,b) {
        this.color = [r,g,b];
    }
    this.display = function() {
        if(this.visible) {
            fill(this.color);
            stroke(60);       
            rect(this.xpos * width / cols, this.ypos * height / rows, (width / cols) - 1, (height / rows) - 1,20);
        }
    }
}