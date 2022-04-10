let nodes: GraphNode[] = []
let nodesHashmap: Record<number, GraphNode> = {}
let tool = 'drag'
let latestNode: undefined | GraphNode
let matrix: Matrix

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(120)
    let buttons = document.querySelectorAll('button')
    matrix = new Matrix()

    buttons.forEach((button: HTMLButtonElement) => {
        if (!button.id.includes('col_')) {
            button.onclick = () => {
                if (button.id == 'cut') {
                    nodes = []
                    NODE_COUNTER = 0;
                    return;
                }
                tool = button.id
                buttons.forEach((button: HTMLButtonElement) => {
                    button.className = ''
                })
                button.className = 'selected'
                matrix.render()
            }
        } else {
            button.onclick = () => {
                console.log(latestNode)
                if (latestNode)
                    latestNode.color = button.style.backgroundColor
                matrix.render()
            }

        }

    })
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
        nodes.push(new GraphNode(mouseX, mouseY))

    }
    matrix.render()
}

function mouseReleased() {
    nodes.forEach(node => node.release())
    matrix.render()
}


function draw() {
    cursor('')
    background(255);
    textAlign(LEFT, TOP)
    text('Cunev S. Dmitri', 10, 10)
    text('Lect. univ Marius Spinu', 10, 27)


    let anyInside = false;

    push()
    nodes.forEach(node => {
        node.draw()
        if (node.insideVirgin({ x: mouseX, y: mouseY })) {
            anyInside = true;
        }
    })
    pop()


    if (tool == 'add' && !anyInside) {
        push()
        stroke('rgba(0,0,0,0.3)')
        noFill()
        strokeWeight(3)
        circle(mouseX, mouseY, NODE_RADIUS)
        pop()
    }

    matrix.draw()
}

