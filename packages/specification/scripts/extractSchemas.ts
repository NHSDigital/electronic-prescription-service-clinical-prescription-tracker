import path from "path"
import {prescriptionSearchBundle} from "prescriptionSearch"
import {clinicalViewBundle} from "clinicalView"
import {operationOutcome} from "@cpt-common/common-types/schema"
import {writeSchemas} from "@nhsdigital/eps-deployment-utils"

writeSchemas(
  {prescriptionSearchBundle, clinicalViewBundle, operationOutcome},
  path.join(".", "schemas", "resources")
)
