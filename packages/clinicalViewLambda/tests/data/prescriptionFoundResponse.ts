/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:2831F64C-7732-11EF-93C2-0608FC2E3D30</wsa:MessageID>
        <wsa:Action>urn:nhs:names:services:mmquery/PORX_IN000006UK98</wsa:Action>
        <wsa:To />
        <wsa:From>
            <wsa:Address>https://mmquery.national.ncrs.nhs.uk/syncservice</wsa:Address>
        </wsa:From>
        <communicationFunctionRcv typeCode="RCV">
            <device classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="200000002066" />
            </device>
        </communicationFunctionRcv>
        <communicationFunctionSnd typeCode="SND">
            <device classCode="DEV" determinerCode="INSTANCE">
                <id root="1.2.826.0.1285.0.2.0.107" extension="Not Known" />
            </device>
        </communicationFunctionSnd>
        <wsa:RelatesTo>uuid:2aecdad4-1a4a-44de-977e-c0a2964f23dd</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="2831F64C-7732-11EF-93C2-0608FC2E3D30" />
                <creationTime value="20240920092437" />
                <versionCode code="V3NPfIT3.0" />
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98" />
                <processingCode code="P" />
                <processingModeCode code="T" />
                <acceptAckCode code="NE" />
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="2aecdad4-1a4a-44de-977e-c0a2964f23dd" />
                    </messageRef>
                </acknowledgement>
                <communicationFunctionRcv typeCode="RCV">
                    <device classCode="DEV" determinerCode="INSTANCE">
                        <id root="1.2.826.0.1285.0.2.0.107" extension="200000002066" />
                    </device>
                </communicationFunctionRcv>
                <communicationFunctionSnd typeCode="SND">
                    <device classCode="DEV" determinerCode="INSTANCE">
                        <id root="1.2.826.0.1285.0.2.0.107" extension="Not Known" />
                    </device>
                </communicationFunctionSnd>
                <ControlActEvent classCode="CACT" moodCode="EVN">
                    <author1 typeCode="AUT">
                        <AgentSystemSDS classCode="AGNT">
                            <agentSystemSDS classCode="DEV" determinerCode="INSTANCE">
                                <id root="1.2.826.0.1285.0.2.0.107" extension="Not Known" />
                            </agentSystemSDS>
                        </AgentSystemSDS>
                    </author1>
                    <reason typeCode="RSON" />
                    <subject typeCode="SUBJ">
                        <PrescriptionJsonQueryResponse
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xsi:schemaLocation="urn:hl7-org:v3 ..\\schemas\\PORX_MT000006UK02.xsd"
                            classCode="ORGANIZER" moodCode="EVN">
                            <id root="F8966CE0-E034-11DA-863F-A7A405B41481" />
                            <effectiveTime value="20050922101500" />
                            <epsIndex><!-- These are the secondary index items for the record-->
                                <prescribingSite_status>['A83008_0001']</prescribingSite_status>
                                <nominatedPharmacy_status>['VNE51_0001']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['expire_20240813']</nextActivity_nextActivityDate>
                                <dispenser_status>['VNE51_0001']</dispenser_status>
                            </epsIndex>
                            <epsRecord><!-- These are the other fields stored on the JSON for the
                                record--><!--Prescription
                                Instance Specific Information-->
                                <prescriptionStatus>0001</prescriptionStatus>
                                <nominatedDownloadDate />
                                <downloadDate />
                                <completionDate>False</completionDate>
                                <expiryDate>20240813</expiryDate>
                                <dispenseWindow>
                                    <low value="20240213" />
                                    <high value="20250213" />
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1" />
                                    <ID value="E3F1BE1E-DD20-4166-800C-301AA6A2274F" />
                                    <status value="0007" />
                                </lineItem>
                                <lineItem>
                                    <order value="2" />
                                    <ID value="49096CE4-34FF-4AE7-A56D-9DEFF406C44A" />
                                    <status value="0007" />
                                </lineItem>
                                <lineItem>
                                    <order value="3" />
                                    <ID value="7F4AFB05-030F-4C6E-B134-8893C1BD10AE" />
                                    <status value="0007" />
                                </lineItem>
                                <lineItem>
                                    <order value="4" />
                                    <ID value="186F8A62-BD1C-4712-BA97-D301B8A043A9" />
                                    <status value="0007" />
                                </lineItem><!--Prescription
                                History-->
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
                                    <messageID>"45585FA1-E876-4467-A182-22E812D7CF69"</messageID>
                                    <timestamp>"20240213105241"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20240213105241</timestamp>
                                    <fromStatus>False</fromStatus>
                                    <toStatus>0001</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription upload successful</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>E3F1BE1E-DD20-4166-800C-301AA6A2274F</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>49096CE4-34FF-4AE7-A56D-9DEFF406C44A</id>
                                            <status />
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>7F4AFB05-030F-4C6E-B134-8893C1BD10AE</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>186F8A62-BD1C-4712-BA97-D301B8A043A9</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory><!--Dispense
                                Specific Information-->
                                <dispensingOrganization />
                                <lastDispenseDate>False</lastDispenseDate>
                                <lastDispenseNotificationMsgRef />
                                <lastDispenseNotificationGuid /><!--Claim
                                Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate><!--Prescription
                                Specific Information-->
                                <currentInstance>1</currentInstance>
                                <signedTime>20240213105241</signedTime>
                                <prescriptionTreatmentType>0001</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20240213000000</prescriptionTime>
                                <prescriptionID>9AD427-A83008-2E461K</prescriptionID>
                                <prescriptionMsgRef>
                                    20240213105241781264_F3748F_161437114857113154669091964608299129810</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>28</daysSupply>
                                <maxRepeats />
                                <eventID>45585FA1-E876-4467-A182-22E812D7CF69</eventID><!--Patient
                                Specific Information-->
                                <lowerAgeLimit>False</lowerAgeLimit>
                                <higherAgeLimit>False</higherAgeLimit>
                                <patientNhsNumber>9449304130</patientNhsNumber>
                                <patientBirthTime>19480430</patientBirthTime><!--Nomination
                                Specific Information-->
                                <nominatedPerformer>VNE51</nominatedPerformer>
                                <nominatedPerformerType>P1</nominatedPerformerType><!--Parent
                                Prescription Information-->
                                <parentPrescription>
                                    <birthTime>19480430</birthTime>
                                    <administrativeGenderCode>2</administrativeGenderCode>
                                    <prefix>MS</prefix>
                                    <given>STACEY</given>
                                    <family>TWITCHETT</family>
                                    <suffix />
                                    <addrLine1>10 HEATHFIELD</addrLine1>
                                    <addrLine2>COBHAM</addrLine2>
                                    <addrLine3>SURREY</addrLine3>
                                    <postalCode>KT11 2QY</postalCode>
                                    <productLineItem1>Amoxicillin 250mg capsules</productLineItem1>
                                    <quantityLineItem1>20</quantityLineItem1>
                                    <narrativeLineItem1>tablet</narrativeLineItem1>
                                    <dosageLineItem1>2 times a day for 10 days</dosageLineItem1>
                                    <productLineItem2>Co-codamol 30mg/500mg tablets</productLineItem2>
                                    <quantityLineItem2>20</quantityLineItem2>
                                    <narrativeLineItem2>tablet</narrativeLineItem2>
                                    <dosageLineItem2>2 times a day for 10 days</dosageLineItem2>
                                    <productLineItem3>Pseudoephedrine hydrochloride 60mg tablets</productLineItem3>
                                    <quantityLineItem3>30</quantityLineItem3>
                                    <narrativeLineItem3>tablet</narrativeLineItem3>
                                    <dosageLineItem3>3 times a day for 10 days</dosageLineItem3>
                                    <productLineItem4>Azithromycin 250mg capsules</productLineItem4>
                                    <quantityLineItem4>30</quantityLineItem4>
                                    <narrativeLineItem4>tablet</narrativeLineItem4>
                                    <dosageLineItem4>3 times a day for 10 days</dosageLineItem4>
                                </parentPrescription>
                            </epsRecord>
                        </PrescriptionJsonQueryResponse>
                    </subject>
                    <queryAck type="QueryAck">
                        <queryResponseCode code="OK" />
                    </queryAck>
                </ControlActEvent>
            </PORX_IN000006UK98>
        </prescriptionClinicalViewResponse>
    </SOAP:Body>
</SOAP:Envelope>`
