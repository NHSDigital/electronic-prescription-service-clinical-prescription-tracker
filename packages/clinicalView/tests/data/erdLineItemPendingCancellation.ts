/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:1CC36A0A-F821-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
                <id root="1CC36A0A-F821-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250303111737"/>
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
                                <prescribingSite_status>['A83008_0002', 'A83008_0005']</prescribingSite_status>
                                <nominatedPharmacy_status>['VNE51_0002', 'VNE51_0005']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['expire_20250903']</nextActivity_nextActivityDate>
                                <dispenser_status>['Y02494_0002', 'VNE51_0005']['Y02494_0002', 'VNE51_0005']</dispenser_status>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <releaseRequestMsgRef>20250303111442080499_2836D4_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0002</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250303111442</downloadDate>
                                <completionDate>False</completionDate>
                                <expiryDate>20250903</expiryDate>
                                <dispenseWindow>
                                    <low value="20250303"/>
                                    <high value="20250403"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="DA63D65E-E576-4343-B5B7-5B058D20B821"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="25B9DC6F-5469-44B9-803D-585D53FB1158"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="DC0D4519-1383-4EF9-9C7C-8F812B4B456E"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0008"/>
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
                                    <messageID>"139A1628-3332-48DF-86E8-4B05B979B66E"</messageID>
                                    <timestamp>"20250303111331"</timestamp>
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
                                    <messageID>"A4E80BDD-E643-4C72-BB14-5AD67215153A"</messageID>
                                    <timestamp>"20250303111442"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>4</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0002</status>
                                    <instanceStatus>0002</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was not cancelled. With dispenser. Marked for cancellation"</message>
                                    <messageID>"2E713912-D318-41D5-9AB4-A9BF68881E9F"</messageID>
                                    <timestamp>"20250303111549"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>5</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0002</status>
                                    <instanceStatus>0002</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was not cancelled. With dispenser. Marked for cancellation"</message>
                                    <messageID>"A2F19BAA-9D41-4A15-862C-7E7F5EBFB5C1"</messageID>
                                    <timestamp>"20250303111616"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>6</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0002</status>
                                    <instanceStatus>0002</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was not cancelled. With dispenser. Marked for cancellation"</message>
                                    <messageID>"6FFAD475-2773-4DE9-AF39-8ADC6D240548"</messageID>
                                    <timestamp>"20250303111630"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>7</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0002</status>
                                    <instanceStatus>0002</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was not cancelled. With dispenser. Marked for cancellation"</message>
                                    <messageID>"766F5EE4-7783-4BBC-B20D-82A393F3D424"</messageID>
                                    <timestamp>"20250303111702"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250303111331</timestamp>
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
                                            <id>DA63D65E-E576-4343-B5B7-5B058D20B821</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>25B9DC6F-5469-44B9-803D-585D53FB1158</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>DC0D4519-1383-4EF9-9C7C-8F812B4B456E</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250303111442</timestamp>
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
                                            <id>DA63D65E-E576-4343-B5B7-5B058D20B821</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>25B9DC6F-5469-44B9-803D-585D53FB1158</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>DC0D4519-1383-4EF9-9C7C-8F812B4B456E</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250303111549</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription/item was not cancelled. With dispenser. Marked for cancellation</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>DA63D65E-E576-4343-B5B7-5B058D20B821</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>25B9DC6F-5469-44B9-803D-585D53FB1158</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>DC0D4519-1383-4EF9-9C7C-8F812B4B456E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>5</SCN>
                                    <timestamp>20250303111616</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription/item was not cancelled. With dispenser. Marked for cancellation</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>DA63D65E-E576-4343-B5B7-5B058D20B821</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>25B9DC6F-5469-44B9-803D-585D53FB1158</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>DC0D4519-1383-4EF9-9C7C-8F812B4B456E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>6</SCN>
                                    <timestamp>20250303111630</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription/item was not cancelled. With dispenser. Marked for cancellation</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>DA63D65E-E576-4343-B5B7-5B058D20B821</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>25B9DC6F-5469-44B9-803D-585D53FB1158</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Change to medication treatment regime</cancellationReason>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>DC0D4519-1383-4EF9-9C7C-8F812B4B456E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>7</SCN>
                                    <timestamp>20250303111702</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription/item was not cancelled. With dispenser. Marked for cancellation</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>DA63D65E-E576-4343-B5B7-5B058D20B821</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>25B9DC6F-5469-44B9-803D-585D53FB1158</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C7BB9828-EF97-4FAF-A0E1-CC7FDCAD2B29</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Change to medication treatment regime</cancellationReason>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>DC0D4519-1383-4EF9-9C7C-8F812B4B456E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Pending: Prescribing Error</cancellationReason>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>                                <!--Dispense Specific Information-->
                                <dispensingOrganization>Y02494</dispensingOrganization>
                                <lastDispenseDate>False</lastDispenseDate>
                                <lastDispenseNotificationMsgRef/>
                                <lastDispenseNotificationGuid/>
                                <!--Claim Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate>                                <!--Prescription Specific Information-->
                                <currentInstance>1</currentInstance>
                                <signedTime>20250303111328</signedTime>
                                <prescriptionTreatmentType>0003</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250303000000</prescriptionTime>
                                <prescriptionID>ECD9BE-A83008-753A71</prescriptionID>
                                <prescriptionMsgRef>20250303111331254798_986E2E_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>10</daysSupply>
                                <maxRepeats>7</maxRepeats>
                                <eventID>139A1628-3332-48DF-86E8-4B05B979B66E</eventID>                                <!--Patient Specific Information-->
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
                                </parentPrescription>
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
