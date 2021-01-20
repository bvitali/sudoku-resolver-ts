import * as assert from 'assert'
import {utils} from "../src/utils";
import Occurrences = utils.Occurrences;
import valueRange = utils.valueRange;
import gridRange = utils.gridRange;
import quadrants = utils.quadrants;


export class SudokuBoard {

    board: Int8Array
    isBoardValid: boolean
    candidateSet: Array<Set<utils.valueRange>>
    tracker: utils.Occurrences

    constructor(initialBoard?:Int8Array) {
        this.tracker = new Occurrences()
        if (initialBoard !== undefined)
            this.board = new Int8Array(initialBoard)
        else
            this.board = new Int8Array(81)

        this.isBoardValid = this.isValid()           //check if the input board is valid, if not no other operation makes sense

        // debug
        if ( !this.isBoardValid) {
            console.log('Board invalid in constructor')
            console.log(`${this}`)
            console.log(this)
            assert(this.isBoardValid, "The board is not valid")
        }

        this.candidateSet = new Array(81)
        for (let i = 0; i< 81; i++) {
            this.candidateSet[i] = new Set()
        }

        this.updateCandidateSets()
    }

    updateCandidateSets() {
        assert(this.isBoardValid, "The board is not valid")
        for (let i = 0; i< 81; i++) {
            if (this.board[i])
                continue;   //if a number is already present skip to the next one
            let row = ((i / 9) >> 0)
            let col = (i % 9)
            //console.log(`index: ${i}, row: ${row}, column: ${col}`)
            for (let val:valueRange = 1; val <=9 ; val++) {
                if (this.isValidAssignment(<gridRange>row,<gridRange>col, <valueRange>val)) {
                    this.candidateSet[i].add(<valueRange>val)
                }
            }
        }
    }

    getItem(row:utils.gridRange, col:utils.gridRange):number {
        assert(this.isBoardValid, "The board is not valid")
        assert((row>=0 && row<9) && (col >=0 && col < 9))
        return this.board[row * 9 + col]
    }

    setItem(row:gridRange, col:gridRange, val:valueRange):boolean {
        assert(this.isBoardValid, "The board is not valid")
        // assign a value to a cell only if it is safe to do so and returns true, false otherwise
        if (this.isValidAssignment(row, col, val)) {
            this.board[row * 9 + col] = val
            this.removeCandidate(row, col, val)  //automatically remove val from the candidates in row, col and quadrant
            return true
        }
        return false
    }

    isRowValid(row:gridRange, col:gridRange, val:valueRange):boolean {
        //corner case to evaluate: if the value is already assigned the function
        // return false.
        assert((row>=0 && row<9 ) && (val>=1 && val <=9))
        // return true if 'val' is not contained in row
        for (let i:gridRange = 0; i < 9; i++) {
            if (this.getItem(row, <gridRange>i) === val)
                return false
        }
        return true
    }

    isColValid(row:gridRange, col:gridRange, val:valueRange):boolean {
        assert(( col >=0 && col < 9) && (val>=1 && val <=9))
        // return true if 'val' is not contained in column
        for (let i = 0; i < 9; i++) {
            if (this.getItem(<gridRange>i, col) === val)
                return false
        }
        return true
    }

    isQuadrantValid(row:gridRange, col:gridRange, val:valueRange):boolean {
        assert((row>=0 && row<9) && (col >=0 && col < 9) && (val>=1 && val <=9))
        // return true if 'val' is not contained in the quadrant corresponding to the row,col coordinates
        let q = this.getQuadrant(row, col)
        for (let i of quadrants[q].indexSet) {
            if (this.board[i] === val)
                return false
        }
        return true
    }

    getQuadrant(row:gridRange, col:gridRange) {
        assert((row>=0 && row<9) && (col >=0 && col < 9))
        //return the quadrant index from row,col
        let q = ((row / 3) >> 0) * 3 + ((col / 3) >> 0)
        //console.log('quadrante:', q, row, col)
        return q
    }

    toString():string {
        let rows = "\n"
        for (let r = 0; r < 9; r++) {
//            rows = rows + '[ ' + this.board.slice(r * 9, (r+1) * 9) + ' ]\n'
            let i = r * 9
            rows = rows + '| ' + this.board.slice(i, i + 3) + ' | ' + this.board.slice(i + 3, i + 6) + ' | ' + this.board.slice(i + 6, i + 9) + ' |\n'
            if ( (r % 3) === 2)
                rows = rows + "-".repeat(25) + "\n"
        }
        return rows
    }

    findCandidatePerRow(row:gridRange):Map<valueRange, number> {
        assert(this.isBoardValid, "The board is not valid")
        assert( row >= 0 && row < 9)
        // return a Map(col, value) with all candidates in a row with 1 recurrence
        let index = row * 9
        this.tracker.init()
        for (let i = index; i < index + 9; i++) {
            this.candidateSet[i].forEach( (val) => this.tracker.track(val, i))
        }
        let candidates = new Map()
        // return a map containing (val, position) for all values where count === 1
        for (let [val, info] of this.tracker.entries()) {
            if (info.count === 1)
                candidates.set(val, info.lastPos)
        }
        return candidates
    }

    findCandidatePerCol(col:gridRange):Map<valueRange, number> {
        assert(this.isBoardValid, "The board is not valid")
        assert( col >= 0 && col < 9)
        // return a Map(col, value) with all candidates in a column with 1 recurrence
        this.tracker.init()
        for (let i = 0, row = 0; i < 9; i++, row += 9) {
            let index = row + col
            this.candidateSet[index].forEach( (val) => this.tracker.track(val, index))
        }
        let candidates = new Map()
        // return a map containing (val, position) for all values where count === 1
        for (let [val, info] of this.tracker.entries()) {
            if (info.count === 1)
                candidates.set(val, info.lastPos)
        }
        return candidates
    }

    findCandidatePerQuadrant(q:gridRange):Map<valueRange, number> {
        assert(this.isBoardValid, "The board is not valid")
        assert( q >= 0 && q < 9)
        // return a Map(col, value) with all candidates in quadrant q with 1 recurrence
        this.tracker.init()

        for (let index of quadrants[q].indexSet) {
            this.candidateSet[index].forEach( (val) => this.tracker.track(val, index))
        }
        let candidates = new Map()
        // return a map containing (val, position) for all values where count === 1
        for (let [val, info] of this.tracker.entries()) {
            if (info.count === 1)
                candidates.set(val, info.lastPos)
        }
        return candidates
    }

    removeCandidate(row:gridRange, col:gridRange, value:valueRange) {
        assert(this.isBoardValid, "The board is not valid")
        // when a value is set in a cell(row, col), it has to be removed from the candidate set
        // of the element on corresponding row, col and quadrant

        let q = this.getQuadrant(row,col)
        //remove from row candidates
        for (let index = row * 9; index < (row + 1) * 9 ; index++) {
            this.candidateSet[index].delete(value)
        }
        //remove from column candidates
        for (let i = 0, row = 0; i < 9; i++, row += 9) {
            let index = row + col
            this.candidateSet[index].delete(value)
        }
        //remove from quadrant q
        for (let index of quadrants[q].indexSet) {
            this.candidateSet[index].delete(value)
        }

    }

    resolveRows() {
        assert(this.isBoardValid, "The board is not valid")
        // uses findCandidatesPerRow to set the single candidates and return true if at least one is found
        let atLeastOneChange = false
        for (let row = 0; row < 9; row++) {
            let map = this.findCandidatePerRow(<gridRange>row)
            if (map.size > 0) {
                for (let [val,pos] of map.entries()) {
                    let col = pos % 9
                    console.log(`Find single ${val} candidate in row ${row}, column ${col}`)
                    console.log("clearing the corresponding candidateSet", this.candidateSet[pos])
                    this.board[pos] = val
                    this.candidateSet[pos].clear()
                    atLeastOneChange = true
                    this.removeCandidate(<gridRange>row,<gridRange>col,val)
                }
            }
        }
        return atLeastOneChange
    }

    resolveCols() {
        assert(this.isBoardValid, "The board is not valid")
        // uses findCandidatesPerCol to set the single candidates and return true if at least one is found
        let atLeastOneChange = false
        for (let col = 0; col < 9; col++) {
            let map = this.findCandidatePerCol(<gridRange>col)
            if (map.size > 0) {
                for (let [val,pos] of map.entries()) {
                    let row = (pos / 9)>>0
                    console.log(`Find single ${val} candidate in row ${row}, column ${col}`)
                    console.log("clearing the corresponding candidateSet", this.candidateSet[pos])
                    this.board[pos] = val
                    this.candidateSet[pos].clear()
                    atLeastOneChange = true
                    this.removeCandidate(<gridRange>row,<gridRange>col,val)
                }
            }
        }
        return atLeastOneChange
    }

    resolveQuadrants() {
        assert(this.isBoardValid, "The board is not valid")
        // uses findCandidatesPerQuadrant to set the single candidates and return true if at least one is found
        let atLeastOneChange = false
        for (let q = 0; q < 9; q++) {
            let map = this.findCandidatePerQuadrant(<gridRange>q)
            if (map.size > 0) {
                for (let [val,pos] of map.entries()) {
                    let row = (pos/9) >> 0
                    let col = pos % 9
                    console.log(`Find single ${val} candidate in row ${row}, column ${col}`)
                    console.log("clearing the corresponding candidateSet", this.candidateSet[pos])
                    this.board[pos] = val
                    this.candidateSet[pos].clear()
                    atLeastOneChange = true
                    this.removeCandidate(<gridRange>row,<gridRange>col,val)
                }
            }
        }
        return atLeastOneChange
    }

    resolvebyLogic() {
        assert(this.isBoardValid, "****** The board is not valid, cannot be resolved *****")
        let tryAgain = true
        let iteration = 0
        while (tryAgain) {
            iteration++
            tryAgain = this.resolveRows()
            tryAgain ||= this.resolveCols()
            tryAgain ||= this.resolveQuadrants()

        }
    }

    isResolved() {
        assert(this.isBoardValid, "The board is not valid")
        // if there are no more '0' values the game is resolved

        // As soon as one true is returned, .some() will itself return true.
        // If none of the values, when processed in your condition,
        // return true (if they all return false), then .some() will return false.

        return !this.board.some( (val) =>  {
            if (val === 0) {
                return true;  // this is to exit from the automatic loop
            }
        })

    }

    isValidAssignment(row:gridRange, col:gridRange, val:valueRange):boolean {
        if (this.isRowValid(row, col, val))
            if (this.isColValid(row, col, val))
                if (this.isQuadrantValid(row,col,val))
                    return true
        return false
    }

    checkRow(row:gridRange):boolean {
        this.tracker.init()
        for (let col = 0; col < 9; col++ ) {
            let index = row * 9 + col
            let val = this.board[index]
            if (val)
                this.tracker.track(<valueRange>val, index)
        }
        for (let [val, info] of this.tracker.entries()) {
            if (info.count > 1) {
                console.log(`Duplicate value ${val} in row ${row}`)
                return false
            }
        }
        return true
    }

    checkCol(col:gridRange):boolean {
        this.tracker.init()
        for (let row = 0; row < 9; row++ ) {
            let index = row * 9 + col
            let val = this.board[index]
            if (val)
                this.tracker.track(<valueRange>this.board[index], index)
        }
        for (let [val, info] of this.tracker.entries()) {
            if (info.count > 1) {
                console.log(`Duplicate value ${val} in column ${col}`)
                return false
            }
        }
        return true
    }

    checkQuadrant(row:gridRange,col:gridRange):boolean {
        let q = this.getQuadrant(row,col)
        this.tracker.init()
        for (let index of quadrants[q].indexSet) {
            let val = this.board[index]
            if (val)
                this.tracker.track(<valueRange>this.board[index], index)
        }
        for (let [val, info] of this.tracker.entries()) {
            if (info.count > 1) {
                console.log(`Duplicate value ${val} in quadrant ${q}`)
                console.log(`${this}`)
                return false
            }
        }
        return true
    }

    isValid():boolean {

        return this.board.every( (val, index) => {
            let row = (index/9)>>0
            let col = index % 9
            return this.checkRow(<gridRange>row)  && this.checkCol(<gridRange>col ) && this.checkQuadrant(<gridRange>row,<gridRange>col)
        })
    }

    resolveByGuess( iterations:number = 0, startingIndex:number = 0):boolean  {

        iterations++
//        console.log(`Recursive Iteration: ${iterations}`)
//    console.log(`${sudoku}`)
//    console.log(sudoku.candidateSet)

        if (startingIndex === 81)
            return true
        let i = startingIndex
        if (this.board[i] > 0) {
            return this.resolveByGuess( iterations, i + 1)
        }
        let row = (i/9) >> 0
        let col = i % 9
//    console.log(`current item[${row},${col}], index:${i}`)

        for (let candidateValue of this.candidateSet[i]) {
            // try to assign all possible candidates, if an assignment doesn't bring to resolution
            // go back and try the other alternatives
//        console.log(`candidate (${candidateValue}) inside`, sudoku.candidateSet[i])

            // try to resolve the game assigning the candidateValue
            // start the recursion from the index after the current one
//            console.log(`===== before setting ${candidateValue}  in (${row}, ${col}`)
//            console.log(newBoard)

            if (this.isValidAssignment(<gridRange>row,<gridRange>col,candidateValue)) {
                //make a tentative assignment
                this.board[i] = candidateValue

//            console.log(`===== after setting ${candidateValue}  in (${row}, ${col}`)
//            console.log(newBoard)

                if (this.resolveByGuess( iterations, i + 1)) {
                    // the candidate reached a valid solution
                    // exit
                    return true
                }
                this.board[i] = 0
            }

        }
        return false
    }

    resolve( iterations:number = 0, startingIndex:number = 0):boolean  {

        iterations++
//        console.log(`Recursive Iteration: ${iterations}`)
//    console.log(`${sudoku}`)
//    console.log(sudoku.candidateSet)

        if (startingIndex === 81)
            return true
        let i = startingIndex
        if (this.board[i] > 0) {
            return this.resolve( iterations, i + 1)
        }
        let row = (i/9) >> 0
        let col = i % 9
//    console.log(`current item[${row},${col}], index:${i}`)

        for (let candidateValue:valueRange = 1; candidateValue <=9;  candidateValue++) {
            // try to assign all possible candidates, if an assignment doesn't bring to resolution
            // go back and try the other alternatives
//        console.log(`candidate (${candidateValue}) inside`, sudoku.candidateSet[i])

            // try to resolve the game assigning the candidateValue
            // start the recursion from the index after the current one
//            console.log(`===== before setting ${candidateValue}  in (${row}, ${col}`)
//            console.log(newBoard)

            if (this.isValidAssignment(<gridRange>row,<gridRange>col,<valueRange>candidateValue)) {
                //make a tentative assignment
                this.board[i] = candidateValue

//            console.log(`===== after setting ${candidateValue}  in (${row}, ${col}`)
//            console.log(newBoard)

                if (this.resolve( iterations, i + 1)) {
                    // the candidate reached a valid solution
                    // exit
                    return true
                }
                this.board[i] = 0
            }

        }
        return false
    }

}
