import {Logger} from "@aws-lambda-powertools/logger"
import {CommonHeaderParameters, ServiceError} from "@cpt-common/common-types/service"
import {APIGatewayProxyEventHeaders} from "aws-lambda"

export const validateCommonHeaders = (
  eventHeaders: APIGatewayProxyEventHeaders, logger: Logger): [CommonHeaderParameters, Array<ServiceError>] => {

  const errors: Array<ServiceError> = []

  const requestId: string | undefined = eventHeaders?.["x-request-id"]
  if(!requestId) {
    logger.error("Missing required header, x-request-id.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required header, x-request-id."
    })
  }
  logger.appendKeys({"x-request-id": requestId})

  const organizationId: string | undefined = eventHeaders?.["nhsd-organization-uuid"]
  if(!organizationId) {
    logger.error("Missing required header, nhsd-organization-uuid.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-organization-uuid."
    })
  }

  const sdsRoleProfileId: string | undefined = eventHeaders?.["nhsd-session-urid"]
  if(!sdsRoleProfileId) {
    logger.error("Missing required header, nhsd-session-urid.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-urid."
    })
  }

  const sdsId: string | undefined = eventHeaders?.["nhsd-identity-uuid"]
  if(!sdsId) {
    logger.error("Missing required header, nhsd-identity-uuid.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-identity-uuid."
    })
  }

  const jobRoleCode: string | undefined = eventHeaders?.["nhsd-session-jobrole"]
  if(!jobRoleCode) {
    logger.error("Missing required header, nhsd-session-jobrole.")
    errors.push({
      status: 400,
      severity: "error",
      description: "Missing required header, nhsd-session-jobrole."
    })
  }

  const headerParameters: CommonHeaderParameters = {
    requestId,
    organizationId,
    sdsRoleProfileId,
    sdsId,
    jobRoleCode
  }

  return [headerParameters, errors]
}

const PRESCRIPTION_ID_PATTERN = /^[A-F0-9]{6}-[A-Z0-9]{6}-[A-F0-9]{5}[A-Z0-9+]{1}$/
const PRESCRIPTION_ID_WITHOUT_CHECKSUM_LENGTH = 17 as const
const CHECKSUM_CHARACTERS = [..."0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ+"] as const

export const validatePrescriptionId = (prescriptionId: string, logger: Logger): Array<ServiceError> => {
  const errors: Array<ServiceError> = []

  const validFormat = PRESCRIPTION_ID_PATTERN.test(prescriptionId)
  if (!validFormat) {
    logger.error("prescriptionId does not match required format.", {prescriptionId})
    errors.push({
      status: 400,
      severity: "error",
      description: "prescriptionId does not match required format."
    })
  }

  const idWithoutDelimiters = prescriptionId.replaceAll("-", "")
  const [idWithoutChecksum, checksum] = idWithoutDelimiters.split(/(?<=^.{17})/)

  let total = 0
  for (const [charIndex, char] of [...idWithoutChecksum].entries()){
    const charMod36 = parseInt(char, 36)
    total += charMod36 * (2 ** (PRESCRIPTION_ID_WITHOUT_CHECKSUM_LENGTH - charIndex))
  }

  const calculatedChecksumValue = (38 - total % 37) % 37
  const calculatedChecksumChar = CHECKSUM_CHARACTERS[calculatedChecksumValue]

  if (!calculatedChecksumChar || !checksum || calculatedChecksumChar !== checksum){
    logger.error("Invalid prescriptionId checksum.", {
      prescriptionId,
      checksum: `${checksum}`, // logger does not include the key/value in the log if directly passed an undefined value
      calculatedChecksumChar: `${calculatedChecksumChar}`
    })
    errors.push({
      status: 400,
      severity: "error",
      description: "prescriptionId checksum is invalid."
    })
  }
  return errors
}

const NHS_NUMBER_PATTERN = /^\d{10}$/

export const validateNhsNumber = (nhsNumber: string, logger: Logger): Array<ServiceError> => {
  const errors: Array<ServiceError> = []

  const validFormat = NHS_NUMBER_PATTERN.test(nhsNumber)
  if (!validFormat) {
    logger.error("nhsNumber does not match required format.", {nhsNumber})
    errors.push({
      status: 400,
      severity: "error",
      description: "nhsNumber does not match required format."
    })
  }

  const [nhsNumberWithoutChecksum, checksum] = nhsNumber.split(/(?<=^.{9})/)

  let total = 0
  for (const [digitIndex, digit] of [...nhsNumberWithoutChecksum].entries()) {
    total += Number(digit) * (10 - digitIndex)
  }
  const remainder = total % 11

  let calculatedChecksum = 11 - remainder
  if (calculatedChecksum === 11) {
    calculatedChecksum = 0
  }

  if (checksum === undefined || calculatedChecksum === 10 || calculatedChecksum !== Number(checksum)){
    logger.error("Invalid nhsNumber checksum.", {
      nhsNumber,
      checksum: `${checksum}`,
      calculatedChecksum: `${calculatedChecksum}`
    })
    errors.push({
      status: 400,
      severity: "error",
      description: "nhsNumber checksum is invalid."
    })
  }

  return errors
}
