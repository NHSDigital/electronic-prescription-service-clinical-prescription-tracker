/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:5465B828-F7E0-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
        <wsa:RelatesTo>uuid:8419d7df-16c3-47ac-bb30-000000000008</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="5465B828-F7E0-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250303033353"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
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
                    <reason typeCode="RSON"/>
                    <subject typeCode="SUBJ">
                        <PrescriptionJsonQueryResponse xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 ..\\schemas\\PORX_MT000006UK02.xsd" classCode="ORGANIZER" moodCode="EVN">
                            <id root="F8966CE0-E034-11DA-863F-A7A405B41481"/>
                            <effectiveTime value="20050922101500"/>
                            <epsIndex>                                <!-- These are the secondary index items for the record-->
                                <prescribingSite_status>['A83008_9000', 'A83008_0000', 'A83008_0006']</prescribingSite_status>
                                <nominatedPharmacy_status>['VNE51_9000', 'VNE51_0000', 'VNE51_0006']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['ready_20250306']</nextActivity_nextActivityDate>
                                <dispenser_status>['VNE51_0000', 'VNE51_9000', 'FA565_0006']['VNE51_0000', 'VNE51_9000', 'FA565_0006']['VNE51_0000', 'VNE51_9000', 'FA565_0006']</dispenser_status>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <releaseRequestMsgRef>20250303033037919968_49DA35_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0006</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250303033037</downloadDate>
                                <completionDate>20250303</completionDate>
                                <expiryDate/>
                                <dispenseWindow>
                                    <low value="20250303"/>
                                    <high value="20250403"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="86BB7329-B775-4520-8AF4-6BECBD880FC0"/>
                                    <previousStatus value="0008"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="C8BA4E70-28F5-4A52-AA1B-F63299BC0357"/>
                                    <previousStatus value="0008"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="7CA91F47-3BA8-4BC7-9676-530271051012"/>
                                    <previousStatus value="0008"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="684520EF-74C2-4699-8849-F0FF6B06D4CE"/>
                                    <previousStatus value="0008"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0001"/>
                                </lineItem>                                <!--Prescription History-->
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
                                    <messageID>"7775A2C6-A63C-4C37-BA3A-3CC84FE9FD82"</messageID>
                                    <timestamp>"20250303032907"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>3</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN132004SM30</interactionID>
                                    <status>0002</status>
                                    <instanceStatus>0002</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>Y02494</agentPersonOrgCode>
                                    <message>"Release Request successful"</message>
                                    <messageID>"099CA4EC-C4D1-44A8-BA3C-C3B895AC81FA"</messageID>
                                    <timestamp>"20250303033037"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>4</SCN>
                                    <instance>2</instance>
                                    <interactionID>PORX_IN080101SM31</interactionID>
                                    <status>0000</status>
                                    <instanceStatus>0000</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>FA565</agentPersonOrgCode>
                                    <message>"Dispense notification successful; Update applied to issue=1"</message>
                                    <messageID>"132A82B9-B189-4D9B-93B0-47C0E8087121"</messageID>
                                    <timestamp>"20250303033106"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250303032907</timestamp>
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
                                            <id>86BB7329-B775-4520-8AF4-6BECBD880FC0</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>C8BA4E70-28F5-4A52-AA1B-F63299BC0357</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>7CA91F47-3BA8-4BC7-9676-530271051012</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>684520EF-74C2-4699-8849-F0FF6B06D4CE</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250303033037</timestamp>
                                    <fromStatus>0001</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>555086415105</agentRoleProfileCodeId>
                                    <message>Release Request successful</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>Y02494</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>86BB7329-B775-4520-8AF4-6BECBD880FC0</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>C8BA4E70-28F5-4A52-AA1B-F63299BC0357</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>7CA91F47-3BA8-4BC7-9676-530271051012</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>684520EF-74C2-4699-8849-F0FF6B06D4CE</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250303033106</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0006</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>555086415105</agentRoleProfileCodeId>
                                    <message>Dispense notification successful; Update applied to issue=1</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>FA565</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>86BB7329-B775-4520-8AF4-6BECBD880FC0</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>C8BA4E70-28F5-4A52-AA1B-F63299BC0357</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>7CA91F47-3BA8-4BC7-9676-530271051012</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>684520EF-74C2-4699-8849-F0FF6B06D4CE</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>                                <!--Dispense Specific Information-->
                                <dispensingOrganization>FA565</dispensingOrganization>
                                <lastDispenseDate>20250303</lastDispenseDate>
                                <lastDispenseNotificationMsgRef>20250303033106625525_21DC2F_1614371148</lastDispenseNotificationMsgRef>
                                <lastDispenseNotificationGuid>132A82B9-B189-4D9B-93B0-47C0E8087121</lastDispenseNotificationGuid>                                <!--Claim Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate>                                <!--Prescription Specific Information-->
                                <currentInstance>2</currentInstance>
                                <signedTime>20250303032904</signedTime>
                                <prescriptionTreatmentType>0003</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250303000000</prescriptionTime>
                                <prescriptionID>A68248-A83008-08350Z</prescriptionID>
                                <prescriptionMsgRef>20250303032907606383_8AFC9E_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>10</daysSupply>
                                <maxRepeats>7</maxRepeats>
                                <eventID>7775A2C6-A63C-4C37-BA3A-3CC84FE9FD82</eventID>                                <!--Patient Specific Information-->
                                <lowerAgeLimit>19640429</lowerAgeLimit>
                                <higherAgeLimit>20080430</higherAgeLimit>
                                <patientNhsNumber>9449304130</patientNhsNumber>
                                <patientBirthTime>19480430</patientBirthTime>                                <!--Nomination Specific Information-->
                                <nominatedPerformer>VNE51</nominatedPerformer>
                                <nominatedPerformerType>P1</nominatedPerformerType>                                <!--Parent Prescription Information-->
                                <parentPrescription>
                                    <birthTime>19480430</birthTime>
                                    <administrativeGenderCode>2</administrativeGenderCode>
                                    <prefix>MS</prefix>
                                    <given>STACEY</given>
                                    <family>TWITCHETT</family>
                                    <suffix/>
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
                                </parentPrescription>                                <!--Dispense Notification Information-->
                                <dispenseNotification>
                                    <dispNotifDocumentKey>20250303033106625525_21DC2F_1614371148</dispNotifDocumentKey>
                                    <dispNotifFromStatus>0002</dispNotifFromStatus>
                                    <dispNotifToStatus>0006</dispNotifToStatus>
                                    <dispenseNotifDateTime>20250303033044</dispenseNotifDateTime>
                                    <productLineItem1>Amoxicillin 250mg capsules</productLineItem1>
                                    <quantityLineItem1>20</quantityLineItem1>
                                    <narrativeLineItem1>tablet</narrativeLineItem1>
                                    <statusLineItem1>0001</statusLineItem1>
                                    <productLineItem2>Co-codamol 30mg/500mg tablets</productLineItem2>
                                    <quantityLineItem2>20</quantityLineItem2>
                                    <narrativeLineItem2>tablet</narrativeLineItem2>
                                    <statusLineItem2>0001</statusLineItem2>
                                    <productLineItem3>Pseudoephedrine hydrochloride 60mg tablets</productLineItem3>
                                    <quantityLineItem3>30</quantityLineItem3>
                                    <narrativeLineItem3>tablet</narrativeLineItem3>
                                    <statusLineItem3>0001</statusLineItem3>
                                    <productLineItem4>Azithromycin 250mg capsules</productLineItem4>
                                    <quantityLineItem4>30</quantityLineItem4>
                                    <narrativeLineItem4>tablet</narrativeLineItem4>
                                    <statusLineItem4>0001</statusLineItem4>
                                    <statusPrescription>0006</statusPrescription>
                                </dispenseNotification>
                            </epsRecord>
                        </PrescriptionJsonQueryResponse>
                    </subject>
                    <queryAck type="QueryAck">
                        <queryResponseCode code="OK"/>
                    </queryAck>
                </ControlActEvent>
            </PORX_IN000006UK98>
        </prescriptionClinicalViewResponse>
    </SOAP:Body>
</SOAP:Envelope>`
