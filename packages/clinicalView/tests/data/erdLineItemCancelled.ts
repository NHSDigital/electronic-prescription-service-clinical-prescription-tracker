/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:557ED038-F37F-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
        <wsa:RelatesTo>uuid:af7354d5-5b02-4fdc-a9db-1a46715e8c5c</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="557ED038-F37F-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250225134929"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="af7354d5-5b02-4fdc-a9db-1a46715e8c5c"/>
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
                                <prescribingSite_status>['A83008_9000', 'A83008_0002']</prescribingSite_status>
                                <nominatedPharmacy_status>['VNE51_9000', 'VNE51_0002']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['expire_20250825']</nextActivity_nextActivityDate>
                                <dispenser_status>['VNE51_9000', 'Y02494_0002']['VNE51_9000', 'Y02494_0002']</dispenser_status>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <releaseRequestMsgRef>20250225134124992489_A953C0_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0002</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250225134124</downloadDate>
                                <completionDate>False</completionDate>
                                <expiryDate>20250825</expiryDate>
                                <dispenseWindow>
                                    <low value="20250225"/>
                                    <high value="20250325"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="66944514-29AE-4855-928E-D5D9F0053D8E"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="D3EFF934-4493-4EC5-8815-CBEAB3A7CC96"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0008"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="C59485A4-7EE6-4B19-9AFC-87A314E3BF02"/>
                                    <previousStatus value="0007"/>
                                    <lineItemMaxRepeats value="7"/>
                                    <status value="0005"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="7505BECC-43B9-48EE-92DD-4B9C7C54B8AF"/>
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
                                    <messageID>"E7F94272-5B2A-47D6-AE9B-FC6C901D4982"</messageID>
                                    <timestamp>"20250225133945"</timestamp>
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
                                    <messageID>"77F5FC66-BF4C-4A1B-8520-9CB8F0682724"</messageID>
                                    <timestamp>"20250225134035"</timestamp>
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
                                    <messageID>"20811DC7-F097-451F-9CDD-397A0F62C914"</messageID>
                                    <timestamp>"20250225134125"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250225133945</timestamp>
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
                                            <id>66944514-29AE-4855-928E-D5D9F0053D8E</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>D3EFF934-4493-4EC5-8815-CBEAB3A7CC96</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C59485A4-7EE6-4B19-9AFC-87A314E3BF02</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>7505BECC-43B9-48EE-92DD-4B9C7C54B8AF</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250225134035</timestamp>
                                    <fromStatus>0001</fromStatus>
                                    <toStatus>0001</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription/item was cancelled</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>66944514-29AE-4855-928E-D5D9F0053D8E</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>D3EFF934-4493-4EC5-8815-CBEAB3A7CC96</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C59485A4-7EE6-4B19-9AFC-87A314E3BF02</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>7505BECC-43B9-48EE-92DD-4B9C7C54B8AF</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250225134125</timestamp>
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
                                            <id>66944514-29AE-4855-928E-D5D9F0053D8E</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>D3EFF934-4493-4EC5-8815-CBEAB3A7CC96</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>C59485A4-7EE6-4B19-9AFC-87A314E3BF02</id>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>7505BECC-43B9-48EE-92DD-4B9C7C54B8AF</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
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
                                <signedTime>20250225133938</signedTime>
                                <prescriptionTreatmentType>0003</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250225000000</prescriptionTime>
                                <prescriptionID>EC5ACF-A83008-733FD3</prescriptionID>
                                <prescriptionMsgRef>20250225133944976960_3A0CAC_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>10</daysSupply>
                                <maxRepeats>7</maxRepeats>
                                <eventID>E7F94272-5B2A-47D6-AE9B-FC6C901D4982</eventID>                                <!--Patient Specific Information-->
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
