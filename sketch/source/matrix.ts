class Matrix {
    pg: p5.Graphics
    adjacentMatrix: number[][] = []
    powers: number[] | string = []
    constructor() {
        this.pg = createGraphics(512, 512)
    }
    render() {
        let size = 30
        noFill();
        this.pg.push()
        this.pg.translate(2, 2)
        this.pg.rect(0, 0, nodes.length * size, nodes.length * size)
        this.adjacentMatrix = []
        nodes.forEach((node, i) => {
            this.adjacentMatrix.push([])
            for (let j = 0; j < nodes.length; j++) {
                let contains = 0;
                if (node.ties.includes(nodes[j])) {
                    contains = 1;
                }
                this.adjacentMatrix[this.adjacentMatrix.length - 1].push(contains);
                this.pg.textAlign(CENTER, CENTER)
                this.pg.fill(node.color)
                this.pg.rect(j * size, i * size, size, size)
                this.pg.fill('black')
                this.pg.text(contains, j * size + size / 2, i * size + size / 2)
            }

        });
        this.powers = hamiltonian(this.adjacentMatrix)

        this.pg.pop()
    }
    draw() {
        let size = 30

        translate(windowWidth - nodes.length * size - size * 2, windowHeight - nodes.length * size - 50)


        image(this.pg, 0, 0)
        translate(nodes.length * size, 0)
        fill('black')
        textAlign(RIGHT, CENTER)
        if (typeof this.powers == 'string') {
            text(`${this.powers}`, 0, -20)

        } else {
            text(`${this.powers.join(', ')}`, 0, -20)

        }

    }
}


function hamiltonian(matrix: any) {

    let n = matrix.length

    //Convertim matricea in matricea drumurilor totale
    for (let k = 0; k < n; ++k) {
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                if (i != j && matrix[i][j] == 0 && matrix[i][k] == 1 && matrix[k][j] == 1) { matrix[i][j] = 1; }
            }
        }
    }

    //Validam pe diagonala sa fie doar zerouri
    for (let i = 0; i < n; i++) {
        if (matrix[i][i] != 0) {
            return 'Sunt bucle'
        }
    }

    //Gasim numarul de legaturi in graf
    let arcs = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; ++j) {
            if (matrix[i][j] == 1) {
                arcs++
            }
        }
    }

    //Validam sa avem (n*(n-1))/2 legaturi
    if (arcs != (n * (n - 1)) / 2) {
        return 'Nu sunt (n*(n-1))/2 legaturi'

    }

    //Calculam vectorul de puteri
    let vectorPuteri = new Array(n).fill(0).map((e, index) => { return { index, valoare: 0 } })

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; ++j) {
            vectorPuteri[i].valoare += matrix[i][j];
        }
    }

    //Sortam vectorul de puteri dupa valoarea lui
    vectorPuteri.sort((a, b) => b.valoare - a.valoare)


    return vectorPuteri.map(e => e.index)
}
