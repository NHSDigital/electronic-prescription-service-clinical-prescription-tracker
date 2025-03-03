/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:5F755E12-F3FD-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
        <wsa:RelatesTo>uuid:86c01aeb-9e9f-42f4-9942-fb8491ef731f</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="5F755E12-F3FD-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250226045142"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="86c01aeb-9e9f-42f4-9942-fb8491ef731f"/>
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
                                <prescribingSite_status>['A83008_0006']</prescribingSite_status>
                                <nominatedPharmacy_status>['FA565_0006']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['createNoClaim_20250825']</nextActivity_nextActivityDate>
                                <dispenser_status>['FA565_0006']</dispenser_status>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <releaseRequestMsgRef>20250226045029122703_54129E_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0006</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250226045029</downloadDate>
                                <completionDate>20250226</completionDate>
                                <expiryDate/>
                                <dispenseWindow>
                                    <low value="20250226"/>
                                    <high value="20260226"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="1B2674DF-DC60-4CB7-AF52-597CC5BE08C5"/>
                                    <previousStatus value="0008"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="D20E03E2-A6E2-4F45-B03E-E6234DED168E"/>
                                    <previousStatus value="0008"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="BF62211E-199C-4E58-A8E1-164B2A8E3748"/>
                                    <previousStatus value="0008"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="2274E170-1DED-40D7-9159-6B3FEA484FB5"/>
                                    <previousStatus value="0008"/>
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
                                    <messageID>"016CFDC2-C71C-4A15-85F6-AF674F7672E3"</messageID>
                                    <timestamp>"20250226044949"</timestamp>
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
                                    <agentPersonOrgCode>YGM1E</agentPersonOrgCode>
                                    <message>"Release Request successful"</message>
                                    <messageID>"800C7BC0-ACA8-4E2D-B3A6-91A5BB5DFC8A"</messageID>
                                    <timestamp>"20250226045029"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>4</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN080101SM31</interactionID>
                                    <status>0006</status>
                                    <instanceStatus>0006</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>FA565</agentPersonOrgCode>
                                    <message>"Dispense notification successful; Update applied to issue=1"</message>
                                    <messageID>"AF57AF0C-EA36-41C8-83E9-9E9D7317B3FE"</messageID>
                                    <timestamp>"20250226045101"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250226044949</timestamp>
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
                                            <id>1B2674DF-DC60-4CB7-AF52-597CC5BE08C5</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>D20E03E2-A6E2-4F45-B03E-E6234DED168E</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>BF62211E-199C-4E58-A8E1-164B2A8E3748</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>2274E170-1DED-40D7-9159-6B3FEA484FB5</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250226045029</timestamp>
                                    <fromStatus>0001</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>555086415105</agentRoleProfileCodeId>
                                    <message>Release Request successful</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>YGM1E</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>1B2674DF-DC60-4CB7-AF52-597CC5BE08C5</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>D20E03E2-A6E2-4F45-B03E-E6234DED168E</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>BF62211E-199C-4E58-A8E1-164B2A8E3748</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>2274E170-1DED-40D7-9159-6B3FEA484FB5</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250226045101</timestamp>
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
                                            <id>1B2674DF-DC60-4CB7-AF52-597CC5BE08C5</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>D20E03E2-A6E2-4F45-B03E-E6234DED168E</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>BF62211E-199C-4E58-A8E1-164B2A8E3748</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>2274E170-1DED-40D7-9159-6B3FEA484FB5</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>                                <!--Dispense Specific Information-->
                                <dispensingOrganization>FA565</dispensingOrganization>
                                <lastDispenseDate>20250226</lastDispenseDate>
                                <lastDispenseNotificationMsgRef>20250226045101178730_21F242_1614371148</lastDispenseNotificationMsgRef>
                                <lastDispenseNotificationGuid>AF57AF0C-EA36-41C8-83E9-9E9D7317B3FE</lastDispenseNotificationGuid>                                <!--Claim Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate>                                <!--Prescription Specific Information-->
                                <currentInstance>1</currentInstance>
                                <signedTime>20250226044948</signedTime>
                                <prescriptionTreatmentType>0001</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250226000000</prescriptionTime>
                                <prescriptionID>D1419E-A83008-A3641P</prescriptionID>
                                <prescriptionMsgRef>20250226044949443737_75DC2E_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>28</daysSupply>
                                <maxRepeats/>
                                <eventID>016CFDC2-C71C-4A15-85F6-AF674F7672E3</eventID>                                <!--Patient Specific Information-->
                                <lowerAgeLimit>19640429</lowerAgeLimit>
                                <higherAgeLimit>20080430</higherAgeLimit>
                                <patientNhsNumber>5839945242</patientNhsNumber>
                                <patientBirthTime>19480430</patientBirthTime>                                <!--Nomination Specific Information-->
                                <nominatedPerformer>FA565</nominatedPerformer>
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
                                    <dispNotifDocumentKey>20250226045101178730_21F242_1614371148</dispNotifDocumentKey>
                                    <dispNotifFromStatus>0002</dispNotifFromStatus>
                                    <dispNotifToStatus>0006</dispNotifToStatus>
                                    <dispenseNotifDateTime>20250226045039</dispenseNotifDateTime>
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
