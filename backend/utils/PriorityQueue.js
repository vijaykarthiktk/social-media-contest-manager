/**
 * Priority Queue Implementation for Fair Participant Selection
 * Uses a Min-Heap data structure for efficient O(log n) operations
 */

class PriorityQueue {
    constructor(compareFn = (a, b) => a.priority - b.priority) {
        this.heap = [];
        this.compareFn = compareFn;
    }

    // Add element to queue - O(log n)
    enqueue(element) {
        this.heap.push(element);
        this._bubbleUp(this.heap.length - 1);
    }

    // Remove and return highest priority element - O(log n)
    dequeue() {
        if (this.isEmpty()) return null;

        const root = this.heap[0];
        const last = this.heap.pop();

        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._bubbleDown(0);
        }

        return root;
    }

    // View highest priority element without removing - O(1)
    peek() {
        return this.isEmpty() ? null : this.heap[0];
    }

    // Check if queue is empty - O(1)
    isEmpty() {
        return this.heap.length === 0;
    }

    // Get queue size - O(1)
    size() {
        return this.heap.length;
    }

    // Get all elements (without removing)
    getAll() {
        return [...this.heap];
    }

    // Helper: Move element up the heap
    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);

            if (this.compareFn(this.heap[index], this.heap[parentIndex]) >= 0) {
                break;
            }

            [this.heap[index], this.heap[parentIndex]] =
                [this.heap[parentIndex], this.heap[index]];

            index = parentIndex;
        }
    }

    // Helper: Move element down the heap
    _bubbleDown(index) {
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild < this.heap.length &&
                this.compareFn(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }

            if (rightChild < this.heap.length &&
                this.compareFn(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest === index) break;

            [this.heap[index], this.heap[smallest]] =
                [this.heap[smallest], this.heap[index]];

            index = smallest;
        }
    }
}

module.exports = PriorityQueue;
