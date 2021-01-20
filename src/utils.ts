export module utils {
    export type gridRange = 0 | 1 | 2 | 3 | 4 | 5 | 6 |7 | 8
    export type valueRange = 1 | 2 | 3 | 4 | 5 | 6 |7 | 8 | 9

    export class QuadrantRange {
        // a quadrant is a 3x3 submatrix numbered as below
        // [ 0, 1 , 2  ]
        // [ 3, 4 , 5  ]
        // [ 6, 7 , 8  ]
        // indexSet contains the indexes of the elements belonging to a specific quadrant

        name: string
        indexSet: Set<number>
        constructor(q: gridRange) {

            if (q <0 || q>8)
                throw new RangeError('Enter a valid range 0..8')
            this.name = `quadrant-${q}`
            let quotient = ((q / 3) >> 0) * 3
            let remainder = (q % 3) * 3
            this.indexSet = new Set()
            for (let i = quotient; i < quotient + 3; i++) {
                for (let j = remainder; j < remainder + 3; j++) {
                    this.indexSet.add(j + i * 9)
                }
            }
        }
    }

    export class Quadrants extends Array<QuadrantRange> {
        private static done: boolean = false

        constructor() {
            super()
            if (Quadrants.done) {
                console.log("static structure quadrants NOT initialized")
                return;
            }
            console.log("static structure quadrants initialized")
            for (let i:gridRange = 0; i < 9; i++) {
                this[i] = new QuadrantRange(<gridRange>i)
            }
            Quadrants.done = true
        }
    }

    type Occurrence = { count:number; lastPos:number}

    export class Occurrences extends Map<valueRange, Occurrence> {

        constructor() {
            super();
            this.init()
            return
        }
        init() {
            for (let i:valueRange = 1; i <= 9; i++) {
                this.set(<valueRange>i, {count:0, lastPos:0})
            }
        }

        track(val:valueRange, pos:number) {
            // @ts-ignore
            let count = this.get(val).count + 1
            this.set(val, {count: count, lastPos: pos})
        }
    }

    export let quadrants:Quadrants = new Quadrants()
}



