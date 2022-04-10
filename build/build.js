let nodes = [];
let nodesHashmap = {};
let tool = 'drag';
let latestNode;
let matrix;
function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(120);
    let buttons = document.querySelectorAll('button');
    matrix = new Matrix();
    buttons.forEach((button) => {
        if (!button.id.includes('col_')) {
            button.onclick = () => {
                if (button.id == 'cut') {
                    nodes = [];
                    NODE_COUNTER = 0;
                    return;
                }
                tool = button.id;
                buttons.forEach((button) => {
                    button.className = '';
                });
                button.className = 'selected';
                matrix.render();
            };
        }
        else {
            button.onclick = () => {
                console.log(latestNode);
                if (latestNode)
                    latestNode.color = button.style.backgroundColor;
                matrix.render();
            };
        }
    });
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function mousePressed() {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.inside({ x: mouseX, y: mouseY })) {
            return;
        }
    }
    if (tool == 'add' && mouseY > 100) {
        nodes.push(new GraphNode(mouseX, mouseY));
    }
    matrix.render();
}
function mouseReleased() {
    nodes.forEach(node => node.release());
    matrix.render();
}
function draw() {
    cursor('');
    background(255);
    textAlign(LEFT, TOP);
    text('Cunev S. Dmitri', 10, 10);
    text('Lect. univ Marius Spinu', 10, 27);
    let anyInside = false;
    push();
    nodes.forEach(node => {
        node.draw();
        if (node.insideVirgin({ x: mouseX, y: mouseY })) {
            anyInside = true;
        }
    });
    pop();
    if (tool == 'add' && !anyInside) {
        push();
        stroke('rgba(0,0,0,0.3)');
        noFill();
        strokeWeight(3);
        circle(mouseX, mouseY, NODE_RADIUS);
        pop();
    }
    matrix.draw();
}
class Matrix {
    constructor() {
        this.adjacentMatrix = [];
        this.powers = [];
        this.pg = createGraphics(512, 512);
    }
    render() {
        let size = 30;
        noFill();
        this.pg.push();
        this.pg.translate(2, 2);
        this.pg.rect(0, 0, nodes.length * size, nodes.length * size);
        this.adjacentMatrix = [];
        nodes.forEach((node, i) => {
            this.adjacentMatrix.push([]);
            for (let j = 0; j < nodes.length; j++) {
                let contains = 0;
                if (node.ties.includes(nodes[j])) {
                    contains = 1;
                }
                this.adjacentMatrix[this.adjacentMatrix.length - 1].push(contains);
                this.pg.textAlign(CENTER, CENTER);
                this.pg.fill(node.color);
                this.pg.rect(j * size, i * size, size, size);
                this.pg.fill('black');
                this.pg.text(contains, j * size + size / 2, i * size + size / 2);
            }
        });
        this.powers = hamiltonian(this.adjacentMatrix);
        this.pg.pop();
    }
    draw() {
        let size = 30;
        translate(windowWidth - nodes.length * size - size * 2, windowHeight - nodes.length * size - 50);
        image(this.pg, 0, 0);
        translate(nodes.length * size, 0);
        fill('black');
        textAlign(RIGHT, CENTER);
        if (typeof this.powers == 'string') {
            text(`${this.powers}`, 0, -20);
        }
        else {
            text(`${this.powers.join(', ')}`, 0, -20);
        }
    }
}
function hamiltonian(matrix) {
    let n = matrix.length;
    for (let k = 0; k < n; ++k) {
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                if (i != j && matrix[i][j] == 0 && matrix[i][k] == 1 && matrix[k][j] == 1) {
                    matrix[i][j] = 1;
                }
            }
        }
    }
    for (let i = 0; i < n; i++) {
        if (matrix[i][i] != 0) {
            return 'Sunt bucle';
        }
    }
    let arcs = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; ++j) {
            if (matrix[i][j] == 1) {
                arcs++;
            }
        }
    }
    if (arcs != (n * (n - 1)) / 2) {
        return 'Nu sunt (n*(n-1))/2 legaturi';
    }
    let vectorPuteri = new Array(n).fill(0).map((e, index) => { return { index, valoare: 0 }; });
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; ++j) {
            vectorPuteri[i].valoare += matrix[i][j];
        }
    }
    vectorPuteri.sort((a, b) => b.valoare - a.valoare);
    return vectorPuteri.map(e => e.index);
}
const NODE_RADIUS = 45;
let NODE_COUNTER = 0;
class GraphNode {
    constructor(x, y) {
        this.ties = [];
        this.selection = false;
        this.connection = false;
        this.x = x;
        this.y = y;
        this.id = NODE_COUNTER;
        nodesHashmap[this.id] = this;
        this.color = 'white';
        if (this.id == 0) {
            this.origin = true;
        }
        NODE_COUNTER++;
    }
    renderCircle() {
        push();
        strokeWeight(3);
        stroke('#111827');
        fill(this.color);
        circle(this.x, this.y, NODE_RADIUS);
        textAlign(CENTER, CENTER);
        strokeWeight(1);
        fill(0);
        text(this.id, this.x, this.y);
        pop();
        if (dist(mouseX, mouseY, this.x, this.y) < NODE_RADIUS / 2 && (tool == 'add' || tool == 'drag')) {
            cursor('grab');
        }
    }
    draw() {
        this.renderCircle();
        if (this.selection) {
            this.x = mouseX + this.selection.x;
            this.y = mouseY + this.selection.y;
        }
        if (this.connection) {
            this.connection = this;
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.insideVirgin({ x: mouseX, y: mouseY }) && node != this) {
                    push();
                    noFill();
                    strokeWeight(2);
                    stroke('green');
                    circle(node.x, node.y, NODE_RADIUS + 10);
                    pop();
                    this.connection = node;
                }
            }
            if (this.connection == this) {
                let a = Math.atan2(mouseY - this.y, mouseX - this.x);
                let d = constrain(dist(this.x, this.y, mouseX, mouseY), 0, Infinity) - (NODE_RADIUS / 1.5);
                let startPosition = {
                    x: this.x + NODE_RADIUS / 2 * cos(a),
                    y: this.y + NODE_RADIUS / 2 * sin(a),
                };
                if (!this.insideVirgin({ x: mouseX, y: mouseY })) {
                    push();
                    strokeWeight(3);
                    stroke('#111827');
                    line(startPosition.x, startPosition.y, mouseX, mouseY);
                    line(mouseX, mouseY, mouseX + 6 * cos(a - (PI - PI / 4)), mouseY + 6 * sin(a - (PI - PI / 4)));
                    line(mouseX, mouseY, mouseX + 6 * cos(a + (PI - PI / 4)), mouseY + 6 * sin(a + (PI - PI / 4)));
                    pop();
                }
            }
            else {
                let a = Math.atan2(this.connection.y - this.y, this.connection.x - this.x);
                let d = constrain(dist(this.x, this.y, this.connection.x, this.connection.y), 0, Infinity) - (NODE_RADIUS / 1.5);
                let startPosition = {
                    x: this.x + NODE_RADIUS / 2 * cos(a),
                    y: this.y + NODE_RADIUS / 2 * sin(a),
                };
                let endPosition = {
                    x: this.x + d * cos(a),
                    y: this.y + d * sin(a),
                };
                push();
                strokeWeight(3);
                stroke('#111827');
                line(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a - (PI - PI / 4)), endPosition.y + 6 * sin(a - (PI - PI / 4)));
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a + (PI - PI / 4)), endPosition.y + 6 * sin(a + (PI - PI / 4)));
                pop();
            }
        }
        this.ties.forEach(node => {
            push();
            let a = Math.atan2(node.y - this.y, node.x - this.x);
            let d = constrain(dist(this.x, this.y, node.x, node.y), 0, Infinity) - (NODE_RADIUS / 1.5);
            let bidirection = node.ties.includes(this);
            if (bidirection) {
                d = constrain(dist(this.x, this.y, node.x, node.y), 0, Infinity) - (NODE_RADIUS / 2);
            }
            let startPosition = {
                x: this.x + NODE_RADIUS / 2 * cos(a),
                y: this.y + NODE_RADIUS / 2 * sin(a),
            };
            let endPosition = {
                x: this.x + d * cos(a),
                y: this.y + d * sin(a),
            };
            strokeWeight(3);
            stroke('#111827');
            if (bidirection) {
                if (this.id > node.id) {
                    line(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                }
            }
            else {
                line(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a - (PI - PI / 4)), endPosition.y + 6 * sin(a - (PI - PI / 4)));
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a + (PI - PI / 4)), endPosition.y + 6 * sin(a + (PI - PI / 4)));
            }
            pop();
        });
    }
    insideVirgin(point) {
        if (dist(point.x, point.y, this.x, this.y) < NODE_RADIUS / 2) {
            return true;
        }
        else {
            return false;
        }
    }
    inside(point) {
        if (dist(point.x, point.y, this.x, this.y) < NODE_RADIUS / 2) {
            if (tool == 'drag' || tool == 'add')
                this.select();
            if (tool == 'connect')
                this.connect();
            return true;
        }
    }
    connect() {
        this.connection = this;
    }
    select() {
        latestNode = this;
        this.selection = { x: this.x - mouseX, y: this.y - mouseY };
    }
    release() {
        if (this.connection && this.connection != this && !this.ties.includes(this.connection)) {
            this.ties.push(this.connection);
            console.log('added');
        }
        this.selection = false;
        this.connection = false;
    }
}
//# sourceMappingURL=build.js.map