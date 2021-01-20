import {describe, it} from "mocha";
import {expect} from "chai";
import {utils} from "../src/utils";
import {SudokuBoard} from "../src/main"

const initialBoard = new Int8Array ([
    0,0,0,0,8,7,0,4,0,
    0,0,6,0,0,0,0,0,0,
    0,8,0,9,5,0,3,0,0,
    3,9,0,7,0,2,0,0,0,
    4,2,0,0,0,8,0,0,0,
    0,0,0,5,4,0,0,0,0,
    0,0,0,0,0,5,2,0,0,
    6,0,0,8,0,0,0,5,0,
    2,0,0,0,3,0,4,0,0
])


const initialBoard2 = new Int8Array ([
    8,0,0,0,5,0,0,7,4,
    0,0,0,0,0,0,0,0,0,
    0,0,0,8,0,0,3,0,6,
    6,0,1,3,0,0,0,0,9,
    0,0,0,9,0,0,0,0,0,
    5,0,3,0,1,8,0,0,0,
    0,0,0,0,0,3,0,0,0,
    0,0,0,5,0,1,8,6,0,
    7,0,0,0,0,4,0,5,0
])

describe('Test Singletone createQuadrant()', ()=>{
    it("The function should execute only once to initialize a static member structure", ()=>{
        expect(new utils.Quadrants()).to.be.an('Array')
        expect(new utils.Quadrants()).to.be.an('Array')
    })
})

describe('Resolve a sudoku game with sample input matrix trying all possible combinations', ()=> {
    it('the input board should lead to a solution', ()=>{

        let sudoku = new SudokuBoard(initialBoard)
        console.log("Initial board")
        console.log(`${sudoku}`)
        let starttime = new Date().valueOf()
        if (sudoku.resolve( 0 ,0)) {
            console.log("***********Found a solution ************")
            console.log(`${sudoku}`)
        }
        else
            console.log('----------- No solution Found ----------')
        let stoptime = new Date().valueOf()
        expect(sudoku.isResolved()).to.be.equal(true)
        console.log(`Game resolved in ${stoptime-starttime} milliseconds`)
    })
})

describe('Resolve a sudoku game with sample input matrix trying intelligent combinations', ()=> {
    it('the input board should lead to a solution', ()=>{

        let sudoku = new SudokuBoard(initialBoard)
        console.log("Initial board")
        console.log(`${sudoku}`)
        let starttime = new Date().valueOf()
        sudoku.resolvebyLogic()
        if (sudoku.resolveByGuess( 0 ,0)) {
            console.log("***********Found a solution ************")
            console.log(`${sudoku}`)
        }
        else
            console.log('----------- No solution Found ----------')
        let stoptime = new Date().valueOf()
        expect(sudoku.isResolved()).to.be.equal(true)
        console.log(`Game resolved in ${stoptime-starttime} milliseconds`)
    })
})
