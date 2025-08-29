/* eslint-disable max-len */
import {readFileSync} from "fs"
import path from "path"

const readXmlToString = (filename: string) => {
  return readFileSync(path.resolve("tests/examples", filename)).toString()
}

// Standard statuses & states
export const acuteCreated = readXmlToString("acuteCreated.xml")
export const acuteNonNominatedCreated = readXmlToString("acuteNonNominatedCreated.xml")
export const acuteReleased = readXmlToString("acuteReleased.xml")
export const acuteDispensed = readXmlToString("acuteDispensed.xml")
export const acuteDispensedWithASingleItem = readXmlToString("acuteDispensedWithSingleItem.xml")
export const acuteDispensedWithMultipleComponents = readXmlToString("acuteDispensedWithMultipleComponents.xml")

// Optional prescription details
export const acuteWithoutOptionalPatientDetails = readXmlToString("acuteWithoutOptionalPatientDetails.xml")
export const acuteWithEmptyDosageInstructions = readXmlToString("acuteWithEmptyDosageInstructions.xml")
export const acuteWithoutOptionalDosageInstructions = readXmlToString("acuteWithoutOptionalDosageInstructions.xml")
export const acuteWithoutOptionalDaysSupply = readXmlToString("acuteWithoutOptionalDaysSupply.xml")

// Dispenses & dispense notifications
export const acutePartiallyDispensed = readXmlToString("acutePartiallyDispensed.xml")
export const acuteWithItemPartiallyDispensed = readXmlToString("acuteWithItemPartiallyDispensed.xml")
export const acuteCumulativeMultipleDispenseNotifications = readXmlToString("acuteCumulativeMultipleDispenseNotifications.xml")
export const acuteAdditiveMultipleDispenseNotifications = readXmlToString("acuteAdditiveMultipleDispenseNotifications.xml")
export const altAcuteAdditiveMultipleDispenseNotifications = readXmlToString("altAcuteAdditiveMultipleDispenseNotifications.xml")
export const acuteWithPartialDispenseNotification = readXmlToString("acuteWithPartialDispenseNotification.xml")
export const acuteDispensedWithMismatchedIds = readXmlToString("acuteDispensedWithMismatchedIds.xml")
export const acuteMultipleDispenseNotificationsWithMismatchedIds = readXmlToString("acuteMultipleDispenseNotificationsWithMismatchedIds.xml")

// Withdrawals & Amendments
export const acuteWithWithdrawnDispenseNotification = readXmlToString("acuteWithWithdrawnDispenseNotification.xml")
export const acuteWithdrawn = readXmlToString("acuteWithdrawn.xml")
export const acuteWithWithdrawnAmendment = readXmlToString("acuteWithWithdrawnAmendment.xml")

// Cancellations & pending cancellations
export const acuteWithCancelledItem = readXmlToString("acuteWithCancelledItem.xml")
export const acuteCancelled = readXmlToString("acuteCancelled.xml")
export const acuteCancelledWithReason =readXmlToString("acuteCancelledWithReason.xml")
export const acuteWithItemPendingCancellation = readXmlToString("acuteWithItemPendingCancellation.xml")
export const acutePendingCancellation = readXmlToString("acutePendingCancellation.xml")
export const acutePendingCancellationWithReason = readXmlToString("acutePendingCancellationWithReason.xml")

// Non dispensing
export const acuteWithNonDispensedItem = readXmlToString("acuteWithNonDispensedItem.xml")
export const acuteNonDispensed = readXmlToString("acuteNonDispensed.xml")
export const acuteNonDispensedWithReason = readXmlToString("acuteNonDispensedWithReason.xml")

// Other prescription types
export const erdCreated = readXmlToString("erdCreated.xml")
export const erdDispensedWith0Quantity = readXmlToString("erdDispensedWith0Quantity.xml")

// Error scenarios
export const notFound = readXmlToString("notFound.xml")
export const unknownError = readXmlToString("unknownError.xml")
export const malformedError = readXmlToString("malformedError.xml")
