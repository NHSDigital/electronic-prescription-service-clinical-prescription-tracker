
export interface ServiceError {
  status: string
  severity: "error" | "fatal"
  description: string
}

export interface CommonHeaderParameters {
  requestId?: string
  correlationId?: string
  organizationId?: string
  sdsRoleProfileId?: string
  sdsId?: string
  jobRoleCode?: string
}
