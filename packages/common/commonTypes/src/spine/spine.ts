export interface SpineXmlError {
  MCCI_IN010000UK13: {
    acknowledgement: {
      acknowledgementDetail: {
        code: {
          "@_codeSystem": string
          "@_code": string
          "@_displayName": string
        }
      }
    }
  }
  PORX_IN000006UK98: never
}

interface SpineSoapEnvelope<Response> {
  "SOAP:Envelope": {
    "SOAP:Body": Response
  }
  "SOAP-ENV:Envelope": never
}

interface SpineSoapEnvEnvelope<Response> {
  "SOAP-ENV:Envelope": {
    "SOAP-ENV:Body":Response
  }
  "SOAP:Envelope": never
}

export type SpineXmlResponse<Response> = SpineSoapEnvelope<Response> | SpineSoapEnvEnvelope<Response>

export const SPINE_TIMESTAMP_FORMAT = "yyyyMMddHHmmss" as const
export type SpineTreatmentTypeCode = "0001" | "0002" | "0003"
