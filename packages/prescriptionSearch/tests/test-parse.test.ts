import {parseErd} from "../src/parseSpineResponse"

describe("Test Parse", () => {
  it("does a parse", async () => {
    const result = parseErd()
    console.log(result)
  })
})
