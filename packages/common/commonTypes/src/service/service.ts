
export interface ServiceError {
  status: number
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
