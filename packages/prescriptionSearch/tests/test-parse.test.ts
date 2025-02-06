import {parseSpineResponseXml} from "../src/parseSpineResponse"
import {erdExample, multipleExample, errorExample} from "../src/examples/examples"

describe("Test ERD", () => {
  it("does a parse", async () => {
    const result = parseSpineResponseXml(erdExample)
    console.log(result)
  })

  it("Test Multiple", async () => {
    const result = parseSpineResponseXml(multipleExample)
    console.log(result)
  })

  it("an error", async () => {
    const result = parseSpineResponseXml(errorExample)
    console.log(result)
  })
})
