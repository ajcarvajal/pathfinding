function Robot(x,y) {
    this.xpos = x;
    this.ypos = y;
    this.path = [];
    this.nextNode = null;

    this.move = function() {
        var moved = false;
        if(!solved) {
            resetNodes();
            init();
        
        }
            if(this.nextNode == null && this.path.length > 0) this.nextNode = this.path.pop();
            if(this.xpos < this.nextNode.xpos - 0.01 || this.xpos > this.nextNode.xpos) {
                this.xpos +=  (this.nextNode.xpos - this.xpos) / 2;
                moved = true;
            }
            if(this.ypos < this.nextNode.ypos - 0.01 || this.ypos > this.nextNode.ypos) {
                this.ypos += (this.nextNode.ypos - this.ypos) / 2;
                moved = true;
            }
            grid[Math.round(this.xpos)][Math.round(this.ypos)].visible = false;
            if(!moved && this.path.length > 0 ) {
                this.nextNode = this.path.pop();
            }
            this.show();
        
    }
    this.show = function() {
        fill(150,0,0);
        noStroke();
        rect(this.xpos * width / cols, this.ypos * height / rows, (width / cols)-1, (height / rows)-1, 20);
    }
}