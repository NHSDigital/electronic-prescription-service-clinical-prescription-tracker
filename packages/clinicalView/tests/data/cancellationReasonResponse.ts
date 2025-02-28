/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:4A1DBDF2-F2A4-11EF-B36D-0608FC2E3D30</wsa:MessageID>
        <wsa:Action>urn:nhs:names:services:mmquery/PORX_IN000006UK98</wsa:Action>
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
        <wsa:RelatesTo>uuid:cc393c9d-d31b-42e1-8193-f5e234605918</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="4A1DBDF2-F2A4-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250224114130"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="cc393c9d-d31b-42e1-8193-f5e234605918"/>
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
                    <reason typeCode="RSON"/>
                    <subject typeCode="SUBJ">
                        <PrescriptionJsonQueryResponse xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 ..\\schemas\\PORX_MT000006UK02.xsd" classCode="ORGANIZER" moodCode="EVN">
                            <id root="F8966CE0-E034-11DA-863F-A7A405B41481"/>
                            <effectiveTime value="20050922101500"/>
                            <epsIndex>
                                <prescribingSite_status>['A83008_0002']</prescribingSite_status>
                                <nominatedPharmacy_status>['FA565_0002']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['expire_20250824']</nextActivity_nextActivityDate>
                                <dispenser_status>['Y02494_0002']</dispenser_status>
                            </epsIndex>
                            <epsRecord>
                                <releaseRequestMsgRef>20250224113847504048_5FAE2B_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0002</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250224113847</downloadDate>
                                <completionDate>False</completionDate>
                                <expiryDate>20250824</expiryDate>
                                <dispenseWindow>
                                    <low value="20250224"/>
                                    <high value="20260224"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="DAD23C1F-71A4-473A-9273-C83C8BFC5F64"/>
                                    <previousStatus value="0007"/>
                                    <status value="0005"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="89741606-DFE8-4D8C-B630-6734F71B721A"/>
                                    <previousStatus value="0007"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="881E56E2-6AF7-4ECF-92E4-10C71D4A8370"/>
                                    <previousStatus value="0007"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="CA5E32F4-8846-4F11-9D14-61AD8A681F5F"/>
                                    <previousStatus value="0007"/>
                                    <status value="0008"/>
                                </lineItem>
                                <history>
                                    <SCN>2</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN020101SM31</interactionID>
                                    <status>0001</status>
                                    <instanceStatus>0001</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription upload successful"</message>
                                    <messageID>"E781231F-BB60-40A4-977B-4BF141B475CA"</messageID>
                                    <timestamp>"20250224113656"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>3</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0001</status>
                                    <instanceStatus>0001</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was cancelled"</message>
                                    <messageID>"FFF62A47-1A5D-4273-ABF9-C0EE0109C136"</messageID>
                                    <timestamp>"20250224113730"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>4</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN132004SM30</interactionID>
                                    <status>0002</status>
                                    <instanceStatus>0002</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>Y02494</agentPersonOrgCode>
                                    <message>"Release Request successful"</message>
                                    <messageID>"1B6354CD-1810-4726-AABB-182DE09BDB6A"</messageID>
                                    <timestamp>"20250224113847"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250224113656</timestamp>
                                    <message>Prescription upload successful</message>
                                </filteredHistory>
                            </epsRecord>
                        </PrescriptionJsonQueryResponse>
                    </subject>
                </ControlActEvent>
            </PORX_IN000006UK98>
        </prescriptionClinicalViewResponse>
    </SOAP:Body>
</SOAP:Envelope>`
