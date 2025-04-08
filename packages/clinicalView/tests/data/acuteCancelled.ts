/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:DD2F97A2-F3B0-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
        <wsa:RelatesTo>uuid:b2384c8d-cd27-416a-b5d9-8d1102ec8dca</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="DD2F97A2-F3B0-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250225194402"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="b2384c8d-cd27-416a-b5d9-8d1102ec8dca"/>
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
                                <prescribingSite_status>['A83008_0005']</prescribingSite_status>
                                <nominatedPharmacy_status>['FA565_0005']</nominatedPharmacy_status>
                                <nextActivity_nextActivityDate>['delete_20250824']</nextActivity_nextActivityDate>
                                <dispenser_status>['FA565_0005']</dispenser_status>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <prescriptionStatus>0005</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate/>
                                <completionDate>20250225</completionDate>
                                <expiryDate/>
                                <dispenseWindow>
                                    <low value="20250225"/>
                                    <high value="20260225"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="9BB08AA9-44A9-47AA-A619-961830143AF0"/>
                                    <previousStatus value="0007"/>
                                    <status value="0005"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="06B9EC66-5B19-459A-A2AD-31FE8589EB6B"/>
                                    <previousStatus value="0007"/>
                                    <status value="0005"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="0B4A7D0E-777A-45E4-AC2E-4A78FAC5EA2F"/>
                                    <previousStatus value="0007"/>
                                    <status value="0005"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="1F37EF7D-9B5C-45D3-8A4A-7A5CA2682CAF"/>
                                    <previousStatus value="0007"/>
                                    <status value="0005"/>
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
                                    <messageID>"A2B6A4A3-6A82-4CF2-BDC5-CF458FF42F89"</messageID>
                                    <timestamp>"20250225194120"</timestamp>
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
                                    <messageID>"93575D37-8A47-40FF-87A3-5CC11E23F8B4"</messageID>
                                    <timestamp>"20250225194132"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>4</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0001</status>
                                    <instanceStatus>0001</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was cancelled"</message>
                                    <messageID>"92116BA5-3A55-4CD7-A3C1-181FF02C99FD"</messageID>
                                    <timestamp>"20250225194149"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>5</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0001</status>
                                    <instanceStatus>0001</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was cancelled"</message>
                                    <messageID>"213F08E7-61BF-4767-A183-66A6221A6AA0"</messageID>
                                    <timestamp>"20250225194208"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <history>
                                    <SCN>6</SCN>
                                    <instance>1</instance>
                                    <interactionID>PORX_IN050102SM32</interactionID>
                                    <status>0005</status>
                                    <instanceStatus>0005</instanceStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentSystem>200000001215</agentSystem>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <message>"Prescription/item was cancelled"</message>
                                    <messageID>"179B7E51-CDD1-43DD-B17A-79D72DAD7379"</messageID>
                                    <timestamp>"20250225194220"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250225194120</timestamp>
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
                                            <id>9BB08AA9-44A9-47AA-A619-961830143AF0</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>06B9EC66-5B19-459A-A2AD-31FE8589EB6B</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>0B4A7D0E-777A-45E4-AC2E-4A78FAC5EA2F</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>1F37EF7D-9B5C-45D3-8A4A-7A5CA2682CAF</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250225194132</timestamp>
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
                                            <id>9BB08AA9-44A9-47AA-A619-961830143AF0</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>06B9EC66-5B19-459A-A2AD-31FE8589EB6B</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>0B4A7D0E-777A-45E4-AC2E-4A78FAC5EA2F</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>1F37EF7D-9B5C-45D3-8A4A-7A5CA2682CAF</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250225194149</timestamp>
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
                                            <id>9BB08AA9-44A9-47AA-A619-961830143AF0</id>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>06B9EC66-5B19-459A-A2AD-31FE8589EB6B</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>0B4A7D0E-777A-45E4-AC2E-4A78FAC5EA2F</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>1F37EF7D-9B5C-45D3-8A4A-7A5CA2682CAF</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>5</SCN>
                                    <timestamp>20250225194208</timestamp>
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
                                            <id>9BB08AA9-44A9-47AA-A619-961830143AF0</id>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>06B9EC66-5B19-459A-A2AD-31FE8589EB6B</id>
                                            <status/>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>0B4A7D0E-777A-45E4-AC2E-4A78FAC5EA2F</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>1F37EF7D-9B5C-45D3-8A4A-7A5CA2682CAF</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>6</SCN>
                                    <timestamp>20250225194220</timestamp>
                                    <fromStatus>0001</fromStatus>
                                    <toStatus>0005</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>200102238987</agentRoleProfileCodeId>
                                    <message>Prescription/item was cancelled</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>A83008</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>9BB08AA9-44A9-47AA-A619-961830143AF0</id>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Clinical grounds</cancellationReason>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>06B9EC66-5B19-459A-A2AD-31FE8589EB6B</id>
                                            <status/>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>0B4A7D0E-777A-45E4-AC2E-4A78FAC5EA2F</id>
                                            <fromStatus>0005</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>At the Pharmacist's request</cancellationReason>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>1F37EF7D-9B5C-45D3-8A4A-7A5CA2682CAF</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0005</toStatus>
                                            <cancellationReason>Change to medication treatment regime</cancellationReason>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>                                <!--Dispense Specific Information-->
                                <dispensingOrganization/>
                                <lastDispenseDate>False</lastDispenseDate>
                                <lastDispenseNotificationMsgRef/>
                                <lastDispenseNotificationGuid/>
                                <!--Claim Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate>                                <!--Prescription Specific Information-->
                                <currentInstance>1</currentInstance>
                                <signedTime>20250225194119</signedTime>
                                <prescriptionTreatmentType>0001</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250225000000</prescriptionTime>
                                <prescriptionID>D76B46-A83008-D600EO</prescriptionID>
                                <prescriptionMsgRef>20250225194120035109_F236C2_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>28</daysSupply>
                                <maxRepeats/>
                                <eventID>A2B6A4A3-6A82-4CF2-BDC5-CF458FF42F89</eventID>                                <!--Patient Specific Information-->
                                <lowerAgeLimit>False</lowerAgeLimit>
                                <higherAgeLimit>False</higherAgeLimit>
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
