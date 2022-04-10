const NODE_RADIUS = 45
let NODE_COUNTER = 0;

class GraphNode {
    x: number
    y: number
    id: number
    ties: GraphNode[] = []
    origin: boolean;
    color: string

    private selection: false | { x: number, y: number } = false
    private connection: false | GraphNode = false
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.id = NODE_COUNTER
        nodesHashmap[this.id] = this;
        this.color = 'white'


        if (this.id == 0) {
            this.origin = true;
        }
        NODE_COUNTER++
    }

    renderCircle() {
        push()
        strokeWeight(3)
        stroke('#111827')
        fill(this.color)
        circle(this.x, this.y, NODE_RADIUS)
        textAlign(CENTER, CENTER)
        strokeWeight(1)
        fill(0)
        text(this.id, this.x, this.y)
        pop()
        if (dist(mouseX, mouseY, this.x, this.y) < NODE_RADIUS / 2 && (tool == 'add' || tool == 'drag')) {
            cursor('grab')
        }
    }

    draw() {
        this.renderCircle()
        if (this.selection) {
            this.x = mouseX + this.selection.x
            this.y = mouseY + this.selection.y
        }

        if (this.connection) {
            this.connection = this
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.insideVirgin({ x: mouseX, y: mouseY }) && node != this) {
                    push()
                    noFill()
                    strokeWeight(2)
                    stroke('green')
                    circle(node.x, node.y, NODE_RADIUS + 10)
                    pop()
                    this.connection = node;
                }
            }

            if (this.connection == this) {
                let a = Math.atan2(mouseY - this.y, mouseX - this.x)
                let d = constrain(dist(this.x, this.y, mouseX, mouseY), 0, Infinity) - (NODE_RADIUS / 1.5)

                let startPosition = {
                    x: this.x + NODE_RADIUS / 2 * cos(a),
                    y: this.y + NODE_RADIUS / 2 * sin(a),
                }

                if (!this.insideVirgin({ x: mouseX, y: mouseY })) {
                    push()
                    strokeWeight(3)
                    stroke('#111827')
                    line(startPosition.x, startPosition.y, mouseX, mouseY)
                    line(mouseX, mouseY, mouseX + 6 * cos(a - (PI - PI / 4)), mouseY + 6 * sin(a - (PI - PI / 4)))
                    line(mouseX, mouseY, mouseX + 6 * cos(a + (PI - PI / 4)), mouseY + 6 * sin(a + (PI - PI / 4)))

                    pop()
                }

            } else {
                let a = Math.atan2(this.connection.y - this.y, this.connection.x - this.x)
                let d = constrain(dist(this.x, this.y, this.connection.x, this.connection.y), 0, Infinity) - (NODE_RADIUS / 1.5)

                let startPosition = {
                    x: this.x + NODE_RADIUS / 2 * cos(a),
                    y: this.y + NODE_RADIUS / 2 * sin(a),
                }
                let endPosition = {
                    x: this.x + d * cos(a),
                    y: this.y + d * sin(a),
                }
                push()
                strokeWeight(3)
                stroke('#111827')
                line(startPosition.x, startPosition.y, endPosition.x, endPosition.y)
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a - (PI - PI / 4)), endPosition.y + 6 * sin(a - (PI - PI / 4)))
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a + (PI - PI / 4)), endPosition.y + 6 * sin(a + (PI - PI / 4)))

                pop()
            }
        }

        this.ties.forEach(node => {
            push()
            let a = Math.atan2(node.y - this.y, node.x - this.x)
            let d = constrain(dist(this.x, this.y, node.x, node.y), 0, Infinity) - (NODE_RADIUS / 1.5)
            let bidirection = node.ties.includes(this)
            if (bidirection) {
                d = constrain(dist(this.x, this.y, node.x, node.y), 0, Infinity) - (NODE_RADIUS / 2)

            }
            let startPosition = {
                x: this.x + NODE_RADIUS / 2 * cos(a),
                y: this.y + NODE_RADIUS / 2 * sin(a),
            }
            let endPosition = {
                x: this.x + d * cos(a),
                y: this.y + d * sin(a),
            }


            strokeWeight(3)
            stroke('#111827')
            if (bidirection) {
                if (this.id > node.id) {
                    line(startPosition.x, startPosition.y, endPosition.x, endPosition.y)
                }
            } else {
                line(startPosition.x, startPosition.y, endPosition.x, endPosition.y)
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a - (PI - PI / 4)), endPosition.y + 6 * sin(a - (PI - PI / 4)))
                line(endPosition.x, endPosition.y, endPosition.x + 6 * cos(a + (PI - PI / 4)), endPosition.y + 6 * sin(a + (PI - PI / 4)))



            }
            pop()
        })
    }

    insideVirgin(point: { x: number, y: number }) {
        if (dist(point.x, point.y, this.x, this.y) < NODE_RADIUS / 2) {
            return true;
        } else {
            return false;
        }
    }

    inside(point: { x: number, y: number }) {
        if (dist(point.x, point.y, this.x, this.y) < NODE_RADIUS / 2) {
            if (tool == 'drag' || tool == 'add')
                this.select()

            if (tool == 'connect')
                this.connect()
            return true;
        }
    }
    connect() {
        this.connection = this
    }

    select() {
        latestNode = this
        this.selection = { x: this.x - mouseX, y: this.y - mouseY }
        // console.log(key)
        // if (key == 'Control') {
        // this.ties.forEach(node => {
        //     if (!node.selection) {
        //         node.select()
        //     }
        // })
        // }

    }

    release() {

        if (this.connection && this.connection != this && !this.ties.includes(this.connection)) {
            this.ties.push(this.connection)
            console.log('added')
        }
        this.selection = false;
        this.connection = false;
    }
}