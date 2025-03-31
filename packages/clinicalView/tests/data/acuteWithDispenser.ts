/* eslint-disable max-len */
export default `<?xml version='1.0' encoding='UTF-8'?>
<SOAP:Envelope xmlns:crs="http://national.carerecords.nhs.uk/schema/crs/"
    xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns="urn:hl7-org:v3"
    xmlns:hl7="urn:hl7-org:v3">
    <SOAP:Header>
        <wsa:MessageID>uuid:564A6742-F68C-11EF-B36D-0608FC2E3D30</wsa:MessageID>
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
        <wsa:RelatesTo>uuid:95eaa0f2-c3e1-49cb-8e69-61545aed0fc9</wsa:RelatesTo>
    </SOAP:Header>
    <SOAP:Body>
        <prescriptionClinicalViewResponse>
            <PORX_IN000006UK98>
                <id root="564A6742-F68C-11EF-B36D-0608FC2E3D30"/>
                <creationTime value="20250301110007"/>
                <versionCode code="V3NPfIT3.0"/>
                <interactionId root="2.16.840.1.113883.2.1.3.2.4.12" extension="PORX_IN000006UK98"/>
                <processingCode code="P"/>
                <processingModeCode code="T"/>
                <acceptAckCode code="NE"/>
                <acknowledgement typeCode="AA">
                    <messageRef>
                        <id root="95eaa0f2-c3e1-49cb-8e69-61545aed0fc9"/>
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
                                <nextActivity_nextActivityDate>['createNoClaim_20250820']</nextActivity_nextActivityDate>
                                <dispenser_status>['FA565_0006']</dispenser_status>
                            </epsIndex>
                            <epsRecord>                                <!-- These are the other fields stored on the JSON for the record-->                                <!--Prescription Instance Specific Information-->
                                <releaseRequestMsgRef>20250221114143027751_483C36_1614371148</releaseRequestMsgRef>
                                <prescriptionStatus>0006</prescriptionStatus>
                                <nominatedDownloadDate/>
                                <downloadDate>20250221114143</downloadDate>
                                <completionDate>20250221</completionDate>
                                <expiryDate/>
                                <dispenseWindow>
                                    <low value="20250221"/>
                                    <high value="20260221"/>
                                </dispenseWindow>
                                <instanceNumber>1</instanceNumber>
                                <lineItem>
                                    <order value="1"/>
                                    <ID value="3FCCF133-4FEC-4044-97E5-7D137A18B867"/>
                                    <previousStatus value="0008"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="2"/>
                                    <ID value="E9FB164E-8E68-45E0-BD08-EAFC04941CF8"/>
                                    <previousStatus value="0008"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="3"/>
                                    <ID value="56C96BCD-46F8-4DC1-8BD7-44BC5B235729"/>
                                    <previousStatus value="0008"/>
                                    <status value="0001"/>
                                </lineItem>
                                <lineItem>
                                    <order value="4"/>
                                    <ID value="22D8ABB6-17ED-4415-9351-FE8408F6F954"/>
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
                                    <messageID>"C68CC61F-8A3D-433F-8AA5-658F091D95C6"</messageID>
                                    <timestamp>"20250221114137"</timestamp>
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
                                    <agentPersonOrgCode>VNFKT</agentPersonOrgCode>
                                    <message>"Release Request successful"</message>
                                    <messageID>"3D9CA2A9-ADC3-44D8-8EBC-776CF9D91961"</messageID>
                                    <timestamp>"20250221114143"</timestamp>
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
                                    <messageID>"20C1355C-BE71-4B6F-8C2F-3D0E6B49D5D1"</messageID>
                                    <timestamp>"20250221114215"</timestamp>
                                    <toASID>"200000001215"</toASID>
                                    <fromASID>"567456789789"</fromASID>
                                </history>
                                <filteredHistory>
                                    <SCN>2</SCN>
                                    <timestamp>20250221114137</timestamp>
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
                                            <id>3FCCF133-4FEC-4044-97E5-7D137A18B867</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>E9FB164E-8E68-45E0-BD08-EAFC04941CF8</id>
                                            <status/>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>56C96BCD-46F8-4DC1-8BD7-44BC5B235729</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>22D8ABB6-17ED-4415-9351-FE8408F6F954</id>
                                            <fromStatus>None</fromStatus>
                                            <toStatus>0007</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>3</SCN>
                                    <timestamp>20250221114143</timestamp>
                                    <fromStatus>0001</fromStatus>
                                    <toStatus>0002</toStatus>
                                    <agentPerson>555086689106</agentPerson>
                                    <agentRoleProfileCodeId>555086415105</agentRoleProfileCodeId>
                                    <message>Release Request successful</message>
                                    <orgASID>200000001215</orgASID>
                                    <agentPersonOrgCode>VNFKT</agentPersonOrgCode>
                                    <lineStatusChangeDict>
                                        <line>
                                            <order>1</order>
                                            <id>3FCCF133-4FEC-4044-97E5-7D137A18B867</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>E9FB164E-8E68-45E0-BD08-EAFC04941CF8</id>
                                            <status/>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>56C96BCD-46F8-4DC1-8BD7-44BC5B235729</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>22D8ABB6-17ED-4415-9351-FE8408F6F954</id>
                                            <fromStatus>0007</fromStatus>
                                            <toStatus>0008</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>
                                <filteredHistory>
                                    <SCN>4</SCN>
                                    <timestamp>20250221114215</timestamp>
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
                                            <id>3FCCF133-4FEC-4044-97E5-7D137A18B867</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>2</order>
                                            <id>E9FB164E-8E68-45E0-BD08-EAFC04941CF8</id>
                                            <status/>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>3</order>
                                            <id>56C96BCD-46F8-4DC1-8BD7-44BC5B235729</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                        <line>
                                            <order>4</order>
                                            <id>22D8ABB6-17ED-4415-9351-FE8408F6F954</id>
                                            <fromStatus>0008</fromStatus>
                                            <toStatus>0001</toStatus>
                                        </line>
                                    </lineStatusChangeDict>
                                </filteredHistory>                                <!--Dispense Specific Information-->
                                <dispensingOrganization>FA565</dispensingOrganization>
                                <lastDispenseDate>20250221</lastDispenseDate>
                                <lastDispenseNotificationMsgRef>20250221114215526018_4EA85E_1614371148</lastDispenseNotificationMsgRef>
                                <lastDispenseNotificationGuid>20C1355C-BE71-4B6F-8C2F-3D0E6B49D5D1</lastDispenseNotificationGuid>                                <!--Claim Specific Information-->
                                <claimReceivedDate>False</claimReceivedDate>                                <!--Prescription Specific Information-->
                                <currentInstance>1</currentInstance>
                                <signedTime>20250221114136</signedTime>
                                <prescriptionTreatmentType>0001</prescriptionTreatmentType>
                                <prescriptionType>0101</prescriptionType>
                                <prescriptionTime>20250221000000</prescriptionTime>
                                <prescriptionID>9D4C80-A83008-5EA4D3</prescriptionID>
                                <prescriptionMsgRef>20250221114137671341_90B7A8_1614371148</prescriptionMsgRef>
                                <prescribingOrganization>A83008</prescribingOrganization>
                                <daysSupply>28</daysSupply>
                                <maxRepeats/>
                                <eventID>C68CC61F-8A3D-433F-8AA5-658F091D95C6</eventID>                                <!--Patient Specific Information-->
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
                                    <dispNotifDocumentKey>20250221114215526018_4EA85E_1614371148</dispNotifDocumentKey>
                                    <dispNotifFromStatus>0002</dispNotifFromStatus>
                                    <dispNotifToStatus>0006</dispNotifToStatus>
                                    <dispenseNotifDateTime>20250221114206</dispenseNotifDateTime>
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
