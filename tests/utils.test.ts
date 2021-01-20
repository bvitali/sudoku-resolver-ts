import {utils} from "../src/utils";
import QuadrantRange = utils.QuadrantRange;
import {describe, it} from "mocha";
import {expect} from "chai";
import valueRange = utils.valueRange;

describe('QuadrantRange generates a set of array indexes to address submatrix 3x3 in a sudoku grid', ()=>{
    it("should return a set of indexes between 0,80 or throw an exception", ()=>{
        let q:utils.QuadrantRange = new utils.QuadrantRange(0)

        expect(q.indexSet).to.have.lengthOf(9)
        expect(q.indexSet).to.be.an('Set').that.include(10).that.include(20)

        /*
                expect( function() {
                    new utils.QuadrantRange(10)   // defining a type gridRange causes an exception running this test
                }).to.throw(RangeError)
        */
        expect(new utils.QuadrantRange(8).indexSet).to.have.lengthOf(9)
            .to.be.a('Set')
            .to.include.any.keys([60,70,80])

        expect(new utils.QuadrantRange(7).indexSet).to.have.lengthOf(9)
            .to.be.a('Set')
            .to.include.all.keys([  57,58, 59, 66, 67, 68, 75, 76, 77])


    })
})

describe('class Occurrences maps values count and position', () =>{

    it('track example', ()=>{
        let tracker = new utils.Occurrences()
        tracker.track(1,10)
        tracker.track(1, 20)
        expect(tracker).to.be.a('Map')
        expect(tracker.get(1)).to.contain({count:2,lastPos:20})
        expect(tracker.get(2)).to.contain({count:0, lastPos:0})
        tracker.init()
        expect(tracker.get(1)).to.contain({count:0, lastPos:0})


    })
})