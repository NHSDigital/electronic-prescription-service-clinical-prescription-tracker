/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:C8897D44-F384-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
        <wsa:RelatesTo>uuid:240fc767-d77f-42e9-a9be-53116d34ea88</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="C8897D44-F384-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250225142829"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="240fc767-d77f-42e9-a9be-53116d34ea88"/>
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
                                <prescribingSite_status>['A83008_0001']</prescribingSite_status>
                                <nominatedPharmacy_status/>
                                <nextActivity_nextActivityDate>['expire_20250825']</nextActivity_nextActivityDate>
                                <dispenser_status/>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <releaseRequestMsgRef>20250225142004168295_431C46_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0001</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250225142004</downloadDate>
                                <completionDate>False</completionDate>
                                <expiryDate>20250825</expiryDate>
                                <dispenseWindow>
                                    <low value="20250225"/>
                                    <high value="20260225"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="F9FC7631-AB66-463C-8EBC-DF9D37B22E0E"/>
                                    <previousStatus value="0007"/>
                                    <status value="0005"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="F1EBD8FA-23F2-4A50-A884-F0E57CB1C3DB"/>
                                    <previousStatus value="0008"/>
                                    <status value="0007"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="64291FDB-2177-4482-94E7-BE65925F51CE"/>
                                    <previousStatus value="0008"/>
                                    <status value="0007"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="9DBC7FB3-C38F-42D6-B188-A2577018F6D4"/>
                                    <previousStatus value="0008"/>
                                    <status value="0007"/>
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
                                    <messageID>"CE5B0DA1-030B-4F0B-8DCE-61E633BA039B"</messageID>
                                    <timestamp>"20250225141952"</timestamp>
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
                                    <messageID>"6516B286-C30A-4A89-B2D4-965E9A7E775B"</messageID>
                                    <timestamp>"20250225142004"</timestamp>
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
                                    <messageID>"64908D4A-07C4-4F82-9A69-1F9B99E25414"</messageID>
                                    <timestamp>"20250225142040"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>5</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN100101SM31</interactionID>
                                    <status>0001</status>
                                    <instanceStatus>0001</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>VNE51</agentPersonOrgCode>
                                    <message>Subsequent cancellation</message>
                                    <messageID>68EA5CC5-DC67-4FCF-B3A6-9AC91ECE9523</messageID>
                                    <timestamp>20250225142408</timestamp>
                                    <toASID/>
                                    <fromASID/>
                                </history>
                                <history>
                                    <SCN>6</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN100101SM31</interactionID>
                                    <status>0001</status>
                                    <instanceStatus>0001</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>VNE51</agentPersonOrgCode>
                                    <message>"Dispense proposal return successful"</message>
                                    <messageID>"68EA5CC5-DC67-4FCF-B3A6-9AC91ECE9523"</messageID>
                                    <timestamp>"20250225142408"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250225141952</timestamp>
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
                                            <id>F9FC7631-AB66-463C-8EBC-DF9D37B22E0E</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>F1EBD8FA-23F2-4A50-A884-F0E57CB1C3DB</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>64291FDB-2177-4482-94E7-BE65925F51CE</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>9DBC7FB3-C38F-42D6-B188-A2577018F6D4</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250225142004</timestamp>
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
                                            <id>F9FC7631-AB66-463C-8EBC-DF9D37B22E0E</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>F1EBD8FA-23F2-4A50-A884-F0E57CB1C3DB</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>64291FDB-2177-4482-94E7-BE65925F51CE</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>9DBC7FB3-C38F-42D6-B188-A2577018F6D4</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250225142040</timestamp>
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
                                            <id>F9FC7631-AB66-463C-8EBC-DF9D37B22E0E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>F1EBD8FA-23F2-4A50-A884-F0E57CB1C3DB</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>64291FDB-2177-4482-94E7-BE65925F51CE</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>9DBC7FB3-C38F-42D6-B188-A2577018F6D4</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>5</SCN>
                                    <timestamp>20250225142408</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0001</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>641555508105</agentRoleProfileCodeId>
                                    <message>Subsequent cancellation</message>
                                    <orgASID>None</orgASID>
                                    <agentPersonOrgCode>VNE51</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>F9FC7631-AB66-463C-8EBC-DF9D37B22E0E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>F1EBD8FA-23F2-4A50-A884-F0E57CB1C3DB</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>64291FDB-2177-4482-94E7-BE65925F51CE</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>9DBC7FB3-C38F-42D6-B188-A2577018F6D4</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>6</SCN>
                                    <timestamp>20250225142408</timestamp>
                                    <fromStatus>0002</fromStatus>
                                    <toStatus>0001</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>641555508105</agentRoleProfileCodeId>
                                    <message>Dispense proposal return successful</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>VNE51</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>F9FC7631-AB66-463C-8EBC-DF9D37B22E0E</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>F1EBD8FA-23F2-4A50-A884-F0E57CB1C3DB</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>64291FDB-2177-4482-94E7-BE65925F51CE</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>9DBC7FB3-C38F-42D6-B188-A2577018F6D4</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>                                <!--Dispense Specific Information-->
                                <dispensingOrganization/>
                                <lastDispenseDate>False</lastDispenseDate>
                                <lastDispenseNotificationMsgRef>20250225142408104156_BC240F_1614371148</lastDispenseNotificationMsgRef>
                                <lastDispenseNotificationGuid/>
                                <!--Claim Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate>                                <!--Prescription Specific Information-->
                                <currentInstance>1</currentInstance>
                                <signedTime>20250225141950</signedTime>
                                <prescriptionTreatmentType>0001</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250225000000</prescriptionTime>
                                <prescriptionID>4EABC3-A83008-91927K</prescriptionID>
                                <prescriptionMsgRef>20250225141952901918_C7E6DD_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>28</daysSupply>
                                <maxRepeats/>
                                <eventID>CE5B0DA1-030B-4F0B-8DCE-61E633BA039B</eventID>                                <!--Patient Specific Information-->
                                <lowerAgeLimit>19640429</lowerAgeLimit>
                                <higherAgeLimit>20080430</higherAgeLimit>
                                <patientNhsNumber>5839945242</patientNhsNumber>
                                <patientBirthTime>19480430</patientBirthTime>                                <!--Nomination Specific Information-->
                                <nominatedPerformer/>
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
