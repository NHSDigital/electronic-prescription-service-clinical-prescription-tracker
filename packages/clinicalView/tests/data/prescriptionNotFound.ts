
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP-ENV:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
  xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
  xmlns="urn:hl7-org:v3"
  xmlns:hl7="urn:hl7-org:v3">
  <SOAP-ENV:Header>
    <wsa:MessageID>uuid:45B5FA22-F7C7-11EF-B36D-0608FC2E3D30</wsa:MessageID>
    <wsa:Action>urn:nhs:names:services:mmquery/MCCI_IN010000UK13</wsa:Action>
    <wsa:To/>
    <wsa:From>
      <wsa:Address>https://mmquery.national.ncrs.nhs.uk/syncservice</wsa:Address>
    </wsa:From>
    <communicationFunctionRcv typeCode="RCV">
      <device classCode="DEV" determinerCode="INSTANCE">
        <id root="1.2.826.0.1285.0.2.0.107" extension="200000002066"/>
      </device>
    </communicationFunctionRcv>
    <communicationFunctionSnd typeCode="SND">
      <device classCode="DEV" determinerCode="INSTANCE">
        <id root="1.2.826.0.1285.0.2.0.107" extension="Not Known"/>
      </device>
    </communicationFunctionSnd>
    <wsa:RelatesTo>uuid:8419d7df-16c3-47ac-bb30-000000000008</wsa:RelatesTo>
  </SOAP-ENV:Header>
  <SOAP-ENV:Body>
    <prescriptionClinicalViewResponse>
      <MCCI_IN010000UK13>
        <id root="45B5FA22-F7C7-11EF-B36D-0608FC2E3D30"/>
        <creationTime value="20250303003431"/>
        <versionCode code="1.0"/>
        <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="MCCI_IN010000UK13"/>
        <processingCode code="P"/>
        <processingModeCode code="T"/>
        <acceptAckCode code="NE"/>
        <acknowledgement typeCode="AR">
          <acknowledgementDetail typeCode="ER">
            <code codeSystem="PRESCRIPTION_SEARCH_ERROR" code="0001" displayName="Prescription not found"/>
          </acknowledgementDetail>
          <messageRef>
            <id root="8419d7df-16c3-47ac-bb30-000000000008"/>
          </messageRef>
        </acknowledgement>
        <communicationFunctionRcv typeCode="RCV">
          <device classCode="DEV" determinerCode="INSTANCE">
            <id root="1.2.826.0.1285.0.2.0.107" extension="200000002066"/>
          </device>
        </communicationFunctionRcv>
        <communicationFunctionSnd typeCode="SND">
          <device classCode="DEV" determinerCode="INSTANCE">
            <id root="1.2.826.0.1285.0.2.0.107" extension="Not Known"/>
          </device>
        </communicationFunctionSnd>
        <ControlActEvent classCode="CACT" moodCode="EVN">
          <author1 typeCode="AUT">
            <AgentSystemSDS classCode="AGNT">
              <agentSystemSDS classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="Not Known"/>
              </agentSystemSDS>
            </AgentSystemSDS>
          </author1>
        </ControlActEvent>
      </MCCI_IN010000UK13>
    </prescriptionClinicalViewResponse>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`
