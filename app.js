class Node {
    constructor(value, depth, isMax) {
        this.value = value;
        this.children = [];
        this.depth = depth;
        this.isMax = isMax;
        this.pruned = false;
        this.alpha = -Infinity;
        this.beta = Infinity;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

class AlphaBetaVisualizer {
    constructor() {
        this.root = null;
        this.currentNode = null;
        this.steps = [];
        this.currentStep = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateTree());
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    generateTree() {
        const depth = parseInt(document.getElementById('depth').value);
        const branching = parseInt(document.getElementById('branching').value);
        const startMax = document.getElementById('startMax').value === 'true';

        this.root = this.generateNode(0, depth, branching, startMax);
        this.renderTree();
        document.getElementById('startBtn').disabled = false;
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('solution').textContent = 'Árbol generado. Inicia el algoritmo para ver la solución.';
    }

    generateNode(currentDepth, maxDepth, branching, isMax) {
        const node = new Node(null, currentDepth, isMax);
        
        if (currentDepth === maxDepth) {
            node.value = Math.floor(Math.random() * 20) - 10; // Valores entre -10 y 10
            return node;
        }

        for (let i = 0; i < branching; i++) {
            node.children.push(this.generateNode(currentDepth + 1, maxDepth, branching, !isMax));
        }

        return node;
    }

    renderTree() {
        const treeElement = document.getElementById('tree');
        treeElement.innerHTML = '';

        const renderLevel = (nodes, level) => {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'level';

            nodes.forEach(node => {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = `node ${node.isMax ? 'max' : 'min'}`;
                nodeDiv.id = node.id;
                
                const valueSpan = document.createElement('span');
                valueSpan.textContent = node.value !== null ? node.value : '?';
                nodeDiv.appendChild(valueSpan);

                const alphaBetaDiv = document.createElement('div');
                alphaBetaDiv.className = 'alpha-beta';
                alphaBetaDiv.textContent = `α:${node.alpha === -Infinity ? '-∞' : node.alpha} β:${node.beta === Infinity ? '∞' : node.beta}`;
                nodeDiv.appendChild(alphaBetaDiv);

                if (node.pruned) nodeDiv.classList.add('pruned');
                if (node === this.currentNode) nodeDiv.classList.add('active');
                
                levelDiv.appendChild(nodeDiv);
            });

            treeElement.appendChild(levelDiv);
        };

        let currentLevelNodes = [this.root];
        while (currentLevelNodes.length > 0) {
            renderLevel(currentLevelNodes, 0);
            const nextLevelNodes = [];
            currentLevelNodes.forEach(node => {
                nextLevelNodes.push(...node.children);
            });
            currentLevelNodes = nextLevelNodes;
        }
    }

    alphabeta(node, depth, alpha, beta, maximizingPlayer, useAlphaBeta = true) {
        node.alpha = alpha;
        node.beta = beta;
    
        this.steps.push({
            node: node,
            alpha: alpha,
            beta: beta,
            value: null,
            maximizingPlayer: maximizingPlayer,
            description: `Evaluando nodo ${maximizingPlayer ? 'MAX' : 'MIN'} (${useAlphaBeta ? 'Alpha-Beta' : 'Minimax'})`
        });
    
        if (depth === 0 || node.children.length === 0) {
            return node.value;
        }
    
        if (maximizingPlayer) {
            let value = -Infinity;
            for (let child of node.children) {
                value = Math.max(value, this.alphabeta(child, depth - 1, alpha, beta, false, useAlphaBeta));
                
                if (useAlphaBeta) {
                    alpha = Math.max(alpha, value);
                    if (beta <= alpha) {
                        child.pruned = true;
                        this.steps.push({
                            node: child,
                            alpha: alpha,
                            beta: beta,
                            value: value,
                            maximizingPlayer: maximizingPlayer,
                            description: 'Poda β: ' + beta + ' <= ' + alpha
                        });
                        break;
                    }
                }
            }
            node.value = value;
            return value;
        } else {
            let value = Infinity;
            for (let child of node.children) {
                value = Math.min(value, this.alphabeta(child, depth - 1, alpha, beta, true, useAlphaBeta));
                
                if (useAlphaBeta) {
                    beta = Math.min(beta, value);
                    if (beta <= alpha) {
                        child.pruned = true;
                        this.steps.push({
                            node: child,
                            alpha: alpha,
                            beta: beta,
                            value: value,
                            maximizingPlayer: maximizingPlayer,
                            description: 'Poda α: ' + beta + ' <= ' + alpha
                        });
                        break;
                    }
                }
            }
            node.value = value;
            return value;
        }
    }

    start() {
        const algorithmType = document.getElementById('algorithmType').value;
        const useAlphaBeta = algorithmType === 'alphabeta';
    
        this.steps = [];
        this.currentStep = 0;
        const finalValue = this.alphabeta(
            this.root, 
            parseInt(document.getElementById('depth').value), 
            -Infinity, 
            Infinity, 
            this.root.isMax,
            useAlphaBeta
        );
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('solution').textContent = `Valor final (${algorithmType}): ${finalValue}`;
        this.nextStep();
    }

    nextStep() {
        if (this.currentStep < this.steps.length) {
            const step = this.steps[this.currentStep];
            this.currentNode = step.node;
            document.getElementById('stepDescription').textContent = step.description;
            document.getElementById('alphaValue').textContent = step.alpha === -Infinity ? '-∞' : step.alpha;
            document.getElementById('betaValue').textContent = step.beta === Infinity ? '∞' : step.beta;
            document.getElementById('currentValue').textContent = step.value === null ? '-' : step.value;
            this.renderTree();
            this.currentStep++;
        }

        if (this.currentStep >= this.steps.length) {
            document.getElementById('nextBtn').disabled = true;
        }
    }

    reset() {
        this.currentStep = 0;
        this.currentNode = null;
        this.steps = [];
        this.root = null;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('stepDescription').textContent = '-';
        document.getElementById('alphaValue').textContent = '-∞';
        document.getElementById('betaValue').textContent = '+∞';
        document.getElementById('currentValue').textContent = '-';
        document.getElementById('solution').textContent = 'Genera un árbol y ejecuta el algoritmo para ver la solución.';
        this.renderTree();
    }
}

// Iniciar el visualizador
const visualizer = new AlphaBetaVisualizer();