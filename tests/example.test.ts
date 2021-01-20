import {describe, it} from 'mocha'
import { expect } from "chai"
import {SmokeTest} from "../src/example";



describe("this is to describe the test on console",()=>{
    it("should return hello world", ()=>{
        const result:string = SmokeTest.HelloWorld()
        expect(result).to.equal('Hello World!')
    })

})

