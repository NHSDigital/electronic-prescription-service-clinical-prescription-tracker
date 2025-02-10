import {PrescriptionSearchResults} from "./types"

export const generateFhirResponse = (prescriptionSearchResults: PrescriptionSearchResults) => {
  const responseBundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: prescriptionSearchResults.length,
    entry: []
  }

  for (const prescription of prescriptionSearchResults){
    console.log(prescription)
    // const requestGroup = {
    //   resource: {

    //   }
    // }
    // responseBundle.entry.push(requestGroup)
  }
  return responseBundle
}
