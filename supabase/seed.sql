-- Grey Sky Responder Society — Seed Data (DOC-003)
-- Generated from references/FEMA_RTLT_NQS_Database.json
-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.
-- UUIDs are deterministic via uuid_generate_v5 for reproducibility.

-- ── 1. Extension Check ──────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
  END IF;
END
$$;

-- Namespace UUID for all seed data
-- a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11

-- ══════════════════════════════════════════════════════════
-- 2. RTLT Team Types — All FEMA Resource Typing Definitions
-- ══════════════════════════════════════════════════════════

-- Animal Emergency Response (9 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1221'), '1-508-1221', 'Animal and Agriculture Damage Assessment Team', 'Animal Emergency Response', 'Situational Assessment', 'Thisteam:
1.Photographsandrecordsdisastersitedamage
2.Investigateslocationswheredamageexists
3.Analyzesthesignificanceofaffectedanimalandagricultureinfrastructures,cropsandanimals
4.Estimatestheextentofdamages
5.Identifiespotentialcascadingeffectsofanimalandagriculturalissues
6.Recommendsinitialprioritiesforresponseandrecovery', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1222'), '1-508-1222', 'Animal Depopulation Team', 'Animal Emergency Response', 'Environmental Response/Health and Safety', 'Thisteam:
1.CoordinateswithVeterinaryMedicalTeam,CompanionAnimalDecontaminationTeamanddisposalpersonnelasnecessary
2.HascompetencyinoneormoredepopulationmethodsoutlinedintheAmericanVeterinaryMedicalAssociation(AVMA)GuidelinesfortheEuthanasiaof
Animals
3.Worksatexistingfacilities,suchaspoultrybarns,salebarns,hospitalsandshelters,aswellasinthefield
4.Performsitsdutiesforoneormoreofthefollowingpopulations:
a.Companionanimals,includingpets,serviceanimalsandassistanceanimals
b.Livestock,includingfood', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1223'), '1-508-1223', 'Animal Evacuation, Transport, and Re-Entry Team', 'Animal Emergency Response', 'Critical Transportation', 'Thisteam:
1.CoordinateswithAnimalSearchandRescue,ShelteringandVeterinaryMedicalTeams,asnecessary
2.Managesevacuationplanning,activitiesandtransport
3.Identifiesanddocumentsanimals
4.Initiatesandcontinuesanimaltracking
5.Loadsandunloadsanimals
6.Monitorsanimalsthroughouttheevacuation,transportandre-entryprocess
7.Transportsorcoordinatestransportofevacuatedanimalstoandfromimpactedareas
8.Reunifiesorfacilitatesreunificationofanimalswiththeirowners
9.Performstheabovedutiesforoneormoreofthefollowingp', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1224'), '1-508-1224', 'Animal Search and Rescue Team', 'Animal Emergency Response', 'Mass Search and Rescue Operations', 'Thisteam:
1.Coordinatesandcollaborateswithotheranimalemergencyresponseteams,asnecessary
2.Coordinatesandplansanimalsearchandrescueefforts
3.Locates,capturesandcontainsdisplacedanimalswithinthedisasterzone
4.Preparesanimalsfortransport
5.Identifiesanimals,documentsrescuelocationandrecordsotherrelevantdatatofacilitatereunificationwithowners
6.Coordinateslivetrappingandchemicalcaptureasnecessary
7.Triagesrescuedanimalsforappropriatetransportmethodstopreventdiseaseandmitigatemedicalandbehavioralissu', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1226'), '1-508-1226', 'Animal Sheltering Team - Animal-Only Shelter', 'Animal Emergency Response', 'Mass Care Services', 'TheAnimalShelteringTeam–Animal-OnlyShelter:
1.Establishesandmanagesatemporaryshelterforthesafeandhumanehandling,care/husbandryandhousingofoneofthefollowinganimalpopulations:
a.Companionanimals,includingpets,serviceanimalsandassistanceanimals
b.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
2.Meetsanimals''''basicwelfareneeds
3.Ensuresanimalidentification,tracking,reunificationandreporting
4.Coordinateswithincidentcommand;coordinatesallfacetsoftheanimalresponseandintersectingcompo', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1227'), '1-508-1227', 'Animal Sheltering Team - Cohabitated Shelter', 'Animal Emergency Response', 'Mass Care Services', 'TheAnimalShelteringTeam–CohabitatedShelter:
1.Establishesandmanagesatemporaryshelterforthesafeandhumanehandling,care,husbandryandhousingofoneofthefollowinganimalpopulations:
a.Companionanimals,includingpets,serviceanimalsandassistanceanimals
b.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
2.Meetsanimals''''basicwelfareneeds
3.Ensuresanimalidentification,tracking,reunificationandreporting
4.Coordinateswithincidentcommand;coordinatesallfacetsoftheanimalresponseandintersectingcompo', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1228'), '1-508-1228', 'Animal Sheltering Team - Collocated Shelter', 'Animal Emergency Response', 'Mass Care Services', 'TheAnimalShelteringTeam–CollocatedShelter:
1.Establishesandmanagesatemporaryshelterforthesafeandhumanehandling,care,husbandryandhousingofoneofthefollowinganimalpopulations:
a.Companionanimals,includingpets,serviceanimalsandassistanceanimals
b.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
2.Meetsanimals''''basicwelfareneeds
3.Ensuresanimalidentification,tracking,reunificationandreporting
4.Coordinateswithincidentcommand;coordinatesallfacetsoftheanimalresponseandintersectingcompon', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1229'), '1-508-1229', 'Companion Animal Decontamination Team', 'Animal Emergency Response', 'Environmental Response/Health and Safety', 'Thisteammanagesthedecontaminationofcompanionanimalsafterincidentsinvolvinghazardousmaterials,includingdebris,floodwatersandradiological
contamination.Specifically,thisteam:
1.Setsupallequipmentatadesignated“warmzone”site
2.Acceptsanimalsfromtheirownersorcaretakersforrapidtriage(behavioralandhealth),identificationandinitialmonitoring
3.Askownerstoparticipateactivelyindecontaminatingtheiranimals,perincidentpoliciesinsomeradiologicalincidents.Ownerparticipationislesslikelyin
non-radiologicalinciden', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:1-508-1230'), '1-508-1230', 'Veterinary Medical Team', 'Animal Emergency Response', 'Public Health, Healthcare, and Emergency Medical Services', 'Thisteamprovidesmedicalcareforanimalsinoneormoreofthefollowingpopulations:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlife,captivewildlifeorzooanimals
4.Laboratoryanimals', 9)
ON CONFLICT (name) DO NOTHING;

-- Communications (2 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:5-508-1247'), '5-508-1247', 'Land Mobile Radio Support Team', 'Communications', 'Operational Communications', 'TheLandMobileRadioSupportTeam:
1.Supportsincidentcommunicationneedsfromatechnicalandoperationalstandpoint
2.Comprisesmultidisciplinarycomponentsappropriatefortheincidentbasedonresourcerequests', 10),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:5-508-1250'), '5-508-1250', 'Virtual Operations Support Team', 'Communications', 'Operational Communications', 'TheVOST:
1.ActivatesattherequestofanAuthorityHavingJurisdiction(AHJ)
2.Assessesandevaluateswhereandhowacommunityissharinginformationonlineduringcrisis
3.Monitorsavailableandpublicweb-basedcommunicationsonsocialmediaandnewsorganizationwebsitestoidentifycrisisneeds,damageassessmentand
communitysentimentsurroundingemergencyevents
4.AmplifiesordisseminatespublicinformationattherequestoftheAHJ
5.Filtersonlinecontentanddevelops"ListeningReports",whichincludeamissionoverview,trendanalysisandsummaryofmi', 11)
ON CONFLICT (name) DO NOTHING;

-- Cybersecurity (1 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:13-508-1212'), '13-508-1212', 'Cyber Incident Response Team', 'Cybersecurity', 'Cybersecurity', 'TheCyberIncidentResponseTeam:
1.Investigatesandanalyzesallrelevantcyberandnetworkactivitiesrelatedtothecrisissituationwiththepurposeofachievingthespeediestrecoveryofthe
impactedcriticalinfrastructureservice
2.Usesmitigation,preparedness,responseandrecoveryapproaches,asneeded,tomaximizesurvivaloflife,preservationofpropertyandinformation
security
3.DocumentsallstepsandactionstakenduringtheoperationsanddevelopsIncidentActionReports(IAR)', 12)
ON CONFLICT (name) DO NOTHING;

-- Damage Assessment (2 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:21-508-1263'), '21-508-1263', 'Geology Field Reconnaissance Team', 'Damage Assessment', 'Risk Management for Protection Programs and Activities', 'TheGeologyFieldReconnaissanceTeam:
1.Observes,describes,photographs,andquantitativelydocumentsphysicalevidencerelatedtogeologicalconsequencesfor,andincidentimpactson,both
human-builtfeaturesandnaturalenvironments
2.Supportstasksthroughunderground,ground,andaerialobservations
3.Documentsandassessesconsequencesofgroundfailure,groundshaking,soil–structureinteraction,tsunamiinundation,waveheight,andvelocity
characteristicsrelatedtoawiderangeofgeo-hazardsandthreats,suchasearthquakes,tsunamis,volcanoe', 13),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:21-508-1260'), '21-508-1260', 'Rapid Needs Assessment Team', 'Damage Assessment', 'Situational Assessment', 'TheRapidNeedsAssessmentTeam:
1.Collects,analyzesandreportsinformationtodeterminerequirementsforcriticalresourcestosupportemergencyresponseactivities
2.Assessesoverallimpactofanincidentoreventanddeterminesimmediateresponserequirements', 14)
ON CONFLICT (name) DO NOTHING;

-- Emergency Management (5 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:10-508-1200'), '10-508-1200', 'Disaster Cost Recovery Management Team', 'Emergency Management', 'Economic Recovery', 'TheDisasterCostRecoveryManagementTeamassistsinthepost-RNAassessmentandsupportselementsofdisasterrecoveryneedsandmayinterface
withfederal,state,tribal,territorialandlocaloperations', 15),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:10-508-1254'), '10-508-1254', 'Housing Task Force (NQS)', 'Emergency Management', 'Housing', 'TheHousingTaskForce:
1.Establishesdirection,ownershipandfinancialrequirementsandidentifiesleadershipresponsibilitiesforshort-termandlong-termrecoveryhousingmission
2.Providesinteragencycoordinationamonglocal,state,tribal,territorialandfederalrecoveryhousingprograms
3.Overseesshort-termandlong-termrecoveryhousingefforts
4.Identifiesrelevantlocal,state,tribal,territorialandfederalinteragency,private-sectorandnonprofitpartners
5.SupportstheAuthorityHavingJurisdiction(AHJ)indevelopingthescopeandfore', 16),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:10-508-1214'), '10-508-1214', 'Human Services Disaster Assessment Team', 'Emergency Management', 'Economic Recovery', 'TheHumanServicesDisasterAssessmentTeamassistsintheassessmentofdisaster-causedhumanservicesneeds,including:
1.Housingassistance
2.Disasterunemploymentassistance
3.Crisiscounselingservices
4.Disasterlegalservices
5.Casemanagementassistance
6.Foodassistance
7.Needfordisasterrecoverycenter
8.Staffingneedsforhumanservicesassistance
9.NeedforHumanServicesRecoverySupportTeam', 17),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:10-508-1213'), '10-508-1213', 'Human Services Recovery Support Team', 'Emergency Management', 'Economic Recovery', 'TheHumanServicesRecoverySupportTeamprovidesassistancetofederal,state,tribal,territorialandlocalemergencymanagementagenciespertainingto
claimsforhumanservicesassistance,suchas:
1.Housingassistance
2.Disasterunemploymentassistance
3.Masscareservices
4.Otherneedsassistance
5.Crisiscounseling
6.Disasterlegalservices
7.Casemanagementservices
8.Foodassistance', 18),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:10-508-1261'), '10-508-1261', 'Post-Disaster Building Safety Evaluation Team', 'Emergency Management', 'Infrastructure Systems', 'TheEvaluationTeam:
1.ConductsRapidEvaluationsorDetailedEvaluationsofbuildingsinincidentareas,inaccordancewithAppliedTechnologyCouncil(ATC)ATC-20-1and
ATC-45guidance
2.Performsalimitedinitialenvironmentalhazardscanaspartofabuildingsafetyevaluationandalertsappropriatesupervisors,emergencyresponders,and
specialists,inaccordancewithFEMAP-2055:Post-DisasterBuildingSafetyEvaluationGuidance
3.Performsalimitedinitialnonstructuralhazardevaluation,inaccordancewithATC-20-1andATC-45guidance
4.Postsbuildings', 19)
ON CONFLICT (name) DO NOTHING;

-- Emergency Medical Services (12 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1194'), '3-508-1194', 'Air Ambulance Fixed-Wing (Critical Care Transport)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAirAmbulanceFixed-Wing(CriticalCareTransport)providestransportation,evacuationandemergencymedicalcareforpatientsviafixed-wingaircraft
fromonemedicalfacilitytoanother', 20),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1026'), '3-508-1026', 'Air Ambulance Fixed-Wing (Non-Critical Care Transport)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAirAmbulanceFixed-Wing(Non-CriticalCareTransport):
1.Providestransportation,evacuationandemergencymedicalcareforpatientsviafixed-wingaircraftfromscene,establishedpick-upsiteormedicalfacilityto
medicalfacilities
2.Mayalsotransportmedicalpersonnel,equipment,suppliesandbloodandfluidproductsintotheareaofneed
3.Mayalsotransportcriticalcarepatientsfromdisastersitestomedicalfacilities,whennecessary,astheAeromedicalTransportManagerdetermines', 21),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1195'), '3-508-1195', 'Air Ambulance Rotary-Wing (Critical Care Transport)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAirAmbulanceRotary-Wing(CriticalCareTransport)providescriticalcare,evacuationandtransportationservicesviarotary-wingaircraftfromscenes,
establishedpick-upsitesormedicalfacilitiestomedicalfacilities', 22),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1027'), '3-508-1027', 'Air Ambulance Rotary-Wing (Non-Critical Care)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAirAmbulanceRotary-Wing(Non-CriticalCareTransport):
1.Providesemergencymedicalcare,evacuationandtransportationservicesviarotary-wingaircraftfromscene,establishedpick-upsiteormedicalfacilityto
medicalfacilities
2.Mayimportpersonnel,equipmentandsupplies(includingbloodproducts)intotheareaofneed', 23),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1292'), '3-508-1292', 'Ambulance Ground Team - Advanced Life Support (ALS)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAmbulanceGroundTeam–ALS:
1. Providesout-of-hospitalemergencymedicalcare,evacuationandtransportationservicesattheParamediclevelasspecifiedbytheAuthorityHaving
Jurisdiction(AHJ)
2. Isdeployableasasingleresource,oraspartofataskforceorstriketeam', 24),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1293'), '3-508-1293', 'Ambulance Ground Team - Basic Life Support (BLS)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAmbulanceGroundTeam–BLS:
1. Providesout-of-hospitalemergencymedicalcare,evacuationandtransportationservicesattheEMTlevel
2. Isdeployableassingleresource,oraspartofataskforceorstriketeam', 25),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1294'), '3-508-1294', 'Ambulance Strike Team - Advanced Life Support (ALS)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAmbulanceStrikeTeam–ALScomprisesEMSpersonnelthatprovideout-of-hospitalemergencymedicalcare,evacuationandtransportationservicesat
theALSlevel', 26),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1295'), '3-508-1295', 'Ambulance Strike Team - Basic Life Support (BLS)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheAmbulanceStrikeTeam–BLScomprisesEMSpersonnelthatprovideout-of-hospitalemergencymedicalcare,evacuationandtransportationservicesat
theBLSlevel', 27),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1030'), '3-508-1030', 'Ambulance Task Force', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'Anycombinationof5ambulancesofdifferenttypes(ALSandBLS)withcommoncommunicationsandaleader,inaseparatecommandvehicle.Thisresource
typingisusedtodistinguishbetweenaTaskForceofAmbulancesandanEmergencyMedicalTaskForce(anycombinationofresources).', 28),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1031'), '3-508-1031', 'Emergency Care Task Force', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheEmergencyCareTaskForce:
1.Providesthenecessarylevelofcareforpatientsbaseduponmission,resourcesanddeploymentsetting
2.Coordinatestaskforceassignment,care,activitiesandpatientdispositionwithfacilityorexistingIncidentCommandSystem(ICS)structure', 29),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1236'), '3-508-1236', 'Emergency Medical Services Task Force', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'TheEMSTaskForce:
1.Providesarangeofemergencymedicalservices,suchasassessment,treatmentandtransport,ofawiderangeofpatients,includingcomplexandcritical
patients,usingarangeofvehicles,staff,equipmentandsupplies
2.DeliversEMSwithinavarietyoffunctionalcapacities,suchas:
a.Servicinggatheringsoflargepopulations,includingthoseinaustereorremoteenvironments
b.AugmentingjurisdictionalprehospitalEMSresources
c.Supportinginterfacilitytreatmentandtransport', 30),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:3-508-1296'), '3-508-1296', 'Medical Ambulance Bus (MAB)', 'Emergency Medical Services', 'Public Health, Healthcare, and Emergency Medical Services', 'Capableofprovidingmedicaltransportationservicesduringmasscasualtyincidents', 31)
ON CONFLICT (name) DO NOTHING;

-- Emergency Operations Center (EOC) (1 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:23-508-1289'), '23-508-1289', 'Emergency Operations Center Management Support Team', 'Emergency Operations Center (EOC)', 'Operational Communications', 'TheEOCMSTsupportstheAHJto:
1.SetfunctionalobjectivestomeetICandMultiagencyCoordination(MAC)Grouppriorities
2.IntegratestakeholdersintoEOCoperations
3.Workwithseniorofficialstofacilitatethedevelopmentofpolicydirectionforincidentsupport
4.Ensuretimely,accurate,andaccessibleinformationdisseminationtointernalandexternalstakeholders
5.EstablishanoperationaltempoinsupportoftheIC
6.Facilitateroutineandongoingcoordinationwithbothpublicandprivatesectorentities
7.Providearangeofcurrentandfutureplanningser', 32)
ON CONFLICT (name) DO NOTHING;

-- Fire/Hazardous Materials (18 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1273'), '4-508-1273', 'Aerial Apparatus – Fire', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheAerialApparatus–Fireprovideselevatedstreamcapabilityand/oraworkingplatformfromwhichtoperformrescueorotherfirefightingrelatedtasks', 33),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1274'), '4-508-1274', 'Area Command Team – Firefighting', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheAreaCommandTeam–Firefighting:
1.Providesoversighttomultipleincidentsratherthanprovidingdirectactiononanyoneincident
2.Managesmultipleincidentcommanderstoensurethattheoverallobjectivesarebeingmet,tosetprioritiesamongincidents,andtoallocatescarce
resourcesbetweenincidents
3.Coordinatesconflictingobjectives,strategies,priorities,andresourcerequestsbetweenincidents', 34),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1275'), '4-508-1275', 'Crew Transport (Firefighting Crew)', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheCrewTransport(FirefightingCrew)transportsaspecifiednumberofpersonnel', 35),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1276'), '4-508-1276', 'Engine – Fire (Pumper)', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheEngine–Fire(Pumper)isavehicledesignedtobeusedunderemergencyconditionstotransportpersonnelandequipment,tosupportthesuppressionof
fires,orsupportthemitigationofotherhazardoussituations D', 36),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1277'), '4-508-1277', 'Fire Boat', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'AFireBoatsuppressesfiresonwatercraft,inandaroundwaterfrontareas,orduringotheremergencies', 37),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1278'), '4-508-1278', 'Fire Engine Strike Team – Structural', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheFireEngineStrikeTeam–Structuralprovidesfiremanagementandsuppressionsupportinstructuralfirefightingsituationsandotheremergency
operations', 38),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1279'), '4-508-1279', 'Foam Tender – Firefighting', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheFoamTender–Firefighting:
1.Suppliesfoamforfiresthatareresistanttotraditionalwater-basedoperations
2.Helpssuppressflammableliquidfires,suchasgasolineorjetfuel', 39),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1280'), '4-508-1280', 'Fuel Tender', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheFuelTendertransportsspecifiedquantitiesoffuel', 40),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1281'), '4-508-1281', 'Hand Crew', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheHandCrew:
1.Constructsfirelineswithhandtoolsandchainsaws
2.Burnsoutareasusingdriptorchesandotherfiringdevices
3.Mops-upandrehabilitatesofburnedareas
4.Performsotherdutiesasappropriatesuchasroadclearing', 41),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1248'), '4-508-1248', 'Hazardous Materials Response Team', 'Fire/Hazardous Materials', 'Environmental Response/Health and Safety', 'TheHazardousMaterialsResponseTeam:
1.Detectsthepresenceof,andidentifiesassociatedchemicalandphysicalpropertiesof,HAZMATandWMDsubstances
2.Identifiesandestablishescontrolzones
3.Containsandmitigatessolid,liquid,gas,andvaporleaksthroughinterventionssuchasneutralization,plugging,andpatching
4.Usesstandardprotocolstocollectandlabelsubstancesandevidenceinpreparationfortransportation
5.Interpretsreadingsfromradiationdetectiondevicesandconductsgeographicalsurveystosearchforsuspectedcontaminationorradio', 42),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1282'), '4-508-1282', 'Helicopter – Firefighting and Rescue', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheHelicopter–FirefightingandRescueisusedforprecisionwaterdropping,aerialincendiary,hoisting,foamretardantdispersion,personnelinsertionand/or
extraction,andequipmenttransport', 43),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1283'), '4-508-1283', 'Incident Management Team – Firefighting', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheIMT–Firefighting:
1.Deploystomanagefireincidentsoreventsthatrequireahighercapabilityorcapacitylevelthantherequestingjurisdictionororganizationcanprovide
2.Assumesmanagementoftheincidentfortherequestingjurisdictionoragency,orsupportsalocalIncidentCommander(IC)orUnifiedCommandandits
IMTinmanaginganincidentorevent
3.DirectsandtrackstacticalresourcesthattheAuthorityHavingJurisdiction(AHJ)andothersupportingorganizationsprovide
4.PerformsCommand,Operations,Planning,Logistics,Finance/Administration,', 44),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1284'), '4-508-1284', 'Interagency Buying Team – Firefighting', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheInteragencyBuyingTeam–Firefighting:
1.Supportsincidentacquisitionthroughcoordinationwiththeincidentagencyadministrativestafforlocaladministrativestaff
2.Establishesproceduresforfillinganddocumentingresourceordersforservices,supplies,andequipmentfromtheopenmarketandestablishedsources
3.Ensuresgoodsandservicesarepurchasedinaccordancewithincidentagencypolicy
4.Implementstheadministrativeunit’sandgeographicarea’sacquisitionpolicies,operatingguidelines,andserviceandsupplyplan', 45),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1128'), '4-508-1128', 'Mobile Communications Unit (Law/Fire)', 'Fire/Hazardous Materials', 'Operational Communications', 'RESOURCECATEGORY Fire/HazardousMaterials', 46),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1285'), '4-508-1285', 'Portable Pump', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'ThePortablePumpisusedforfiresuppression,rescue,de-watering,orotherspecializedfunctions', 47),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1286'), '4-508-1286', 'Quint Fire Apparatus', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheQuintFireApparatusprovideselevatedstreamcapabilityandaworkingplatformfromwhichtoperformrescueorotherfirefightingrelatedtasks', 48),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1287'), '4-508-1287', 'Support Water Tender – Firefighting (Tanker)', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheSupportWaterTender–Firefighting(Tanker)transportsspecifiedquantitiesofwaterprimarilytosupportfirefightingoperations', 49),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:4-508-1288'), '4-508-1288', 'Tactical Water Tender – Firefighting (Tanker)', 'Fire/Hazardous Materials', 'Fire Management and Suppression', 'TheTacticalWaterTender–Firefighting(Tanker)transportsspecifiedquantitiesofwaterprimarilytotacticalfirefightingoperations', 50)
ON CONFLICT (name) DO NOTHING;

-- Geographic Info Systems and Info Technology (2 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:14-508-1210'), '14-508-1210', 'Geographic Information Systems (GIS) Field Data Collection Team', 'Geographic Info Systems and Info Technology', 'Planning', 'TheGISFieldDataCollectionTeam:
1.Activelycollectsdatafromthefieldwithhardwareandsoftware,orpassivelycollectsdatawithotherGlobalPositioningSystem(GPS)capablemobiledata
collectiondevices
2.CollectsandintegratesrelevantGISfielddataisintomapsandsituationalawarenesstoolsforincidentmanagementpersonnelanddecisionmakerstouse', 51),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:14-508-1211'), '14-508-1211', 'Geographic Information Systems (GIS) Map Support Team', 'Geographic Info Systems and Info Technology', 'Planning', 'TheGISMapSupportTeam:
1.Supportsthedevelopmentofmapsettingsandmapapplicationsforthefield
2.SupportsGIShardwareandsoftwareusedinthefield,atthecommandpostandinEmergencyOperationsCenters(EOC)
3.Editsconnectedanddisconnecteddata
4.Ensuresdecisionmakershaveaccesstoandcanuselocation-basedinformationforenhancedsituationalawarenessanddecisionmaking', 52)
ON CONFLICT (name) DO NOTHING;

-- Hazard Mitigation (2 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:15-508-1175'), '15-508-1175', 'Hazard Mitigation Operations Team', 'Hazard Mitigation', 'Operational Coordination', 'TheHazardMitigationOperationsTeamprovidescomprehensivemitigationtechnicalassistancetolocal,state,tribal,territorial,and/orfederalorganizations.
Teammembersarespecialistsinmyriadareascriticaltohazardmitigationplanningandimplementation', 53),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:15-508-1174'), '15-508-1174', 'Hazard Mitigation Planning Team', 'Hazard Mitigation', 'Operational Coordination', 'TheHazardMitigationPlanningTeamprovidescomprehensivemitigationplanningassistancetoanotherHazardMitigationPlanningTeamstaffedwith
comparablepositionstobuildlocalhazardmitigationplanningcapabilityandestablishaHazardMitigationprocessthroughplandevelopmentandadoption', 54)
ON CONFLICT (name) DO NOTHING;

-- Incident Management (7 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1038'), '2-508-1038', 'Airborne Communications Relay (Fixed-Wing) (CAP)', 'Incident Management', 'Operational Communications', 'RESOURCECATEGORY IncidentManagement', 55),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1037'), '2-508-1037', 'Airborne Communications Relay Team (Fixed-Wing)', 'Incident Management', 'Operational Communications', 'RESOURCECATEGORY IncidentManagement', 56),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1041'), '2-508-1041', 'Critical Incident Stress Management (CISM) Team', 'Incident Management', 'Public Health, Healthcare, and Emergency Medical Services', 'TheCISMTeam:
1.Assessesandprioritizesthebehavioralhealthneedsoffirstresponderstoanevent
2.Providespeer-led,mentalhealth-informedinterventionstomitigatecommonstressresponsesandfacilitatereturntowork.Interventionsinclude:
a.Individualpsychologicalfirstaidorcrisisintervention
b.EducationregardingnormalstressresponsesandcopingstrategiesforpsychologicalresiliencethroughinformationalgroupssuchasRestInformationand
TransitionServicesforfirstrespondersandCrisisManagementBriefingsforthosewithsupportivefun', 57),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1048'), '2-508-1048', 'Evacuation Coordination Team', 'Incident Management', 'Critical Transportation', 'TheEvacuationCoordinationTeam:
1.Supportsevacuationandre-entryoperationsastechnicalspecialistsinanEOC
2.Providesstrategicguidancetodecisionmakersonevacuationorshelter-in-placeoperations
3.Conductsanalysisofevacuationzonesandroutes,anddeterminesrouteviability
4.Providesrecommendationsonpublicevacuationordersandothermessagingrelatedtoprotectiveactions
5.Providesguidancefortransportationcoordination,trafficcontrolandindividualswithCTN
6.Coordinateswithsupportingteams,includinganimalevacuationteams,', 58),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1050'), '2-508-1050', 'Incident Management Team', 'Incident Management', 'Operational Coordination', 'TheIMT:
1.Deploystomanageemergencyresponses,incidentsorplannedeventsrequiringahighercapabilityorcapacitylevelthantherequestingjurisdictionor
organizationcanprovide
2.Assistswithincidentmanagementactivitiesduringall-hazardsevents,includingnaturalandhuman-causedevents,aswellasplannedevents
3.Assumesmanagementoftheincidentfortherequestingjurisdictionoragency,orsupportsalocalIncidentCommander(IC)orUnifiedCommandandits
IMTinmanaginganincidentorevent
4.DirectsandtrackstacticalresourcesthattheAuthority', 59),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1053'), '2-508-1053', 'Mobile Communications Center (Also referred to as "Mobile EOC")', 'Incident Management', 'Operational Communications', 'RESOURCECATEGORY IncidentManagement', 60),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:2-508-1246'), '2-508-1246', 'Small Unmanned Aircraft System (sUAS) Team', 'Incident Management', 'Situational Assessment', 'ThesUASTeam:
1.Providessituationalawarenessbytransmittingreal-timeornearreal-timeimagery,data,orverbalassessment,usingmultipletechnologies,suchas
photogrammetry,livevideo,thermalimaging,andlidar,toenhancetheCommonOperatingPicture(COP),planningfunctions,andIncidentActionPlan(IAP)
development
2.UsesvariousplatformsbasedonmissionneedinaccordancewithFederalAviationAdministration(FAA)CodeofFederalRegulations(CFR)Part107,
specifyingsUAS
2.0-OCTOBER2023 SMALLUNMANNEDAIRCRAFTSYSTEM(SUAS)TEAM 1OF4

Resou', 61)
ON CONFLICT (name) DO NOTHING;

-- Law Enforcement Operations (9 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1176'), '6-508-1176', 'Bomb Response Team', 'Law Enforcement Operations', 'Interdiction and Disruption', 'Thisteam:
1.Investigates,renderssafeanddisposesofsuspectedhazardousdevices,explosives,explosivematerials(astheBureauofAlcohol,Tobacco,Firearms,and
Explosivescurrentlydefines),pyrotechnicsandammunition
2.Coordinatesinvestigationswithotherlocal,stateandfederalpartners
3.Conductsbombcrimesceneinvestigations
4.Collectsandpreservesevidence
5.Providestechnicalsupporttospecialoperations,dignitaryprotectionandspecialevents', 62),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1290'), '6-508-1290', 'Canine Detection Team - Explosives', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', '1. Conductsscreeningandsearchestodetectthepresenceofexplosivesandexplosives-relatedsubstances
2. Assistsinconductingbombcrimesceneinvestigations;and
3. Providesavisualdeterrenceathigh-riskcriticalinfrastructurelocationsandspecialevents', 63),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1231'), '6-508-1231', 'Crisis Negotiation Team', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'TheCrisisNegotiationTeam:
1.De-escalatespotentiallylife-threateningsituationsusingverbalcrisismanagementtechniques
2.Respondstoincidentsinvolvingsuicidal,armed/barricaded,emotionallydisturbedandhostage-holdingindividuals
3.Saveslivesandmitigatescrisisincidentswhileattemptingtoavoidunnecessaryrisktoofficers,citizens,victimsandsubjects', 64),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1002'), '6-508-1002', 'Law Enforcement Aviation - Helicopters - Patrol & Surveillance', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'RESOURCECATEGORY LawEnforcementOperations', 65),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1003'), '6-508-1003', 'Law Enforcement Observation Aircraft (Fixed-Wing)', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'RESOURCECATEGORY LawEnforcementOperations', 66),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1240'), '6-508-1240', 'Mobile Field Force', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'TheMFFisapre-designatedteamthat:
1.Providescrowdmanagementandcrowdcontrol,including:
a.Saturationpatrols
b.Areasearch
c.Perimetercontrol
d.Staffingfortrafficcontrolpoints
e.Securityatcriticalfacilities
f.Demonstratorandprotestorescort
g.Protectivefront-lineformations
2.Maintainsorderandpreservesthepeace
3.Arrestslawviolators
4.Promotestrafficsafetyandenforcesvehicleandtrafficlaws
5.Providessupportfor:
a.All-hazardsrisksandevents
b.Naturaldisasters
c.Fires
d.Terroristincidents
e.Crimesceneprotect', 67),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1034'), '6-508-1034', 'Patrol Team', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'ThePatrolTeam:
1.Prevents,detectsanddeterscriminalactivity
2.Renderslawenforcementassistance
3.Respondstocallsforservice
4.Promotestrafficsafety
5.Promotespeaceandcivilorder
6.Arrestsviolators
7.Transportsprisoners', 68),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1005'), '6-508-1005', 'Public Safety Dive Team', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'ThePublicSafetyDiveTeam:
1.Searchesfor,locates,identifiesandretrievesobjects,includingremainsandevidence,fromunderthesurfaceofthewater
2.Helpslocateandrecoverdrowningvictims,abandonedvehiclesand(ifproperlytrained)evidenceincriminalcases
3.Providessafetydiversforspecialevents
4.AssiststheWaterborneSearchandRescueTeam', 69),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:6-508-1245'), '6-508-1245', 'Special Weapons and Tactics Team', 'Law Enforcement Operations', 'On-scene Security, Protection and Law Enforcement', 'TheSWATTeamrespondsto:
1.High-riskwarrantserviceandapprehensions
2.Activeshooteroractivethreatsituations
3.Barricadedsituations
4.Hostagerescueoperations
5.Terrorismthreats
6.Veryimportantperson(VIP)protectionneeds
7.Specialeventperimetercontrolneeds(high-risksecurityoperations)
8.Sniperandcounter-sniperoperations', 70)
ON CONFLICT (name) DO NOTHING;

-- Logistics and Transportation (3 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:11-508-1251'), '11-508-1251', 'Distribution Support Team', 'Logistics and Transportation', 'Logistics and Supply Chain Management', 'TheDistributionSupportTeam:
1.SupportstheAHJ''''sLogisticsSectionwithplanningexpertiseinidentifying,locating,ordering,procuringanddistributingmaterialresourcesforincident
responders
2.ProvidesplanningsupportandpreparesPointsofDistribution(POD)plansfortraditionalPODs,directdeliveryandmobiledelivery
a.Directdeliveryincludescoordinatingwithaspecificlocation,suchasashelter,feedingsiteorhospital,todeliverspecificitemsandquantities
3.Helpscompleteneedsanalysis
4.Evaluatesthecurrentmethodsofdistributionwh', 71),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:11-508-1252'), '11-508-1252', 'Logistics Staging Unit', 'Logistics and Transportation', 'Logistics and Supply Chain Management', 'TheLogisticsStagingUnit:
1.Supplementsequipmentandsupplyinventoriesforcounties,municipalitiesandresponseagenciesexperiencingshortagesastheyrespondtoandrecover
fromanemergencyevent
2.CoordinateswiththeestablishedLogisticsSectiontodetermineequipmentandsupplyneedsandresponsibilities
3.Warehousescommodities,equipmentandsuppliesnecessarytosupportemergencyrespondersandthecommunityinfrastructure
4.Operatesinalocationthatcanaccommodatevariousresponseteams,includingsearchandrescue,fire,lawenforcement,med', 72),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:11-508-1253'), '11-508-1253', 'Logistics Support Team', 'Logistics and Transportation', 'Logistics and Supply Chain Management', 'TheLogisticsSupportTeam:
1.Helpsaffectedjurisdictionsmanagetheirlogisticsfunctionsandprocesses,includingacquiringanddistributingmaterialresources
2.Helpsthejurisdictiontrackandaccountforresourcesdeployedthroughouttheoperationalarea
3.Helpsthejurisdictionoverseedailyinventories,identifyresourcegapsandrecommendappropriatetypesandquantitiesofresourcestofillthegaps
4.SupportsandcoordinateswithPointsofDistribution(POD),CommodityPlanningUnits,LogisticsStagingAreas(LSA),andBaseCampTeams
5.Collaboratesw', 73)
ON CONFLICT (name) DO NOTHING;

-- Mass Care Services (16 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1185'), '9-508-1185', 'Distribution of Emergency Supplies (DES) Task Force', 'Mass Care Services', 'Mass Care Services', 'TheDESTaskForce:
1.Helpsidentifygapsincategories,quantitiesandlocationsofemergencysuppliesinthecommunity
2.Determinesstrategicdistributionmethodstofillthosegaps
3.IdentifiesthetypeandquantityofMobileDistribution,Drive-ThroughPointofDistribution(POD)andPedestrianPODteamsnecessary
4.Ensuresthatteamsdeploytoassignedlocations
5.LiaiseswiththeLogisticsSection,theDonationsCoordinationTaskForceandcommercialretailerstoensurecoordinatedemergencysupplydistribution
6.Coordinateswithpublicinformationandexte', 74),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1190'), '9-508-1190', 'Donated Goods Warehouse Management Team', 'Mass Care Services', 'Mass Care Services', 'TheDonatedGoodsWarehouseManagementTeamperformsthefollowingwarehouseoperationtasks,asnecessary:
1.Officemanagement
2.Floormanagement
3.Shippingmanagement
4.Receivingmanagement
5.Sortingmanagement
6.Inventorymanagement
7.Informationtechnologycoordination
8.Voluntaryagencyliaison
9.Volunteercoordination
10.Safetyandsecurity', 75),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1191'), '9-508-1191', 'Donations Coordination Task Force', 'Mass Care Services', 'Mass Care Services', 'TheDonationsCoordinationTaskForce:
1. Coordinatesthemanagementandtheflowofdonatedfunds,goodsandservices—solicitedandunsolicited—duringanoperation’sresponseand
recoveryphases
2. Advisesandcoordinatesthecollection,distributionandwarehousingofdonatedgoods
3. CoordinateswiththeLogisticsSection,theDESTaskForceandtheDonatedGoodsWarehouseManagementTeamtosupportdistributionand
donationsoperations
4. Matchesdonatedgoodswithrecipientsanddistributionsites
5. CoordinateswithNGOstaffandVolunteerReceptionCent', 76),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1187'), '9-508-1187', 'Drive-Through Point of Distribution Team', 'Mass Care Services', 'Mass Care Services', 'ADrive-ThroughPODTeam:
1.Establishesdrive-throughdistributionoperationsatasite,asspecifiedbytheAuthorityHavingJurisdiction(AHJ)
2.WorkscloselywiththeDistributionofEmergencySupplies(DES)TaskForcetoregulatetheflowofsuppliesandtonotifythepublicoflocationsandhours
ofoperation
3.Distributessuppliesinanorderly,efficientandsafemannerviadefinedvehiclelanesandloadingpoints
4.Maintainsaccuraterecordsofitemsdistributed
5.Restockssuppliesatthesite', 77),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1192'), '9-508-1192', 'Evacuation Shelter', 'Mass Care Services', 'Mass Care Services', 'AnEvacuationShelter:
1.Providesfortheimmediateneedsofdisastersurvivors,typicallyforlessthan72hours
2.Providesbasiclife-sustainingservicesuntilthethreathaspassed,oruntilshelterresidentstransferortransitiontoaShort-TermShelter,including:
a.Dormitory
b.Basicfooditemsorsnacks
c.Hydration
d.Basicmedicalcare
e.Sanitation
f.Disaster-relatedinformation', 78),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1000'), '9-508-1000', 'Field Kitchen Unit', 'Mass Care Services', 'Mass Care Services', 'TheFieldKitchenUnit:
1.ProvidesacentralizedfoodproductionsitethatpreparesandservesfoodtosurvivorsandrespondersORthatprovidesmealsforFoodServiceDelivery
Unitstodeliver
2.Preparesfoodservicebasedonadefinedstandardmeal', 79),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1272'), '9-508-1272', 'Food Service Delivery Unit', 'Mass Care Services', 'Mass Care Services', 'TheFoodServiceDeliveryUnit:
1. Deliverspreparedfooddirectlytosurvivorsandresponders
2. DeliversmealstoafacilityoroutdoorfeedingsiteORservesmealsdirectlyfromthevehicle', 80),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1193'), '9-508-1193', 'Long-Term Shelter', 'Mass Care Services', 'Mass Care Services', 'Long-TermShelters:
1.Providesforthelong-termneedsofdisastersurvivors,typicallyformorethantwoweeks
2.Transitionsfromportable,temporaryservicestomoredurable,fixedorpermanentservices,suchasutilityproviders,showers,toiletsandsinks
3.Providessustainedbasicservices,including:
a.Dormitory
b.Feeding
c.Hydration
d.Basicmedicalcare
e.Sanitation
4.ProvidesarangeofessentialresidentservicesgreaterthanthosetypicallyassociatedwithEvacuationorShort-TermShelters,including:
a.Ongoingsupportforpeoplewithdisabiliti', 81),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1199'), '9-508-1199', 'Mass Evacuee Support Task Force', 'Mass Care Services', 'Mass Care Services', 'TheMassEvacueeSupportTaskForce:
1.Supportstheregistrationofdisastersurvivorsatamassevacueesupportsite,usingthesystemsandprocessesspecifiedbytheAuthorityHaving
Jurisdiction(AHJ)
2.Supportsthetrainingofassignedregistrationortrackingpersonnelatamassevacueesupportsite
3.Coordinateswithothersupportteams,taskforcesandsingleresourcesamassevacueesupportsiteinthefollowingkeyareas:
a.Foodandhydrationdelivery
b.Health,behavioralhealthandpersonalassistanceservices
c.Disastersurvivorswithdisabilitiesoraccess', 82),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1198'), '9-508-1198', 'Mass Evacuee Support Team', 'Mass Care Services', 'Mass Care Services', 'TheMassEvacueeSupportTeam:
1.Determinesthestrategicmethodforprovidingmassevacueesupport
2.Compiles,analyzesanddisseminatesmassevacuee-relatedinformationusedtofacilitatetherapid,efficientandsafeevacuationofthreatenedpopulations,
includingunaccompaniedminors,peoplewithdisabilitiesandthosewithaccessandfunctionalneeds,householdpetsandserviceandassistanceanimals
3.Coordinateswithotheragencies,groupsorentitiesthatsupporttheevacuationeffort,toincludenon-governmentalorganizationsandtheprivatesector
4.As', 83),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1188'), '9-508-1188', 'Mobile Distribution Team', 'Mass Care Services', 'Mass Care Services', 'TheMobileDistributionTeam:
1.Loadsdeliveryvehiclesanddistributesemergencysuppliesanddonatedgoodstodisastersurvivors
2.Usesassigneddistributionroutesandestablisheddrop-offlocations,suchasahigh-risebuilding,residenceorparkinglot
3.Tracksandrecordsthedistributionofemergencysuppliesanddonatedgoods
4.CoordinatesoperationswiththeDistributionofEmergencySupplies(DES)TaskForceandtheDonationsCoordinationTaskForce
5.AdherestoallsafetyguidelinesspecifiedbytheAuthorityHavingJurisdiction(AHJ)', 84),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1271'), '9-508-1271', 'Mobile Kitchen Unit', 'Mass Care Services', 'Mass Care Services', 'TheMobileKitchenUnit:
1. Providesmobilefoodproductionanddistributiondirectlytosurvivorsandresponders.
2. Providesservicesbasedonapredeterminedstandardmeal.', 85),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1189'), '9-508-1189', 'Pedestrian Point of Distribution Team', 'Mass Care Services', 'Mass Care Services', 'APedestrianPODTeam:
1.Establishespedestriandistributionoperationsatasite,asspecifiedbytheAuthorityHavingJurisdiction(AHJ)
2.WorkscloselywiththeDistributionofEmergencySupplies(DES)TaskForcetoregulatetheflowofsuppliesandtonotifythepublicoflocationsandhours
ofoperation
3.Distributessuppliesinanorderly,efficientandsafemanner
4.Maintainsaccuraterecordsofitemsdistributed
5.Restockssuppliesatthesite', 86),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1196'), '9-508-1196', 'Shelter Facility Selection Team', 'Mass Care Services', 'Mass Care Services', 'TheShelterFacilitySelectionTeam:
1.Providestechnicalexpertisetoassessthesuitabilityofpotentialshort-termorlong-termsheltersites,focusingoncivilengineering,environmentalhealth,
accessandfunctionalneedsandotherlifesafetyconsiderations
2.Assessesfixedfacilities,suchasschools,dormitories,recreationorcommunitycenters,largevacantstores,conventioncenters,sportsarenas,warehouses
andothersimilarpermanentconstructionfacilities
3.Assesseslocationsfortheuseofsoft-sidedfacilitiesforsheltering,suchastentsorsi', 87),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1155'), '9-508-1155', 'Shelter Management Team', 'Mass Care Services', 'Mass Care Services', 'TheShelterManagementTeamservesasacoremanagementteamforshelteroperations,includingresidentandfacilitysupportservices', 88),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:9-508-1197'), '9-508-1197', 'Short-Term Shelter', 'Mass Care Services', 'Mass Care Services', 'AShort-TermShelter:
1.Providesfortheshort-termneedsofdisastersurvivors,typicallyforuptotwoweeks
2.Providesasafeandaccessiblelocationforlife-sustainingsupport,suchas:
a.Dormitory
b.Feeding
c.Hydration
d.Basicmedicalcare
e.Sanitation
3.Providesarangeofessentialresidentservices,dependingontheneedsofdisastersurvivorsandtheresourcesavailabletotheAuthorityHaving
Jurisdiction(AHJ),including:
a.Supportforpeoplewithaccessandfunctionalneeds
b.Healthandmentalbehavioralhealthservices
c.Familyreunificationas', 89)
ON CONFLICT (name) DO NOTHING;

-- Medical and Public Health (19 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1186'), '12-508-1186', 'Behavioral Health Community Services Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'Thisteamprovidesincident-relatedbehavioralhealthservicestosurvivorsandfamilies,respondersandthepublicafteradisaster,whichmayinclude:
1.Behavioralhealthneedsassessment
2.PFA
3.Crisisintervention
4.ChaplaincyorlistChaplaincy/SpiritualCare
5.Communityoutreach
6.Publicinformation,informationdisseminationandreferral
7.Behavioralhealthconsultation
8.Screeningandreferral,includingreferralforongoinghealthneedsorthoseoutsideofthescopeofincident-relatedservice', 90),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1135'), '12-508-1135', 'Environmental Health Team', 'Medical and Public Health', 'Environmental Response/Health and Safety', 'TheEnvironmentalHealthTeam:
1.Activatesforenvironmentalhealthandsafetyprotection,responseandrecoveryoperations
2.Assessespost-disasterenvironmentalhazardsandthreatstohumanhealthandsafety
3.Monitorspost-disasterenvironmentalhealthandsafetyconditionsinwater,food,waste,soil,debris,air,shelters,buildingenvironmentsandother
environmentalhealth-relatedareas
4.Assessespost-incidentdiseasehazardsandthreatsinvectorandpestpopulations,suchasmosquitoesandrodents,andrecommendsandimplements
correctiveactionso', 91),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1133'), '12-508-1133', 'Epidemiological Response Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheEpidemiologicalResponseTeam:
1.SupportspublichealthauthoritiesintheAuthorityHavingJurisdiction(AHJ)inincidentepidemiologicaltasks
2.Performsepidemiologicaltasks,including:
a.Designingandconductingdatacollectionrelatedtothetargetdiseaseorinjuryagent
b.Conductingdataanalysis
c.Developingandpresentingqualitativeandquantitativedatadescribingtheaffectedandat-riskpopulations,themethodsofagentspreadortransmissionand
otherinsightsthatinformdecision-making,policyandactionstocontroltheincidentimpact
3.', 92),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1217'), '12-508-1217', 'Fatality Management Disaster Portable Morgue Unit', 'Medical and Public Health', 'Fatality Management Services', 'TheFMDPMUestablishescontactwiththeMassFatalityManagementGroupSupervisordesigneeandtheME/Ctodeterminewheretosetupthetemporary
morgueand:
1.Setsupandmanagestheoperationofatemporarymorgue(cacheofprepackagedequipmentandsupplies)withnecessaryworkstationsforprocessing
within24hoursofactivation
2.Providesinventorymanagement
3.CollaboratesandcoordinateswiththeFatalityManagementAssessmentTeam,HumanRemainsRecoveryTeam,VictimInformationCenterTeam,Morgue
IdentificationCenterTeam,FamilyAssistanceCenterandsta', 93),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1218'), '12-508-1218', 'Fatality Management Human Remains Recovery Team', 'Medical and Public Health', 'Fatality Management Services', 'TheFMHumanRemainsRecoveryTeam:
1.Locateshumanremains
2.Documentshumanremains
3.TransportshumanremainstomorguefacilityortheDisasterPortableMorgueUnit(DPMU)
4.WorkswithUrbanSearchandRescueanddebrisremovalteamstoremoveremains', 94),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1219'), '12-508-1219', 'Fatality Management Morgue Forensic Team', 'Medical and Public Health', 'Fatality Management Services', 'TheFMMorgueForensicTeamprocesseshumanremainsthroughthefollowingstationsstaffedbyappropriatespecialists:
1.Pathologist
a.AutopsyTechnician
b.RadiologyTechnicianSpecialist
2.Anthropologist
3.Odontologist
a.MorgueDentalAssistant
4.FingerprintSpecialist
5.DNACollectionSpecialist', 95),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1220'), '12-508-1220', 'Fatality Management Morgue Processing Unit', 'Medical and Public Health', 'Fatality Management Services', 'TheFMMPU:
1.Retrievesordelivershumanremainstoothermorguestations(includingbutnotlimitedtoanthropology,radiology,odontology,pathologyandfingerprint
stations),withappropriatespecialistsasstaff
2.Managespersonaleffects
3.Tracksdecedentsthroughthevictimidentificationsoftwaresystem
4.Ensuressecurity,accountabilityanddocumentedchainofcustodyforallremainsandpersonaleffects
5.Adherestohumanremains-relatedreligiousandculturalcustomstotheextentthelaworcircumstancespermit', 96),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1249'), '12-508-1249', 'Fatality Management Victim Information Center Team', 'Medical and Public Health', 'Fatality Management Services', 'TheFMVICTeam:
1.EstablishesandoperatesaVIC
2.CollectsandmanagesmissingpersonsinformationwithintheVIC
3.Coordinatesorsupportscallcenteroperationsforreportsfromthepublicaboutstatusofmissingpersons
4.SecuresandmaintainsallrecordsaboutdisasterfatalitiesinaccordancewiththeAuthorityHavingJurisdiction''''s(AHJ)policiesandprocedures
5.Collectsandmanagesantemortemmedicalanddentalrecordsandbiometricrecords,suchasfingerprints
6.OperatedunderthedirectionoflawenforcementandMedicalExaminer/Coroner(ME/C)', 97),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1238'), '12-508-1238', 'Healthcare Resource Coordination and Support Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheHealthcareResourceCoordinationandSupportTeaminteractswithotherteams,groupsandstructures,suchastheLogisticsSection,healthcare
coalitionresourcecoordinationentities,nongovernmentalorganizations(NGO),vendorsandothers,tosupportthefollowingfunctionsforamedicalteam:
1.Administrative
2.Communications
3.HealthIT
4.Equipmentandsuppliesprocurement
5.Medicalequipmentmaintenanceandrepairsupportservices
6.Clerical,includingmedicalrecords
7.Security', 98),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1134'), '12-508-1134', 'Isolation and Quarantine Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheIsolationandQuarantineTeamisatechnicallytrainedteamabletosupportisolationandquarantineactivities:
1.InitiateisolationandquarantinemeasuresoncerequestedbytheAuthorityHavingJurisdiction(AHJ)
2.ManageoperationsinanisolationandquarantinefacilityinaccordancewithestablishedAHJproceduresandsystems
3.ProvidetravelrestrictionrecommendationstotheAHJ,asneeded
4.Supportvoluntaryandormandatoryisolationandquarantinemeasures,asrequestedbytheAHJ', 99),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1241'), '12-508-1241', 'Laboratory Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheLaboratoryTeam:
1.Providesbasicdiagnosticservicestohelphealthcareprovidersmedicallymanageacuteandchronicconditions
2.Reportstoclinicalcarepersonnelfindingsortrendsthatmayimpactthecareprovided
3.Providesresultstoorderinghealthcareproviders,maintainsrecords,andconveysindicatedlabresultstopublichealthauthoritieshavingjurisdiction
4.Maintainsandoperatesthenecessarylabequipment,includingperformingqualitycontrolmeasuresconsistentwithclinicallaboratoryguidelines
5.Managestheappropriatestorageanddisp', 100),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1239'), '12-508-1239', 'Medical Countermeasure (MCM) Point of Dispensing (POD) Management Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheMCMPODManagementTeam:
1.Managesset-up,operations,anddemobilizationofoneortwoMCMmassprophylaxisPODsitespershiftwithinadefinedarea
2.Providestraining,includingjust-in-timetraining,tolocallyprovidedstaffinPODcommandandcontrol,PODlogisticsandPODoperations
3.CoordinateswithAuthorityHavingJurisdiction(AHJ)emergencymanagementandpublichealthofficialstoimplementtheirMCMPODmobilizationplan', 101),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1142'), '12-508-1142', 'Palliative Care Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'ThePalliativeCareTeamprovidesarangeofservicesinavarietyofsettings,notedabove.Thisteam:
1.Providesend-of-lifemedicalservices,comfort,specialtypainmanagementandsupport,includinghydrationandnutrition
2.Providesspecialtypainmanagement,othersymptomcontrol,andpsychological/behavioralhealthguidanceforpatients
3.Providesguidance,training,andpsychologicalsupporttocaregivers,tohelpthemadapttothecurrentsituation
4.Supportsfamilymembersandotherlovedones,includingthroughend-of-lifeandbereavementcounseling
5.', 102),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1242'), '12-508-1242', 'Pharmacy Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'ThePharmacyTeam:
1.Distributesanddispensespharmaceuticalsprescribedtoindividuals,includingrefillingprescriptionsformaintenancemedications
2.Advisespatients,physiciansandotherhealthpractitionersontheselection,dosages,interactionsandsideeffectsofmedications
3.Counselspatientsontheuseofprescriptionandover-the-countermedications
4.Consultswithandadvisesclinicalprovidersaboutmedicationtherapy
5.Assurestheaccuracyofeveryprescriptionfilledandaccommodatesaccessandfunctionalneeds(AFN)orlanguageneeds,asap', 103),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1144'), '12-508-1144', 'Public Health and Medical Systems Assessment Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'ThePublicHealthandMedicalSystemsAssessmentTeam:
1.Collects,analyzes,andreportsinformationtodeterminerequirementsforcriticalresourcesneededtosupportemergencyresponseactivitieswithin24-72
hours
2.Evaluateslifesafety,patientevacuationandrepatriation(re-entry),medicalcontinuityplanning,surgecapacity,medicalinfrastructure,medicalspecial
needs,andlogisticalrequirements
3.Assesses,analyzes,andreportsonoverallstatusofthecommunity-widehealthandmedicalsystemsinfrastructure,staff,andsystems
4.Coordinateswi', 104),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1143'), '12-508-1143', 'Public Health and Medical Team in a Shelter', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', '1.Managebasicmedicalandbehavioralhealthservicesforupto500personsinashelter
2.Providebasicpublicandenvironmentalhealthsurveillanceforshelter', 105),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1243'), '12-508-1243', 'Radiological Services Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheRadiologicalServicesTeam:
1.Performsdiagnosticimagingproceduresincompliancewithstandardmedicalprotocols
2.Appliesprinciplesofradiationprotectionandprovidespatientcareessentialtoradiographicprocedures
3.Evaluatesradiographsandothermedicalimagingfortechnicalquality
4.Developsamedicalinterpretationforeachimagingstudy
5.Ensuresthatthereadingsaretransmittedtoappropriatemedicalproviders', 106),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1137'), '12-508-1137', 'Receiving, Staging, and Storage Task Force', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'TheRSSTaskForce:
1.AugmentsexistingAuthorityHavingJurisdiction''''s(AHJ)warehousestaff
2.Inspects,receivesandstoresincomingpharmaceuticalsandotherassetsanddistributesthemtoPointsofDispensing(POD)andotherpre-planned
distributionpoints,suchashealthcarefacilities,universities,militaryinstallations,privatebusinessesornon-governmentalorganizations
3.CommunicateswiththeAHJ,orderingentityandendreceiver,asappropriate
4.Duringdemobilization,executesaplantorecoverunusedmedicalresourcesaswarehousingactivities', 107),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:12-508-1141'), '12-508-1141', 'Specialty Services Team', 'Medical and Public Health', 'Public Health, Healthcare, and Emergency Medical Services', 'Definedinpatientgeneralandspecialtyservicesinanexistinghospitalfacility', 108)
ON CONFLICT (name) DO NOTHING;

-- Prevention (6 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:0-508-1179'), '0-508-1179', 'Human-Portable Radiation Detector', 'Prevention', 'Screening, Search, and Detection', 'TheHuman-PortableRadiationDetectordetectsthepresenceofradiologicalandnuclearmaterialinawideareaaroundtheoperator;duetothelarger
detectorelementandpowersource,thedetectionrangeofthisdevicemaybegreaterthanaPersonalRadiationDetector(PRD)orRadio-Isotope
IdentificationDevice(RIID)', 109),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:0-508-1177'), '0-508-1177', 'Maritime Preventive Radiological Nuclear Detection Team', 'Prevention', 'Screening, Search, and Detection', 'Theteam:
1.UsesPreventiveRadiologicalNuclearDetection(PRND)toolsandtrainingtodetectnuclearandradiologicalmaterialoutofregulatorycontrolinthe
maritimeenvironment
2.SupportsPrimaryScreening,SecondaryInspectionandWideAreaSearch
3.IsnotcapableofhandlinginterdictionandotherlawenforcementPRNDmissionsunlesstheteamhasassigned,swornlawenforcementpersonnel', 110),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:0-508-1180'), '0-508-1180', 'Personal Radiation Detector', 'Prevention', 'Screening, Search, and Detection', 'Thisequipmentdetectsthepresenceofradiationinalimitedareainthevicinityoftheequipmentoperator', 111),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:0-508-1178'), '0-508-1178', 'Preventive Radiological Nuclear Detection Team', 'Prevention', 'Screening, Search, and Detection', 'ThePreventiveRadiologicalNuclearDetectionTeam:
1.UsesPreventiveRadiologicalNuclearDetection(PRND)toolsandtrainingtodetectnuclearandradiologicalmaterialoutofregulatorycontrol
2.SupportsPrimaryScreening,SecondaryInspection,WideAreaSearch,AdvancedWideAreaSearchandAdvancedSecondaryInspection
3.Isnotcapableofhandlinginterdictionandotherlawenforcementmissionsunlessswornlawenforcementpersonnelareassigned', 112),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:0-508-1181'), '0-508-1181', 'Radio-Isotope Identification Device', 'Prevention', 'Screening, Search, and Detection', 'Thisequipmentidentifiesradioisotopesofradiologicalandnuclearmaterial;operatorsmayalsouseitforinitialdetectionofradiologicalandnuclearmaterial', 113),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:0-508-1182'), '0-508-1182', 'Vehicle-Mounted Radiological Nuclear Detection System', 'Prevention', 'Screening, Search, and Detection', 'Thisequipment:
1.Detectsthepresenceofradiologicalandnuclearmaterial
2.Identifiesradioisotopesinawideareaaroundthevehicularplatform
3.Usersmaypermanentlymountthesysteminavehicularplatform,suchasatruck,boatoraircraft,andrepositionitbetweenplatforms
4.Duetothelargerdetectorelementandpowersource,thedevice’sdetectionrangemaybegreaterthanaPersonalRadiationDetector(PRD),Radio-Isotope
IdentificationDevice(RIID)orHumanPortableRadiationDetector', 114)
ON CONFLICT (name) DO NOTHING;

-- Public Works (17 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1232'), '7-508-1232', 'Damage Assessment Team – Public Works', 'Public Works', 'Infrastructure Systems', 'TheDamageAssessmentTeam–PublicWorks:
1.Recordsanddocumentsobservationswithdigitalphotographyandvideorecording
2.Estimatesdisasterdamageintermsofmagnitudeandmonetaryvalue
3.ReceivesinitialdamagereportsfromtheRapidNeedsAssessmentTeam
4.Providesageneraldamageassessmentandcoordinateswithspecializedteams,suchastheRepairTeam–SewerMainsortheRepairTeam–WaterPump
Facilities,todevelopin-depthassessmentandrepairestimates
5.Coordinateswithincidentcommand,EmergencyOperationsCenter(EOC)andotherdamageassessmen', 115),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1233'), '7-508-1233', 'Debris Assessment Team', 'Public Works', 'Infrastructure Systems', 'TheDebrisAssessmentTeam:
1.Assessestheamountandtypesofdebrisresultingfromanincident
2.Calculatestheestimatedamountofdebristobehauledanddisposedof
3.ImplementsrelevantsectionsoftheAuthorityHavingJurisdiction(AHJ)debrismanagementplan', 116),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1234'), '7-508-1234', 'Debris Monitoring Team', 'Public Works', 'Infrastructure Systems', 'TheDebrisMonitoringTeam:
1.Monitorsdebrisremovaloperationsinthefieldandatdebrissites
2.Measuresandcertifiestruckcapacities
3.Ensuresthatequipmentoperatorsandhaulerssegregatedebris
4.Ensuresthatequipmentoperatorsandhaulersdonotmixhazardouswastewithotherwastetypes
5.Ensuresthatequipmentoperatorsandhaulerspickuponlyeligibledebrisandtrackdebrisappropriately
6.Supportsrecordedobservationswithdigitalphotographyandvideorecording
7.Reportsanyirregularitiestoappropriatepersonnel
8.Ensurescompliancewithco', 117),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1255'), '7-508-1255', 'Locating Team – Water Sector Infrastructure', 'Public Works', 'Infrastructure Systems', 'TheLocatingTeam–WaterSectorInfrastructurelocatesanddocumentsthelocationsofwaterandwastewaterinfrastructureassets', 118),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1202'), '7-508-1202', 'Operations Team – Wastewater Treatment Facility', 'Public Works', 'Infrastructure Systems', 'TheOperationsTeam–WastewaterTreatmentFacilityoperateswastewaterfacilitiesofvarioussizesandwithvariousconveyancefacilities,treatmentplants
andpumpstations', 119),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1256'), '7-508-1256', 'Operations Team – Water Treatment Facility', 'Public Works', 'Infrastructure Systems', 'TheOperationsTeam–WaterTreatmentFacilityoperateswaterproductionfacilitieswithvarioussettlingsystems,includingwells,intakestructures,rawwater
conveyancefacilities,treatmentplants,andpumpstations.Thisteamdoesnotoperateintakestructuresthatrequireboats.Thisteamoperatesproduction
facilitiesappropriatetosize,suchasmillionsofgallonsperday(MGD).', 120),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1257'), '7-508-1257', 'Plant Utility Control Systems Team – Water Sector Infrastructure', 'Public Works', 'Infrastructure Systems', 'ThePlantUtilityControlSystemsTeam–WaterSectorInfrastructurerestoresandrepairsradiocommunications,SCADA,telemetry,plantcontrolsystemsand
programmablelogiccontrollers(PLC)', 121),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1244'), '7-508-1244', 'Public Works Support Team', 'Public Works', 'Infrastructure Systems', 'ThePublicWorksSupportTeam:
1.Supportslocalpublicworksdepartmentsduringincidentresponseoperationsandmovesintorecoveryactivitiesasnecessary
2.Providesbackupreliefforlocalpublicworksdepartmentstaffduringextendedoperations
3.Supportsnormalpublicworksoperationsinadditiontoemergencyresponseneeds
4.ReviewsdamageassessmentsandcostestimatesforrepairandreplacementrecordedbytheDamageAssessmentTeam–PublicWorksandother
sources,astheAuthorityHavingJurisdiction(AHJ)determines
5.Ismultidisciplinaryandmayprovide', 122),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1258'), '7-508-1258', 'Repair and Start-Up Team – Wastewater Treatment Facility', 'Public Works', 'Infrastructure Systems', 'TheRepairandStart-UpTeam–WastewaterTreatmentFacilityrepairswastewatertreatmentfacilitiesofalltypesandsizes,andwithvarioustreatment
systems,conveyancefacilities,treatmentplantsandpumpstations.Thisteamdoesnotmakestructuralrepairsandotherrepairsofsimilarscale', 123),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1154'), '7-508-1154', 'Repair and Start-Up Team – Water Treatment Facility', 'Public Works', 'Infrastructure Systems', 'TheRepairandStart-UpTeam–WaterTreatmentFacilityrepairswaterproductionfacilitiesofalltypesandsizes,andwithvarioussettlingsystems,including
intakefacilities,rawwaterconveyancefacilities,andtreatmentplants.Thisteamdoesnotrepairpumpstations.', 124),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1059'), '7-508-1059', 'Repair and Start-Up Team Lift and Pump Stations – Wastewater Facility', 'Public Works', 'Infrastructure Systems', 'TheRepairandStart-UpTeamLiftandPumpStations–WastewaterFacilityisresponsibleforassessingandrepairingwastewaterliftstationsandpump
facilitiesofalltypesandsizes,includingconveyancefacilities,treatmentplantsandpumpstations.Thisteamdoesnotmakestructuralrepairsandother
repairsofsimilarscale', 125),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1145'), '7-508-1145', 'Repair and Start-Up Team Water Pump Facilities – Water Production', 'Public Works', 'Infrastructure Systems', 'TheRepairandStart-UpTeamWaterPumpFacilities–WaterProductionassessesandrepairswaterpumpfacilitiesofalltypesandsizes,includingintake
facilities,rawwaterconveyancefacilities,treatmentplantsandpumpstations.Thisteamdoesnotrepairintakefacilitiesthatrequireboats,nordoesitrepair
structuraldamageandotherlarge-scaledamage', 126),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1201'), '7-508-1201', 'Repair Team – Water Distribution System', 'Public Works', 'Infrastructure Systems', 'TheRepairTeam–WaterDistributionSystemrepairsalltypesofmains,valves,hydrantsandstoragefacilitiesinalltypesofwaterdistributionfacilities.The
workencompassesexcavationthroughbackfill.Thisteamdoesnotrepairpumpstations', 127),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1146'), '7-508-1146', 'Repair Team Sewer Mains – Wastewater', 'Public Works', 'Infrastructure Systems', 'TheRepairTeamSewerMains–Wastewaterisresponsibleforassessingandrepairingalltypesofwastewatercollection,stormwatercollectionandreclaimed
waterdistributionassets,includingsomethatoperateunderpressure.Theseassetsincludegravitymains,forcemains,aerialmainsandmanholesbutdonot
includeliftandpumpstations.Theworkencompassesexcavationthroughbackfillandmayrequirebypasspumping', 128),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1208'), '7-508-1208', 'Sewer System Cleaning – Wastewater', 'Public Works', 'Infrastructure Systems', 'SewerSystemCleaning–Wastewaterisequipmentforcleaningwastewatersewersysteminfrastructure,including:
1.Sewermains
2.Manholes
3.Combinedseweroverflows(CSO)
4.Sanitaryseweroverflows(SSO)', 129),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1207'), '7-508-1207', 'Sewer System Closed Circuit Television Team – Wastewater', 'Public Works', 'Infrastructure Systems', 'TheSewerSystemCCTVTeam–WastewaterprovidesCCTVservicestohelpsewermaininspectorsidentifyrepairandrehabilitationneeds', 130),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:7-508-1205'), '7-508-1205', 'System Flushing and Flow Testing Team – Water Distribution', 'Public Works', 'Infrastructure Systems', 'TheSystemFlushingandFlowTestingTeam–WaterDistribution:
1.Cleanswaterdistributionpipesbyflushingwaterthroughhydrantsandblow-offs
2.Teststhewatersupplythroughoutthedistributionsystem
3.Conductsbasicwaterqualityfieldtesting', 131)
ON CONFLICT (name) DO NOTHING;

-- Search and Rescue (21 team types)
INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1007'), '8-508-1007', 'Air Search Team (Fixed-Wing)', 'Search and Rescue', 'Mass Search and Rescue Operations', 'RESOURCECATEGORY SearchandRescue', 132),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1008'), '8-508-1008', 'Airborne Reconnaissance (Fixed Wing)', 'Search and Rescue', 'Mass Search and Rescue Operations', 'RESOURCECATEGORY SearchandRescue', 133),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1164'), '8-508-1164', 'Canine Search Team - Disaster/Structural Collapse Human Remains', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheCanineSearchTeam–Disaster/StructuralCollapseHumanRemains:
1.Providessearchservicesfordetectingthescentofhumanremainsinfailedstructuresandindebrisfields
2.Providesmedicalcaretoincludefirstaid
3.Conductsplanningforteam-leveltactics
4.Providesbasicprotectionofpersonnelwithregardto:
a.Safety
b.Emergencyshelter
c.Medicalcare
d.Simpledecontamination
e.Basicgroundsupportcapabilityforhelicopteroperations
f.Minorrepairofpersonalorteamequipment(IncidentLogisticsSupport)
5.Operatesinenvironmentswithandw', 134),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1165'), '8-508-1165', 'Canine Search Team - Disaster/Structural Collapse Live', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheCanineSearchTeam–Disaster/StructuralCollapseLive:
1.Providessearchservicesfordetectinglivehumanscentinfailedstructuresandindebrisfields
2.Providesmedicalcaretoincludefirstaid
3.Conductsplanningforteam-leveltactics
4.Providesbasicprotectionofpersonnelwithregardto:
a.Safety
b.Emergencyshelter
c.Medicalcare
d.Simpledecontamination
e.Basicgroundsupportcapabilityforhelicopteroperations
f.Minorrepairofpersonalorteamequipment(IncidentLogisticsSupport)
5.Operatesinenvironmentswithandwithoutinfrastruc', 135),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1166'), '8-508-1166', 'Canine Search Team – Land Human Remains', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheCanineSearchTeam–LandHumanRemains:
1.Providessearchservicesfordetectinghumanremainsoutsidetheurbancollapsedstructureenvironment,indebrisfieldsandinareasofvariedterrainwith
limitedstructures
2.Providesmedicalcaretoincludefirstaid
3.Conductsplanningforteam-leveltactics
4.Providesbasicprotectionofpersonnelwithregardto:
a.Safety
b.Emergencyshelter
c.Medicalcare
d.Simpledecontamination
e.Basicgroundsupportcapabilityforhelicopteroperations
f.Minorrepairofpersonalorteamequipment(IncidentLogisticsSup', 136),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1167'), '8-508-1167', 'Canine Search Team - Land Live', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheCanineSearchTeam–LandLive:
1.Providessearchservicesfordetectinglivesurvivorsoutsidetheurbancollapsedstructureenvironment,indebrisfieldsandinareasofvariedterrainwith
limitedstructures
2.Providesmedicalcaretoincludefirstaid
3.Conductsplanningforteam-leveltactics
4.Providesbasicprotectionofpersonnelwithregardto:
a.Safety
b.Emergencyshelter
c.Medicalcare
d.Simpledecontamination
e.Basicgroundsupportcapabilityforhelicopteroperations
f.Minorrepairofpersonalorteamequipment(IncidentLogisticsSupport)
5', 137),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1168'), '8-508-1168', 'Canine Search Team - Water Human Remains', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheCanineSearchTeam–WaterHumanRemains:
1.Providessearchservicesfordetectinghumanremainsinandalongbodiesofwateranddebrisfields
2.Providesmedicalcaretoincludefirstaid
3.Conductsplanningforteam-leveltactics
4.Providesbasicprotectionofpersonnelwithregardto:
a.Safety
b.Emergencyshelter
c.Medicalcare
d.Simpledecontamination
e.Basicgroundsupportcapabilityforhelicopteroperations
f.Minorrepairofpersonalorteamequipment(IncidentLogisticsSupport)
5.Operatesinenvironmentswithandwithoutinfrastructure,includin', 138),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1015'), '8-508-1015', 'Cave Search and Rescue (SAR) Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheCaveSARTeam:
1.Conductssearch,rescueandrecoveryinhorizontalandverticalcaveenvironments
2.Providesforprimaryrescueofhumanstothenearestlocationforsecondaryairorlandtransport,careandsheltering
3.Providesfirstaidormoreadvancedmedicalcareconsistentwithleveloftrainingincludingcardiopulmonaryresuscitation(CPR)whenappropriatetopatient
conditionandlimitationsofcaveenvironment
4.OperateswithintheIncidentCommandSystem(ICS)
5.Operatesinenvironmentswithandwithoutinfrastructure,includingthosewithcompromise', 139),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1265'), '8-508-1265', 'Fixed Wing Search Team / Disaster Reconnaissance', 'Search and Rescue', 'Mass Search and Rescue Operations', 'Thisteam:
1. Conductsairreconnaissanceandsearchoperationsusingfixedwingaircraftduringdayornightundervisualmeteorologicalconditions(VMC)
2. Conductsoperationswithtechnologiessuchasvideo,stillimagery,forward-lookinginfrared(FLIR)imagery,hyperspectralimagingandreal-time
videofeedback,usingavailableequipment
3. Conductssearchoperations,including:
a. Aerialsearchofapre-strikeorpost-strikeareainsearchofpersonnelwhoneedtobeextractedorrescued
b. Coordinationwith,anddirectionof,mobilegroundandairsearchan', 140),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1162'), '8-508-1162', 'Helicopter/Rotary Wing Search and Rescue (SAR) Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'Thisteam:
1.ProvidesairSARusingrotarywingaircraftduringdayornightunderVisualMeteorologicalConditions(VMC)
2.CompletesSARpersonnelinsertionorextractionandSARequipmenttransport
3.PerformsairSARthatincludestechnicalrescues,hoistorshort-haultechniques,specializedhelicopteroperationsinallwaterenvironmentssuchas
swiftwaterandevacuation
4.ProvidesmedicalcarethatincludesBasicLifeSupport(BLS)andtransporttoAdvancedLifeSupport(ALS)providers
5.Operatesinenvironmentswithorwithoutinfrastructure,includingthose', 141),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1173'), '8-508-1173', 'Land Search and Rescue (SAR) Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheLandSARTeam:
1.Conductssearch,rescueandrecoveryinlandandwildernessenvironmentsthroughuseofaircraftandgroundvehiclesforsupport,transportationand
evacuationinnon-technicalterrain
a.Land:Arealocatedwithin,orimmediatelynextto,urbanboundaries,nofurtherthan0.5miles(0.8kilometers)fromaroadreadilyaccessiblebyemergency
personnelandwhichmayincludeparks,wildareas,private,stateandmunicipallands
b.Wilderness:Areasbeyondatrailheadoreyesightdistanceofabackcountrytwo-wheeldrive(2WD)road(approximately200feet)', 142),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1169'), '8-508-1169', 'Mine Search and Rescue (SAR) Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheMineSARTeam:
1.Conductssearch,rescueandrecoveryinactiveandinactiveminesenvironments,asdefinedbytheU.S.DepartmentofLabor’sMineSafetyandHealth
Administration(MSHA)
2.Providesforprimaryrescueofhumansandanimalstothenearestlocationforsecondaryairorlandtransport,careandsheltering
3.Providesfirstaidtoincludecardiopulmonaryresuscitation(CPR)andautomatedexternaldefibrillator(AED)
4.OperateswithintheIncidentCommandSystem(ICS)
5.Performsventilationoperations
6.Conductstechnicalroperescueoperations
7.Per', 143),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1171'), '8-508-1171', 'Mountain Search and Rescue (SAR) Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheMountainSARTeam:
1.Conductssearch,rescueandrecoveryinlowmountain,mountainandalpineSARenvironmentsthroughuseofaircraftandgroundvehiclesforsupport,
transportationandevacuation,includingtechnicalandnon-technicalterrain
a.LowMountain:Tractoflandcharacterizedbysteepslopesandmoderatevariationsinelevation,thatrequirestheabilitytonegotiateroutesratedas
YosemiteDecimalSystem(YDS)classes1-4andoccasionallyclass5,wheresteeptoverticalrock,steepforestedorbrush-coveredterrain,talusslopes,
boulderfieldsandpo', 144),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1019'), '8-508-1019', 'Radio Direction Finding Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheRadioDirectionFindingTeamlocatesdistressbeaconsinlandandwildernessenvironments
• Land:Arealocatedwithin,orimmediatelynextto,urbanboundariesnofurtherthan0.5miles(0.8kilometers)fromaroadreadilyaccessibleby
emergencypersonnelandwhichmayincludeparks,wildareas,private,state,andmunicipallands
• Wilderness:Areabeyondatrailheadoreyesightdistanceofabackcountrytwo-wheeldrive(2WD)road(approximately200feet)ORanywherethe
localinfrastructurehasbeencompromisedenoughtoexperiencewilderness-typeconditionssucha', 145),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1264'), '8-508-1264', 'Stillwater/Flood Search and Rescue Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheStillwater/FloodSARTeam:
1.Searchesforandrescuesindividualswhomaybeinjuredorotherwiseinneedofmedicalattention
2.Providesemergencymedicalcare,includingBasicLifeSupport(BLS)
3.Providesanimalrescue
4.Transportshumansandanimalstothenearestlocationforsecondarylandorairtransport
5.Providesshore-basedandboat-basedwaterrescueforhumansandanimals
6.SupportshelicopterrescueoperationsandurbanSARinwaterenvironmentsforhumansandanimals
7.Operatesinenvironmentswithorwithoutinfrastructure,includingenvironment', 146),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1159'), '8-508-1159', 'Structural Collapse Rescue Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheStructuralCollapseRescueTeam:
1.Conductsrescueoperationsforindividualsandanimalsinastructuralcollapseenvironment
2.Conductsrescueandrecoveryoperationsinstructuralcollapsetechnicalrescueenvironments
3.Providesemergencymedicalcare,includingBasicLifeSupport(BLS)
4.Transportshumansandanimalstothenearestsafeareaforsecondarylandorairtransport', 147),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1158'), '8-508-1158', 'Structural Collapse Search Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheStructuralCollapseSearchTeam:
1.Searchesformissingindividualsandanimalsinastructuralcollapseenvironment
2.Performstechnicalsearchesusingvarioustechniquesandtechnologies,includingthermal,opticalandaudio
3.Providesemergencymedicalcare,includingbasiclifesupport(BLS)', 148),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1020'), '8-508-1020', 'Swiftwater/Flood Search and Rescue Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheSwiftwater/FloodSARTeam:
1.Searchesforandrescuesindividualswhomaybeinjuredorotherwiseinneedofmedicalattention
2.Providesemergencymedicalcare,includingBasicLifeSupport(BLS)
3.Providesanimalrescue
4.Transportshumansandanimalstothenearestlocationforsecondarylandorairtransport
5.Providesshore-basedandboat-basedwaterrescueforhumansandanimals
6.SupportshelicopterrescueoperationsandurbanSARinwaterenvironmentsforhumansandanimals
7.Operatesinenvironmentswithorwithoutinfrastructure,includingenvironment', 149),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1266'), '8-508-1266', 'Urban Search and Rescue Incident Support Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'TheUS&RIST:
1.Deploystosupplementthemanagementandapplicationofsearchandrescueresourcesinemergencyresponseoperations,incidents,orplannedevents
requiringlarge-scalesearchandrescueoperations
2.SupportsalocalIncidentCommander(IC),UnifiedCommand,IncidentManagementTeam(IMT),orEmergencyOperationsCenter(EOC)inmanagingan
incidentorevent
3.Plansfor,manages,andtrackstacticalresourcesthattheAuthorityHavingJurisdiction(AHJ)andothersupportingorganizationsprovide
4.PerformsCommand,Operations,Planning,Logistics', 150),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1262'), '8-508-1262', 'Urban Search and Rescue Task Force', 'Search and Rescue', 'Mass Search and Rescue Operations', 'AUS&RTaskForce:
1.Conductssearch,rescue,andrecovery,including:
a.Wide-areasearch
b.Structuralcollapseassessment,search,rescue,andrigginginlightthroughheavyframeconstruction,includingreinforcedconcrete
c.Associatedtechnicalroperescue(includinghighlines)
d.Confinedspacesearchandrescue(permit-required,non-mine,non-cave)
e.Trenchandexcavationrescue
f.Masstransportationvehiclerescue(subway,rail,bus)
g.Supportingthetransportofserviceorcompanionanimalswithpersonsrescued
2.Coordinatesandconductssearchan', 151),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'team_type:8-508-1021'), '8-508-1021', 'US&R Incident Support Team', 'Search and Rescue', 'Mass Search and Rescue Operations', 'I', 152)
ON CONFLICT (name) DO NOTHING;

-- ══════════════════════════════════════════════════════════
-- 3. FEMA RTLT Position Qualifications (328 positions)
-- ══════════════════════════════════════════════════════════

-- Animal Emergency Response (11 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1331:Single Type'), 'Animal Behavior Specialist', NULL, 'Single Type', 'Animal Emergency Response', '1-509-1331', 'Animal Emergency Response', 'TheAnimalBehaviorSpecialistassessesbehavioralstatus,identifiespotentiallydangerousbehaviorsandmakesbehavioralrecommendationsforanimalsin
oneormoreofthefollowingcompetencyareasduringandafterdisasters:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1332:Type 1'), 'Animal Care and Handling Specialist', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1332', 'Animal Emergency Response', 'TheAnimalCareandHandlingSpecialistprovidescareandhandlingofanimalsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1332:Type 2'), 'Animal Care and Handling Specialist', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1332', 'Animal Emergency Response', 'TheAnimalCareandHandlingSpecialistprovidescareandhandlingofanimalsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1333:Single Type'), 'Animal Control/Humane Officer', NULL, 'Single Type', 'Animal Emergency Response', '1-509-1333', 'Animal Emergency Response', 'TheAnimalControl/HumaneOfficermaintainspublicsafetybyenforcinganimal-relatedlawsandprovidingsafeandhumanecaptureandcontainmentof
animalsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1334:Type 1'), 'Animal Decontamination Specialist', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1334', 'Animal Emergency Response', 'TheAnimalDecontaminationSpecialistprovidesarangeofdecontaminationoperationsforanimalsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1334:Type 2'), 'Animal Decontamination Specialist', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1334', 'Animal Emergency Response', 'TheAnimalDecontaminationSpecialistprovidesarangeofdecontaminationoperationsforanimalsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1335:Single Type'), 'Animal Depopulation Specialist', NULL, 'Single Type', 'Animal Emergency Response', '1-509-1335', 'Animal Emergency Response', 'TheAnimalDepopulationSpecialistdepopulatesanimalswhennecessarybecauseofpublichealthandwelfareconcerns,diseaseexposure,threator
infection.TheAnimalDepopulationSpecialisthasknowledgeandexpertiseinoneormorespecialtyareasofdepopulationasoutlinedintheAmerican
VeterinaryMedicalAssociation(AVMA)GuidelinesfortheEuthanasiaofAnimalsandhasknowledge,expertiseandexperienceindepopulatinganimalsinone
ormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Live'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1336:Type 1'), 'Animal Emergency Response Shelter Manager', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1336', 'Animal Emergency Response', 'TheAnimalEmergencyResponseShelterManagerprovidesleadership,supervisionandadministrativesupportfortheoperationanddemobilizationofa
temporaryanimalshelterinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1336:Type 2'), 'Animal Emergency Response Shelter Manager', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1336', 'Animal Emergency Response', 'TheAnimalEmergencyResponseShelterManagerprovidesleadership,supervisionandadministrativesupportfortheoperationanddemobilizationofa
temporaryanimalshelterinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1337:Single Type'), 'Animal Emergency Response Team Leader', NULL, 'Single Type', 'Animal Emergency Response', '1-509-1337', 'Animal Emergency Response', 'TheAnimalEmergencyResponseTeamLeaderleadsandcoordinatesanAnimalEmergencyResponseTeamwithintheincidentcommandstructure,working
inoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1338:Type 1'), 'Animal Intake and Reunification Specialist', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1338', 'Animal Emergency Response', 'TheAnimalIntakeandReunificationSpecialistprovidesanimalintake,identification,trackingandreunification(withownersorowneragents)duringadisaster
response.Thisisanadministrativepositionthatsupportsvariousanimalemergencyresponseteamsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1338:Type 2'), 'Animal Intake and Reunification Specialist', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1338', 'Animal Emergency Response', 'TheAnimalIntakeandReunificationSpecialistprovidesanimalintake,identification,trackingandreunification(withownersorowneragents)duringadisaster
response.Thisisanadministrativepositionthatsupportsvariousanimalemergencyresponseteamsinoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1339:Type 1'), 'Animal Search and Rescue (ASAR) Technician', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1339', 'Animal Emergency Response', 'TheAnimalSearchandRescue(ASAR)Technicianlocates,captures,containsandevacuatesanimalsinoneormoreofthefollowingcompetencyareasafter
adisaster:
1. Companionanimals,includingpets,serviceanimalsandassistanceanimals
2. Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3. Wildlifeanimals,captivewildlifeandzooanimals
4. Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1339:Type 2'), 'Animal Search and Rescue (ASAR) Technician', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1339', 'Animal Emergency Response', 'TheAnimalSearchandRescue(ASAR)Technicianlocates,captures,containsandevacuatesanimalsinoneormoreofthefollowingcompetencyareasafter
adisaster:
1. Companionanimals,includingpets,serviceanimalsandassistanceanimals
2. Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3. Wildlifeanimals,captivewildlifeandzooanimals
4. Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1339:Type 3'), 'Animal Search and Rescue (ASAR) Technician', 'type3', 'Type 3', 'Animal Emergency Response', '1-509-1339', 'Animal Emergency Response', 'TheAnimalSearchandRescue(ASAR)Technicianlocates,captures,containsandevacuatesanimalsinoneormoreofthefollowingcompetencyareasafter
adisaster:
1. Companionanimals,includingpets,serviceanimalsandassistanceanimals
2. Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3. Wildlifeanimals,captivewildlifeandzooanimals
4. Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1116:Type 1'), 'Veterinarian', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1116', 'Animal Emergency Response', 'TheVeterinarianadministersmedicalcaretoillorinjuredanimalsinapost-disasterenvironment.Veterinaryservicesincludetriaginganimals,identifying
diseasesandabnormalconditions,performingclinicalexaminationsandperformingsurgerywhennecessary.Duringanimaldiseaseevents,theVeterinarian
investigatescasesofanimaldisease,diagnosesdiseasesandmaintainsthehealthofanimalpopulationsorherds.TheVeterinariantreatsanimalsinoneor
moreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassist'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1116:Type 2'), 'Veterinarian', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1116', 'Animal Emergency Response', 'TheVeterinarianadministersmedicalcaretoillorinjuredanimalsinapost-disasterenvironment.Veterinaryservicesincludetriaginganimals,identifying
diseasesandabnormalconditions,performingclinicalexaminationsandperformingsurgerywhennecessary.Duringanimaldiseaseevents,theVeterinarian
investigatescasesofanimaldisease,diagnosesdiseasesandmaintainsthehealthofanimalpopulationsorherds.TheVeterinariantreatsanimalsinoneor
moreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassist'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1341:Type 1'), 'Veterinary Assistant', 'type1', 'Type 1', 'Animal Emergency Response', '1-509-1341', 'Animal Emergency Response', 'TheVeterinaryAssistantperformsveterinarysupportdutiesunderthedirectsupervisionofaVeterinarianandadministersmedicalcaretoillorinjuredanimals
inoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:1-509-1341:Type 2'), 'Veterinary Assistant', 'type2', 'Type 2', 'Animal Emergency Response', '1-509-1341', 'Animal Emergency Response', 'TheVeterinaryAssistantperformsveterinarysupportdutiesunderthedirectsupervisionofaVeterinarianandadministersmedicalcaretoillorinjuredanimals
inoneormoreofthefollowingcompetencyareas:
1.Companionanimals,includingpets,serviceanimalsandassistanceanimals
2.Livestock,includingfoodorfiberanimalsanddomesticatedequinespecies
3.Wildlifeanimals,captivewildlifeandzooanimals
4.Laboratoryanimals')
ON CONFLICT DO NOTHING;

-- Communications (5 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1244:Type 1'), 'Communications Technician (NQS)', 'type1', 'Type 1', 'Communications', '5-509-1244', 'Communications', 'TheCommunicationsTechnician(COMT)maintainsandrepairscommunicationsequipment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1244:Type 2'), 'Communications Technician (NQS)', 'type2', 'Type 2', 'Communications', '5-509-1244', 'Communications', 'TheCommunicationsTechnician(COMT)maintainsandrepairscommunicationsequipment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1244:Type 3'), 'Communications Technician (NQS)', 'type3', 'Type 3', 'Communications', '5-509-1244', 'Communications', 'TheCommunicationsTechnician(COMT)maintainsandrepairscommunicationsequipment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1328:Type 1'), 'Communications Unit Leader (NQS)', 'type1', 'Type 1', 'Communications', '5-509-1328', 'Communications', 'TheCommunicationsUnitLeader(COML)designs,orders,manages,andensurestheinstallationandmaintenanceofallcommunicationssystems'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1328:Type 2'), 'Communications Unit Leader (NQS)', 'type2', 'Type 2', 'Communications', '5-509-1328', 'Communications', 'TheCommunicationsUnitLeader(COML)designs,orders,manages,andensurestheinstallationandmaintenanceofallcommunicationssystems'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1328:Type 3'), 'Communications Unit Leader (NQS)', 'type3', 'Type 3', 'Communications', '5-509-1328', 'Communications', 'TheCommunicationsUnitLeader(COML)designs,orders,manages,andensurestheinstallationandmaintenanceofallcommunicationssystems'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1401:Single Type'), 'Virtual Operations Support Team Administrator', NULL, 'Single Type', 'Communications', '5-509-1401', 'Communications', 'TheVirtualOperationsSupportTeam(VOST)AdministratorensuresthataVOSTmeetsalladministrativeguidelinesnecessarytofunctionseamlesslywithin
theincident'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1402:Single Type'), 'Virtual Operations Support Team Leader', NULL, 'Single Type', 'Communications', '5-509-1402', 'Communications', 'TheVirtualOperationsSupportTeam(VOST)LeadersupervisestheVOST'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:5-509-1403:Single Type'), 'Virtual Operations Support Team Member', NULL, 'Single Type', 'Communications', '5-509-1403', 'Communications', 'TheVirtualOperationsSupportTeam(VOST)MembercompletesmissionsfortheVOST')
ON CONFLICT DO NOTHING;

-- Cybersecurity (7 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1251:Single Type'), 'Computer Network Defense Analyst', NULL, 'Single Type', 'Cybersecurity', '13-509-1251', 'Cybersecurity', 'TheComputerNetworkDefense(CND)Analystprotectsinformation,informationsystemsandnetworksfromthreats'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1252:Type 1'), 'Computer Network Defense Infrastructure Support Specialist', 'type1', 'Type 1', 'Cybersecurity', '13-509-1252', 'Cybersecurity', 'TheComputerNetworkDefense(CND)InfrastructureSupportSpecialisttests,implements,deploysandadministersinfrastructurehardwareandsoftwareto
managenetworkdefenses'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1252:Type 2'), 'Computer Network Defense Infrastructure Support Specialist', 'type2', 'Type 2', 'Cybersecurity', '13-509-1252', 'Cybersecurity', 'TheComputerNetworkDefense(CND)InfrastructureSupportSpecialisttests,implements,deploysandadministersinfrastructurehardwareandsoftwareto
managenetworkdefenses'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1250:Type 1'), 'Cyber Incident Responder', 'type1', 'Type 1', 'Cybersecurity', '13-509-1250', 'Cybersecurity', 'TheCyberIncidentRespondermitigates,preparesfor,respondsto,andrecoverssystemsfromcyberthreats'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1250:Type 2'), 'Cyber Incident Responder', 'type2', 'Type 2', 'Cybersecurity', '13-509-1250', 'Cybersecurity', 'TheCyberIncidentRespondermitigates,preparesfor,respondsto,andrecoverssystemsfromcyberthreats'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1254:Single Type'), 'Data Administration Specialist', NULL, 'Single Type', 'Cybersecurity', '13-509-1254', 'Cybersecurity', 'TheDataAdministrationSpecialistmitigatesandrespondstoimmediateandpotentialcyberthreats'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1253:Type 1'), 'Digital Forensics Specialist', 'type1', 'Type 1', 'Cybersecurity', '13-509-1253', 'Cybersecurity', 'TheDigitalForensicSpecialistinvestigatesandrecoversmaterialfoundindigitaldevices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1253:Type 2'), 'Digital Forensics Specialist', 'type2', 'Type 2', 'Cybersecurity', '13-509-1253', 'Cybersecurity', 'TheDigitalForensicSpecialistinvestigatesandrecoversmaterialfoundindigitaldevices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1248:Single Type'), 'Supervisory Control and Data Acquisition Controller Specialist', NULL, 'Single Type', 'Cybersecurity', '13-509-1248', 'Cybersecurity', 'TheSupervisoryControlandDataAcquisition(SCADA)ControllerSpecialistprovidestechnicalsupportrelatedtotheoperation,repairandrestorationof
SCADAcontrollers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:13-509-1249:Single Type'), 'Supervisory Control and Data Acquisition Server Specialist', NULL, 'Single Type', 'Cybersecurity', '13-509-1249', 'Cybersecurity', 'TheSupervisoryControlandDataAcquisition(SCADA)ServerSpecialistisresponsibleforthecontroller-sidehardware,firmwareandsoftware')
ON CONFLICT DO NOTHING;

-- Damage Assessment (2 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:21-509-1452:Single Type'), 'Geological Survey Support Specialist', NULL, 'Single Type', 'Damage Assessment', '21-509-1452', 'Damage Assessment', 'TheGeologicalSurveySupportSpecialistprovidestechnicalgeologicalexpertiseduringemergenciesbyaugmentingandsupportingthestategeological
surveyofficeinanEmergencyOperationsCenter(EOC),anIncidentCommandPost(ICP),stategeologicalsurveyheadquarters/office,atechnical
informationclearinghouse,oracomparableoperationspost'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:21-509-1450:Single Type'), 'Geology Field Reconnaissance Specialist', NULL, 'Single Type', 'Damage Assessment', '21-509-1450', 'Damage Assessment', 'TheGeologyFieldReconnaissanceSpecialistobserves,photographs,andquantitativelydescribesthelocationofphysicalevidencerelatedtogeological
consequencesfor,anddisasterimpactson,bothbuiltandnaturalenvironments')
ON CONFLICT DO NOTHING;

-- Emergency Management (23 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1464:Single Type'), 'Community Emergency Response Team (CERT) Section Chief', NULL, 'Single Type', 'Emergency Management', '10-509-1464', 'Emergency Management', 'TheCommunityEmergencyResponseTeam(CERT)SectionChiefisavolunteerwhoisresponsibleforaspecificfunctionalareawithintheCERT'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1465:Type 1'), 'Community Emergency Response Team (CERT) Team Leader', 'type1', 'Type 1', 'Emergency Management', '10-509-1465', 'Emergency Management', 'TheCommunityEmergencyResponseTeam(CERT)TeamLeaderisavolunteerwhoispartofaCERTanddirectsteamactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1465:Type 2'), 'Community Emergency Response Team (CERT) Team Leader', 'type2', 'Type 2', 'Emergency Management', '10-509-1465', 'Emergency Management', 'TheCommunityEmergencyResponseTeam(CERT)TeamLeaderisavolunteerwhoispartofaCERTanddirectsteamactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1466:Type 1'), 'Community Emergency Response Team (CERT) Team Volunteer', 'type1', 'Type 1', 'Emergency Management', '10-509-1466', 'Emergency Management', 'TheCommunityEmergencyResponseTeam(CERT)VolunteerisavoluntaryCERTteammemberwhohastraininginbasicdisasterresponseskills,suchas
firesafety,lightsearchandrescue,teamorganizationordisastermedicaloperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1466:Type 2'), 'Community Emergency Response Team (CERT) Team Volunteer', 'type2', 'Type 2', 'Emergency Management', '10-509-1466', 'Emergency Management', 'TheCommunityEmergencyResponseTeam(CERT)VolunteerisavoluntaryCERTteammemberwhohastraininginbasicdisasterresponseskills,suchas
firesafety,lightsearchandrescue,teamorganizationordisastermedicaloperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1288:Single Type'), 'Compensation/Claims Unit Leader (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1288', 'Emergency Management', 'TheCompensationandClaimsUnitLeaderoverseesunitstaffresponsibleforfinancialconcernsresultingfrompropertydamage,injuriesorfatalitiesatthe
incident.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1411:Single Type'), 'Damage Assessment Coordinator (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1411', 'Emergency Management', 'TheDamageAssessmentCoordinator(DAC)servesastheprincipalrepresentativeoverseeingdamageassessment,verification,andvalidationactivitiesin
coordinationwiththeFederalcounterpart'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1231:Single Type'), 'Disaster Cost Recovery Management Team Leader', NULL, 'Single Type', 'Emergency Management', '10-509-1231', 'Emergency Management', 'TheDisasterCostRecoveryManagementTeamLeadermanagestheassessment,supportandfinanceelementsofdisastercostrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1232:Single Type'), 'Disaster Recovery Data Collection Specialist', NULL, 'Single Type', 'Emergency Management', '10-509-1232', 'Emergency Management', 'TheDisasterRecoveryDataCollectionSpecialistprotectsdataofabusiness,aswellastheirhardwareandsoftware,bycreatingtechnicaldisasterrecovery
plansandcontinuityplans'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1230:Single Type'), 'Disaster Recovery Finance Specialist', NULL, 'Single Type', 'Emergency Management', '10-509-1230', 'Emergency Management', 'TheDisasterRecoveryFinanceSpecialistcollectsdatarelatedtoforceaccountcosts,includinglabor,equipmentandmaterialcosts,usingreferencessuchas
biddocuments,purchaseorders,contractsandinvoices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1400:Single Type'), 'Environmental and Historic Preservation Environmental Specialist (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1400', 'Emergency Management', 'TheEnvironmentalandHistoricPreservation(EHP)EnvironmentalSpecialistassistsseniorFederalEmergencyManagementAgency(FEMA),local,state,
tribalandterritorialofficialswithenvironmentalpreservationactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1399:Single Type'), 'Environmental and Historic Preservation Historic Preservation Specialist (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1399', 'Emergency Management', 'TheEnvironmentalandHistoricPreservation(EHP)HistoricPreservationSpecialistassistsseniorFederalEmergencyManagementAgency(FEMA),local,
state,tribalandterritorialofficialswithhistoricpreservationactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1414:Single Type'), 'Housing Task Force Field Coordinator (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1414', 'Emergency Management', 'TheHousingTaskForceFieldCoordinatorcoordinatesshort-termhousingeffortsaspartofaHousingTaskForceandassiststheHousingTaskForcewith
innovative,resilientlong-termrecoveryhousingcoordination'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1413:Single Type'), 'Housing Task Force Leader (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1413', 'Emergency Management', 'TheHousingTaskForceLeaderleadsthedevelopmentofstrategiesforshort-termandinnovative,resilientlong-termrecoveryhousingandoverseestheir
implementation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1398:Type 1'), 'Incident/Exercise Evaluator (NQS)', 'type1', 'Type 1', 'Emergency Management', '10-509-1398', 'Emergency Management', 'TheIncident/ExerciseEvaluatorperformsanyorallofthefollowingtasksrelatedtoanincidentorexercise:
1.Observesactivitiesandcollectsdata
2.Synthesizesandanalyzesdata
3.Provideswrittenevaluations
4.Leadassignedpersonnel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1398:Type 2'), 'Incident/Exercise Evaluator (NQS)', 'type2', 'Type 2', 'Emergency Management', '10-509-1398', 'Emergency Management', 'TheIncident/ExerciseEvaluatorperformsanyorallofthefollowingtasksrelatedtoanincidentorexercise:
1.Observesactivitiesandcollectsdata
2.Synthesizesandanalyzesdata
3.Provideswrittenevaluations
4.Leadassignedpersonnel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1398:Type 3'), 'Incident/Exercise Evaluator (NQS)', 'type3', 'Type 3', 'Emergency Management', '10-509-1398', 'Emergency Management', 'TheIncident/ExerciseEvaluatorperformsanyorallofthefollowingtasksrelatedtoanincidentorexercise:
1.Observesactivitiesandcollectsdata
2.Synthesizesandanalyzesdata
3.Provideswrittenevaluations
4.Leadassignedpersonnel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1317:Single Type'), 'Medical Unit Leader (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1317', 'Emergency Management', 'TheMedicalUnitLeadercoordinatesthemedicalneedsoftheincidentdoesnotprovidemedicaltreatment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1447:Single Type'), 'Post-Disaster Building Safety Evaluation Strike Team Leader', NULL, 'Single Type', 'Emergency Management', '10-509-1447', 'Emergency Management', 'ThePost-DisasterBuildingSafetyEvaluationStrikeTeamLeader(BuildingSafetyEvaluationStrikeTeamLeader)providessupervision,leadership,and
administrativeandlogisticalsupportforPost-DisasterBuildingSafetyEvaluationStrikeTeams'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1445:Single Type'), 'Post-Disaster Building Safety Evaluation Strike Team Technical Supervisor', NULL, 'Single Type', 'Emergency Management', '10-509-1445', 'Emergency Management', 'ThePost-DisasterBuildingSafetyEvaluationStrikeTeamTechnicalSupervisor(BuildingSafetyEvaluationStrikeTeamTechnicalSupervisor)provides
enhancedqualityassuranceandconsistentevaluationresultsinthepost-disasterevaluationprocess'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1448:Type 1'), 'Post-Disaster Building Safety Evaluator', 'type1', 'Type 1', 'Emergency Management', '10-509-1448', 'Emergency Management', 'ThePost-DisasterBuildingSafetyEvaluator(BuildingSafetyEvaluator)conductsRapidEvaluationsorDetailedEvaluationsofbuildingsinincidentareas,in
accordancewithAppliedTechnologyCouncil(ATC)ATC-20-1andATC-45guidance:
1.RapidEvaluation:Providesaninitialgeneralevaluationofdamageandsafetyandquicklyidentifyandpostunsafeandapparentlysafestructures,andto
identifybuildingsrequiringDetailedEvaluationornecessaryrestrictionsonbuildinguse
2.DetailedEvaluation:Providesacarefulvisualexaminationofthebuildinganditsstr'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1448:Type 2'), 'Post-Disaster Building Safety Evaluator', 'type2', 'Type 2', 'Emergency Management', '10-509-1448', 'Emergency Management', 'ThePost-DisasterBuildingSafetyEvaluator(BuildingSafetyEvaluator)conductsRapidEvaluationsorDetailedEvaluationsofbuildingsinincidentareas,in
accordancewithAppliedTechnologyCouncil(ATC)ATC-20-1andATC-45guidance:
1.RapidEvaluation:Providesaninitialgeneralevaluationofdamageandsafetyandquicklyidentifyandpostunsafeandapparentlysafestructures,andto
identifybuildingsrequiringDetailedEvaluationornecessaryrestrictionsonbuildinguse
2.DetailedEvaluation:Providesacarefulvisualexaminationofthebuildinganditsstr'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1448:Type 3'), 'Post-Disaster Building Safety Evaluator', 'type3', 'Type 3', 'Emergency Management', '10-509-1448', 'Emergency Management', 'ThePost-DisasterBuildingSafetyEvaluator(BuildingSafetyEvaluator)conductsRapidEvaluationsorDetailedEvaluationsofbuildingsinincidentareas,in
accordancewithAppliedTechnologyCouncil(ATC)ATC-20-1andATC-45guidance:
1.RapidEvaluation:Providesaninitialgeneralevaluationofdamageandsafetyandquicklyidentifyandpostunsafeandapparentlysafestructures,andto
identifybuildingsrequiringDetailedEvaluationornecessaryrestrictionsonbuildinguse
2.DetailedEvaluation:Providesacarefulvisualexaminationofthebuildinganditsstr'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1446:Single Type'), 'Post-Disaster Complex Architectural System Condition Evaluator', NULL, 'Single Type', 'Emergency Management', '10-509-1446', 'Emergency Management', 'ThePost-DisasterComplexArchitecturalSystemsConditionEvaluator(ComplexArchitecturalSystemsConditionEvaluator)conductsDetailedEvaluationsof
architecturallycomplexbuildingsandarchitecturalsystems—suchasfiresafetysystems,environmentalsystems,buildingenvelopesystems,communication
systems,accessibilityandbuildingtransportationsystems,andothers—inincidentareas,toassessincidentimpactsonhabitabilityandoccupancy,in
accordancewithAppliedTechnologyCouncil(ATC)ATC-20-1,ATC-45,andFEMAP-2055guidance'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1449:Single Type'), 'Post-Disaster Complex Structural Condition Evaluator', NULL, 'Single Type', 'Emergency Management', '10-509-1449', 'Emergency Management', 'ThePost-DisasterComplexStructuralConditionEvaluatorconductsDetailedEvaluationsofstructurallycomplexbuildingsorconditionsinincidentareas,in
accordancewithAppliedTechnologyCouncil(ATC)ATC-20-1andATC-45guidance'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1309:Single Type'), 'Science and Technology Advisor (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1309', 'Emergency Management', 'TheScienceandTechnologyAdvisorprovidesadviceandinformsdecision-makingforallscienceandtechnology-relatedincidentactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1305:Type 1'), 'State Coordinating Officer (NQS)', 'type1', 'Type 1', 'Emergency Management', '10-509-1305', 'Emergency Management', 'TheStateCoordinatingOfficeroverseesallaspectsofstateandfederallydeclareddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1305:Type 2'), 'State Coordinating Officer (NQS)', 'type2', 'Type 2', 'Emergency Management', '10-509-1305', 'Emergency Management', 'TheStateCoordinatingOfficeroverseesallaspectsofstateandfederallydeclareddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1412:Single Type'), 'Tribal/State Disaster Recovery Coordinator (NQS)', NULL, 'Single Type', 'Emergency Management', '10-509-1412', 'Emergency Management', 'TheTribal/StateDisasterRecoveryCoordinator(T/SDRC)overseesinteragencylong-termrecoveryoperationsrelatedtodeclareddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1404:Type 1'), 'Voluntary Agency Liaison', 'type1', 'Type 1', 'Emergency Management', '10-509-1404', 'Emergency Management', 'TheVoluntaryAgencyLiaison(VAL)servesasthecentralcoordinationpointbetweenlocal,state,tribal,territorialandfederalgovernmentsandvoluntary,
faith-basedandcommunityorganizationsrespondingintimesofdisaster—includingsupportingthecoordinationofvolunteers,donationsandpeopleproviding
disasterservices.TheVALalsogathersandprovidesdailystatisticalreportsandotherpertinentinformationaboutdisasterresponseandrecoveryservices,
includingmasscareandotherservices,fromvoluntary,faith-basedandcommunityorganizationsto'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:10-509-1404:Type 2'), 'Voluntary Agency Liaison', 'type2', 'Type 2', 'Emergency Management', '10-509-1404', 'Emergency Management', 'TheVoluntaryAgencyLiaison(VAL)servesasthecentralcoordinationpointbetweenlocal,state,tribal,territorialandfederalgovernmentsandvoluntary,
faith-basedandcommunityorganizationsrespondingintimesofdisaster—includingsupportingthecoordinationofvolunteers,donationsandpeopleproviding
disasterservices.TheVALalsogathersandprovidesdailystatisticalreportsandotherpertinentinformationaboutdisasterresponseandrecoveryservices,
includingmasscareandotherservices,fromvoluntary,faith-basedandcommunityorganizationsto')
ON CONFLICT DO NOTHING;

-- Emergency Medical Services (21 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1000:Single Type'), 'Advanced Emergency Medical Technician (AEMT)', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1000', 'Emergency Medical Services', 'TheAdvancedEmergencyMedicalTechnician(AEMT)isahealthprofessionalwhoseprimaryfocusistorespondto,assessandtriageemergent,urgentand
nonurgentrequestsformedicalcare;applybasicandfocusedadvancedknowledgeandskillsnecessarytoprovidepatientcareandmedicaltransportation;
andfacilitateaccesstoahigherlevelofcarewhenthepatient''sneedsexceedthecapabilityleveloftheAEMT.TheAEMTmayalsooperateanambulance
whennecessary'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1001:Single Type'), 'Aeromedical Transport Manager', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1001', 'Emergency Medical Services', 'TheAeromedicalTransportManagercoordinatespatienttransportation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1228:Type 1'), 'Aeromedical Transport Officer', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1228', 'Emergency Medical Services', 'TheAeromedicalTransportOfficerisinchargeofallpatientcareandclinicalaspectsoftheairmedicaltransportservice'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1228:Type 2'), 'Aeromedical Transport Officer', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1228', 'Emergency Medical Services', 'TheAeromedicalTransportOfficerisinchargeofallpatientcareandclinicalaspectsoftheairmedicaltransportservice'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1228:Type 3'), 'Aeromedical Transport Officer', 'type3', 'Type 3', 'Emergency Medical Services', '3-509-1228', 'Emergency Medical Services', 'TheAeromedicalTransportOfficerisinchargeofallpatientcareandclinicalaspectsoftheairmedicaltransportservice'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1003:Type 1'), 'Aeromedical Transport Paramedic', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1003', 'Emergency Medical Services', 'TheAeromedicalTransportParamedicassessesthenatureandextentofillnessandinjurytoestablishandprioritizecareforsafeairtransportofthecritical
patienttotheappropriatefacility'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1003:Type 2'), 'Aeromedical Transport Paramedic', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1003', 'Emergency Medical Services', 'TheAeromedicalTransportParamedicassessesthenatureandextentofillnessandinjurytoestablishandprioritizecareforsafeairtransportofthecritical
patienttotheappropriatefacility'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1002:Single Type'), 'Air Medical Transport Mechanic', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1002', 'Emergency Medical Services', 'TheAirMedicalTransportMechanicensuresthataircraftusedformedicalmissionsaremaintainedatoraboveairworthinessstandardsperapplicable
regulations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1000:Single Type'), 'Advanced Emergency Medical Technician (AEMT)', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1000', 'Emergency Medical Services', 'TheAdvancedEmergencyMedicalTechnician(AEMT)isahealthprofessionalwhoseprimaryfocusistorespondto,assessandtriageemergent,urgentand
nonurgentrequestsformedicalcare;applybasicandfocusedadvancedknowledgeandskillsnecessarytoprovidepatientcareandmedicaltransportation;
andfacilitateaccesstoahigherlevelofcarewhenthepatient''sneedsexceedthecapabilityleveloftheAEMT.TheAEMTmayalsooperateanambulance
whennecessary'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1001:Single Type'), 'Aeromedical Transport Manager', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1001', 'Emergency Medical Services', 'TheAeromedicalTransportManagercoordinatespatienttransportation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1228:Type 1'), 'Aeromedical Transport Officer', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1228', 'Emergency Medical Services', 'TheAeromedicalTransportOfficerisinchargeofallpatientcareandclinicalaspectsoftheairmedicaltransportservice'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1228:Type 2'), 'Aeromedical Transport Officer', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1228', 'Emergency Medical Services', 'TheAeromedicalTransportOfficerisinchargeofallpatientcareandclinicalaspectsoftheairmedicaltransportservice'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1228:Type 3'), 'Aeromedical Transport Officer', 'type3', 'Type 3', 'Emergency Medical Services', '3-509-1228', 'Emergency Medical Services', 'TheAeromedicalTransportOfficerisinchargeofallpatientcareandclinicalaspectsoftheairmedicaltransportservice'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1003:Type 1'), 'Aeromedical Transport Paramedic', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1003', 'Emergency Medical Services', 'TheAeromedicalTransportParamedicassessesthenatureandextentofillnessandinjurytoestablishandprioritizecareforsafeairtransportofthecritical
patienttotheappropriatefacility'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1003:Type 2'), 'Aeromedical Transport Paramedic', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1003', 'Emergency Medical Services', 'TheAeromedicalTransportParamedicassessesthenatureandextentofillnessandinjurytoestablishandprioritizecareforsafeairtransportofthecritical
patienttotheappropriatefacility'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1002:Single Type'), 'Air Medical Transport Mechanic', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1002', 'Emergency Medical Services', 'TheAirMedicalTransportMechanicensuresthataircraftusedformedicalmissionsaremaintainedatoraboveairworthinessstandardsperapplicable
regulations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1224:Single Type'), 'Ambulance Strike Team Leader', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1224', 'Emergency Medical Services', 'TheAmbulanceStrikeTeamLeaderprovidesdirectsupervisionandguidancetoanAmbulanceStrikeTeam–AdvancedLifeSupport(ALS)oranAmbulance
StrikeTeam–BasicLifeSupport(BLS)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1008:Single Type'), 'Emergency Medical Responder (EMR)', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1008', 'Emergency Medical Services', 'TheEmergencyMedicalResponder''s(EMR)primaryfocusistoassisthighertrainedindividualsduringpatientcare,movementandtransportation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1227:Type 1'), 'Emergency Medical Services (EMS) Logistics Officer', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1227', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)LogisticsOfficersupportstheMedicalLogisticsUnitdeployedforsustainedmedicalandEMSoperationsduring
emergenciesanddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1227:Type 2'), 'Emergency Medical Services (EMS) Logistics Officer', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1227', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)LogisticsOfficersupportstheMedicalLogisticsUnitdeployedforsustainedmedicalandEMSoperationsduring
emergenciesanddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1225:Type 1'), 'Emergency Medical Services (EMS) Medical Officer', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1225', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)MedicalOfficerisaphysicianwhoprovidestheacutemanagementoflife-threateninginjury,illnessandexposurefor
patientsofallagesinanout-of-hospitalenvironment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1225:Type 2'), 'Emergency Medical Services (EMS) Medical Officer', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1225', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)MedicalOfficerisaphysicianwhoprovidestheacutemanagementoflife-threateninginjury,illnessandexposurefor
patientsofallagesinanout-of-hospitalenvironment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1226:Type 1'), 'Emergency Medical Services (EMS) Operations Officer', 'type1', 'Type 1', 'Emergency Medical Services', '3-509-1226', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)OperationsOfficerplans,accountsfor,coordinatesuseof,schedulesanddispatchesEMStaskforces,striketeams
andsingleunitresourcesdeployedtosupportEMSoperationsduringemergenciesanddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1226:Type 2'), 'Emergency Medical Services (EMS) Operations Officer', 'type2', 'Type 2', 'Emergency Medical Services', '3-509-1226', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)OperationsOfficerplans,accountsfor,coordinatesuseof,schedulesanddispatchesEMStaskforces,striketeams
andsingleunitresourcesdeployedtosupportEMSoperationsduringemergenciesanddisasters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1350:Single Type'), 'Emergency Medical Services (EMS) Task Force Leader', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1350', 'Emergency Medical Services', 'TheEmergencyMedicalServices(EMS)TaskForceLeaderprovidesdirectsupervisionandguidanceforEMSTaskForcepersonnel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1497:Single Type'), 'Emergency Medical Services (EMS) Vehicle Operator', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1497', 'Emergency Medical Services', 'TheEMSVehicleOperatorisresponsibleforthesafeoperationofassignedemergencyvehicles,includingpatienttransport'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1010:Single Type'), 'Emergency Medical Technician (EMT)', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1010', 'Emergency Medical Services', 'TheEmergencyMedicalTechnician(EMT)isahealthprofessionalwhoseprimaryfocusistorespondto,assessandtriageemergent,urgentandnonurgent
requestsformedicalcareandapplybasicknowledgeandskillsnecessarytoprovidepatientcareandmedicaltransportationtoandfromanemergencyor
healthcarefacility.TheEMTmayalsooperatetheambulancewhennecessary'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1012:Single Type'), 'Emergency Vehicle Operator – Heavy (EVO-H)', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1012', 'Emergency Medical Services', 'TheEmergencyVehicleOperator–Heavy(EVO–H)safelyoperatesheavyorlargeemergencyvehicles'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1009:Single Type'), 'Medical Team or Task Force Leader', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1009', 'Emergency Medical Services', 'TheMedicalTeamorTaskForceLeadercoordinatesmedicalteamortaskforceactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:3-509-1015:Single Type'), 'Paramedic', NULL, 'Single Type', 'Emergency Medical Services', '3-509-1015', 'Emergency Medical Services', 'TheParamedicisahealthprofessionalwhoseprimaryfocusistorespondto,assessandtriageemergent,urgentandnonurgentrequestsformedicalcare;
applybasicandadvancedknowledgeandskillsnecessarytodeterminepatientphysiological,psychologicalandpsychosocialneeds;administermedications;
interpretandusediagnosticfindingstoimplementtreatment;providecomplexpatientcare;andfacilitatereferralsoraccesstoahigherlevelofcarewhenthe
patient''sneedsexceedthecapabilityleveloftheParamedic.TheParamedicmayalsooperateanambulancewhenn')
ON CONFLICT DO NOTHING;

-- Fire/Hazardous Materials (12 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1478:Single Type'), 'Airport Firefighter', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1478', 'Fire/Hazardous Materials', 'TheAirportFirefighterisamemberofanaircraftrescueandfirefighting(ARFF)teamresponsibleforsupportingfiresuppression,andrescuewhenresponding
toincidentsonoradjacenttoanairport'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1478:Single Type'), 'Airport Firefighter', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1478', 'Fire/Hazardous Materials', 'TheAirportFirefighterisamemberofanaircraftrescueandfirefighting(ARFF)teamresponsibleforsupportingfiresuppression,andrescuewhenresponding
toincidentsonoradjacenttoanairport'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1477:Type 1'), 'Chemical Operations Support Specialist', 'type1', 'Type 1', 'Fire/Hazardous Materials', '4-509-1477', 'Fire/Hazardous Materials', 'TheChemicalOperationsSupportSpecialist(COSS):
1.Providessubjectmatterexpertiseandguidanceonquestionspertainingtochemicalincidents,theenvironment,modelingofthehazard(s),dataandrisk
management,publicprotectiveactionsandotherscientificandtechnicalissuestoanylevelofallresponseorganizationsonthesetopics
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Providestheexpertisenecessarytoclearlyexplaintheimp'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1477:Type 2'), 'Chemical Operations Support Specialist', 'type2', 'Type 2', 'Fire/Hazardous Materials', '4-509-1477', 'Fire/Hazardous Materials', 'TheChemicalOperationsSupportSpecialist(COSS):
1.Providessubjectmatterexpertiseandguidanceonquestionspertainingtochemicalincidents,theenvironment,modelingofthehazard(s),dataandrisk
management,publicprotectiveactionsandotherscientificandtechnicalissuestoanylevelofallresponseorganizationsonthesetopics
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Providestheexpertisenecessarytoclearlyexplaintheimp'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1477:Type 3'), 'Chemical Operations Support Specialist', 'type3', 'Type 3', 'Fire/Hazardous Materials', '4-509-1477', 'Fire/Hazardous Materials', 'TheChemicalOperationsSupportSpecialist(COSS):
1.Providessubjectmatterexpertiseandguidanceonquestionspertainingtochemicalincidents,theenvironment,modelingofthehazard(s),dataandrisk
management,publicprotectiveactionsandotherscientificandtechnicalissuestoanylevelofallresponseorganizationsonthesetopics
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Providestheexpertisenecessarytoclearlyexplaintheimp'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1477:Type 4'), 'Chemical Operations Support Specialist', 'type4', 'Type 4', 'Fire/Hazardous Materials', '4-509-1477', 'Fire/Hazardous Materials', 'TheChemicalOperationsSupportSpecialist(COSS):
1.Providessubjectmatterexpertiseandguidanceonquestionspertainingtochemicalincidents,theenvironment,modelingofthehazard(s),dataandrisk
management,publicprotectiveactionsandotherscientificandtechnicalissuestoanylevelofallresponseorganizationsonthesetopics
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Providestheexpertisenecessarytoclearlyexplaintheimp'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1479:Single Type'), 'Emergency Vehicle Technician', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1479', 'Fire/Hazardous Materials', 'AnEmergencyVehicleTechnician(EVT)performsinspections,maintenance,andoperationalchecksonemergencyresponsevehicles'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1480:Single Type'), 'Fire Apparatus Operator', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1480', 'Fire/Hazardous Materials', 'TheFireApparatusOperatordrivesandoperatesfireapparatus'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1482:Type 1'), 'Fire Inspector', 'type1', 'Type 1', 'Fire/Hazardous Materials', '4-509-1482', 'Fire/Hazardous Materials', 'AFireInspectorconductsfireinspectionsandappliesapplicablecodesandstandards'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1482:Type 2'), 'Fire Inspector', 'type2', 'Type 2', 'Fire/Hazardous Materials', '4-509-1482', 'Fire/Hazardous Materials', 'AFireInspectorconductsfireinspectionsandappliesapplicablecodesandstandards'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1482:Type 3'), 'Fire Inspector', 'type3', 'Type 3', 'Fire/Hazardous Materials', '4-509-1482', 'Fire/Hazardous Materials', 'AFireInspectorconductsfireinspectionsandappliesapplicablecodesandstandards'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1483:Type 1'), 'Fire Officer', 'type1', 'Type 1', 'Fire/Hazardous Materials', '4-509-1483', 'Fire/Hazardous Materials', 'TheFireOfficerprovidessupervisoryandmanagerialfunctionsforagroupoffirefighters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1483:Type 2'), 'Fire Officer', 'type2', 'Type 2', 'Fire/Hazardous Materials', '4-509-1483', 'Fire/Hazardous Materials', 'TheFireOfficerprovidessupervisoryandmanagerialfunctionsforagroupoffirefighters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1483:Type 3'), 'Fire Officer', 'type3', 'Type 3', 'Fire/Hazardous Materials', '4-509-1483', 'Fire/Hazardous Materials', 'TheFireOfficerprovidessupervisoryandmanagerialfunctionsforagroupoffirefighters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1481:Type 1'), 'Firefighter (Structural)', 'type1', 'Type 1', 'Fire/Hazardous Materials', '4-509-1481', 'Fire/Hazardous Materials', 'TheFirefighter(Structural)providesstructuralfiresuppression'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1481:Type 2'), 'Firefighter (Structural)', 'type2', 'Type 2', 'Fire/Hazardous Materials', '4-509-1481', 'Fire/Hazardous Materials', 'TheFirefighter(Structural)providesstructuralfiresuppression'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1387:Single Type'), 'Hazardous Materials Technician', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1387', 'Fire/Hazardous Materials', 'TheHazardousMaterialsTechnicianrespondstohazardousmaterials(HAZMAT)incidents,includingthoseinvolvingWeaponsofMassDestruction(WMD).
Whenservingaspartofaresponseteam,theHazardousMaterialsTechnicianmayalsofunctioninoneormoreofthefollowingroles,asnecessary:
1.TeamLeader
2.AssistantSafetyOfficer–HazardousMaterials
3.HazardousMaterialsTechnicalReferenceSpecialist'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1484:Single Type'), 'Plans Examiner I/II', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1484', 'Fire/Hazardous Materials', 'APlansExaminerI/IIconductsbasicplanreviewsandapplies/interpretsapplicablecodesandstandards'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1027:Single Type'), 'Public Safety Telecommunicator I/II', NULL, 'Single Type', 'Fire/Hazardous Materials', '4-509-1027', 'Fire/Hazardous Materials', 'ThePublicSafetyTelecommunicatorI/IImanagestheflowofincident-relatedinformationtoandfromfieldunitsorpublicsafetyresources,monitorsstatusof
fieldunits,andassignsadditionalresources,asnecessary'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1475:Type 1'), 'Radiological Emergency Preparedness Program Exercise Evaluator', 'type1', 'Type 1', 'Fire/Hazardous Materials', '4-509-1475', 'Fire/Hazardous Materials', 'ProvidesawrittenevaluationofaRadiologicalEmergencyProgram(REPP)exercise.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1475:Type 2'), 'Radiological Emergency Preparedness Program Exercise Evaluator', 'type2', 'Type 2', 'Fire/Hazardous Materials', '4-509-1475', 'Fire/Hazardous Materials', 'ProvidesawrittenevaluationofaRadiologicalEmergencyProgram(REPP)exercise.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:4-509-1475:Type 3'), 'Radiological Emergency Preparedness Program Exercise Evaluator', 'type3', 'Type 3', 'Fire/Hazardous Materials', '4-509-1475', 'Fire/Hazardous Materials', 'ProvidesawrittenevaluationofaRadiologicalEmergencyProgram(REPP)exercise.')
ON CONFLICT DO NOTHING;

-- Geographic Info Systems and Info Technology (4 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:14-509-1324:Type 1'), 'Geographic Information Systems Analyst (NQS)', 'type1', 'Type 1', 'Geographic Info Systems and Info Technology', '14-509-1324', 'Geographic Info Systems and Info Technology', 'TheGeographicInformationSystem(GIS)AnalystconductsanalysisofGISdataandproducts,maintainsandmanagesGISproductsandresources'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:14-509-1324:Type 2'), 'Geographic Information Systems Analyst (NQS)', 'type2', 'Type 2', 'Geographic Info Systems and Info Technology', '14-509-1324', 'Geographic Info Systems and Info Technology', 'TheGeographicInformationSystem(GIS)AnalystconductsanalysisofGISdataandproducts,maintainsandmanagesGISproductsandresources'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:14-509-1198:Single Type'), 'Geographic Information Systems Field Data Entry Technician', NULL, 'Single Type', 'Geographic Info Systems and Info Technology', '14-509-1198', 'Geographic Info Systems and Info Technology', 'TheGeographicInformationSystems(GIS)FieldDataEntryTechniciancollectsdatausingmobiledatacollectiondevices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:14-509-1323:Single Type'), 'Geographic Information Systems Specialist (NQS)', NULL, 'Single Type', 'Geographic Info Systems and Info Technology', '14-509-1323', 'Geographic Info Systems and Info Technology', 'TheGeographicInformationSystems(GIS)Specialistcoordinatestoprepareincidentmapsanddisplaysbycollectingandinterpretinginformation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:14-509-1297:Single Type'), 'Geographic Information Systems Supervisor (NQS)', NULL, 'Single Type', 'Geographic Info Systems and Info Technology', '14-509-1297', 'Geographic Info Systems and Info Technology', 'TheGeographicInformationSystems(GIS)SupervisorprovidesoversightforGISactivitiesofmultipleGISteamsduringexpandingandcomplexincidents')
ON CONFLICT DO NOTHING;

-- Hazard Mitigation (11 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1490:Type 1'), 'Building Code Specialist', 'type1', 'Type 1', 'Hazard Mitigation', '15-509-1490', 'Hazard Mitigation', 'ABuildingCodeSpecialistprovidesacommunitywithtechnicalassistanceinbuildinginspections,buildingcodesandbuildingsafety'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1490:Type 2'), 'Building Code Specialist', 'type2', 'Type 2', 'Hazard Mitigation', '15-509-1490', 'Hazard Mitigation', 'ABuildingCodeSpecialistprovidesacommunitywithtechnicalassistanceinbuildinginspections,buildingcodesandbuildingsafety'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1491:Single Type'), 'Construction Cost Estimator', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1491', 'Hazard Mitigation', 'AConstructionCostEstimatorprovidestechnicalsupportincollectingandanalyzingdatatoestimatethetime,money,resources,andlaborrequiredfor
HazardMitigation(HM)constructionprojects'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1407:Single Type'), 'Hazard Mitigation Community Education and Outreach Specialist (NQS)', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1407', 'Hazard Mitigation', 'TheHazardMitigation(HM)CommunityEducationandOutreachSpecialistservesasageneralliaisonbetweentheAuthorityHavingJurisdiction(AHJ)and
relatedagencies/organizationsandthepublicduringmitigationoperations.Thispositionisresponsibleforunderstandingandinterpretingawiderangeof
potentiallycomplexprogrammaticandtechnicalinformationandconveyinginformationtoindividualsandorganizations.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1408:Single Type'), 'Hazard Mitigation Community Planner Specialist (NQS)', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1408', 'Hazard Mitigation', 'TheHazardMitigation(HM)CommunityPlannerSpecialistprovidesexpertiseinarangeofsubjectareasrelatedtoHMplanning,includinglong-termrecovery
plansandHMplansthatconformtotherequirementsoftheDisasterMitigationActof2000.Thispositionservesasaliaisonforvarioustechnicaldisciplines
thathaverolesinHM,withthepurposeofintegratingvariouselementsintoamitigationplan.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1409:Single Type'), 'Hazard Mitigation Engineering and Architect Specialist (NQS)', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1409', 'Hazard Mitigation', 'TheHazardMitigation(HM)EngineeringandArchitectSpecialistprovidesafullrangeoftechnicalservicesinsupportofmitigationprogramactivities,including
initialprojectdevelopment,buildingperformance,post-disasterdamageevaluations,benefit-costanalysis,andprogrammaticeligibilityreviews'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1410:Single Type'), 'Hazard Mitigation Floodplain Management Specialist (NQS)', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1410', 'Hazard Mitigation', 'TheHazardMitigation(HM)FloodplainManagementSpecialistsupportsinternalandexternalstakeholderstoensuretheimplementationoffloodplain
managementbestpracticesinapost-disasterenvironment.Thispositionalsosupportsvariousmitigationprograms,includingFederalEmergency
ManagementAgency''s(FEMA)HMassistance,HMgrant,andPublicAssistance(PA)mitigationprograms.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1200:Type 1'), 'Hazard Mitigation Officer', 'type1', 'Type 1', 'Hazard Mitigation', '15-509-1200', 'Hazard Mitigation', 'TheHazardMitigation(HM)Officerprovidessupportforhazardmitigationplanningandgrantprogramspriortoandafterahazardevent'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1200:Type 2'), 'Hazard Mitigation Officer', 'type2', 'Type 2', 'Hazard Mitigation', '15-509-1200', 'Hazard Mitigation', 'TheHazardMitigation(HM)Officerprovidessupportforhazardmitigationplanningandgrantprogramspriortoandafterahazardevent'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1199:Single Type'), 'Hazard Mitigation Outreach Specialist', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1199', 'Hazard Mitigation', 'TheHazardMitigation(HM)OutreachSpecialistprovidestechnicalassistancetoadvancemitigationactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1201:Type 1'), 'Hazard Mitigation Planner', 'type1', 'Type 1', 'Hazard Mitigation', '15-509-1201', 'Hazard Mitigation', 'TheHazardMitigation(HM)PlannerisresponsibleforassistinganAuthorityHavingJurisdiction(AHJ)byprovidingHMplanningtechnicalassistanceto
applicableunitsofgovernment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1201:Type 2'), 'Hazard Mitigation Planner', 'type2', 'Type 2', 'Hazard Mitigation', '15-509-1201', 'Hazard Mitigation', 'TheHazardMitigation(HM)PlannerisresponsibleforassistinganAuthorityHavingJurisdiction(AHJ)byprovidingHMplanningtechnicalassistanceto
applicableunitsofgovernment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1202:Type 1'), 'Hazard Mitigation Risk Analyst', 'type1', 'Type 1', 'Hazard Mitigation', '15-509-1202', 'Hazard Mitigation', 'TheHazardMitigation(HM)RiskAnalystprovidesfactualbasesforactivitiesproposedinthestrategyportionofahazardmitigationplanandusesGeographic
InformationSystems(GIS)andGISmapstohighlightrisks'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1202:Type 2'), 'Hazard Mitigation Risk Analyst', 'type2', 'Type 2', 'Hazard Mitigation', '15-509-1202', 'Hazard Mitigation', 'TheHazardMitigation(HM)RiskAnalystprovidesfactualbasesforactivitiesproposedinthestrategyportionofahazardmitigationplanandusesGeographic
InformationSystems(GIS)andGISmapstohighlightrisks'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1202:Type 3'), 'Hazard Mitigation Risk Analyst', 'type3', 'Type 3', 'Hazard Mitigation', '15-509-1202', 'Hazard Mitigation', 'TheHazardMitigation(HM)RiskAnalystprovidesfactualbasesforactivitiesproposedinthestrategyportionofahazardmitigationplanandusesGeographic
InformationSystems(GIS)andGISmapstohighlightrisks'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:15-509-1492:Single Type'), 'Public Assistance/Infrastructure Mitigation Specialist', NULL, 'Single Type', 'Hazard Mitigation', '15-509-1492', 'Hazard Mitigation', 'APublicAssistance/InfrastructureHazardMitigationSpecialistassistscommunitiesbyidentifying,developing,quantifying,and/orreviewingpublicworksand
infrastructuremitigationprojectsforsoundmitigationtechniquesandeligibilityforPublicAssistance(PA)406Mitigationfunding.ThePublic
Assistance/InfrastructureHazardMitigationSpecialistalsomanages406Mitigationgrantprojectsthatpromotemitigationmeasuresthatreducefuturelossof
lifeandproperty,protectthefederalinvestmentinpublicinfrastructure,andultimatelyhelpbuildd')
ON CONFLICT DO NOTHING;

-- Incident Management (36 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1423:Single Type'), 'Air Operations Branch Director (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1423', 'Incident Management', 'TheAirOperationsBranchDirectorhelpsensurethesafeandefficientuseofaviationresources.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1424:Single Type'), 'Air Support Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1424', 'Incident Management', 'TheAirSupportGroupSupervisorassistswithflightcrewgroundneedsandcoordinateswiththeAirTacticalGroupSupervisortohelpensuremission''s
successandcrewsafety'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1425:Single Type'), 'Air Tactical Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1425', 'Incident Management', 'TheAirTacticalGroupSupervisorcoordinatesallairborneactivitywiththeassistanceofahelicoptercoordinatorandafixedwingcoordinator.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1423:Single Type'), 'Air Operations Branch Director (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1423', 'Incident Management', 'TheAirOperationsBranchDirectorhelpsensurethesafeandefficientuseofaviationresources.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1424:Single Type'), 'Air Support Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1424', 'Incident Management', 'TheAirSupportGroupSupervisorassistswithflightcrewgroundneedsandcoordinateswiththeAirTacticalGroupSupervisortohelpensuremission''s
successandcrewsafety'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1425:Single Type'), 'Air Tactical Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1425', 'Incident Management', 'TheAirTacticalGroupSupervisorcoordinatesallairborneactivitywiththeassistanceofahelicoptercoordinatorandafixedwingcoordinator.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1426:Single Type'), 'Cost Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1426', 'Incident Management', 'TheCostUnitLeadercollects,records,anddevelopsrecommendationsrelatedtotheincidentcosts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1427:Single Type'), 'Demobilization Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1427', 'Incident Management', 'TheDemobilizationUnitLeaderoverseesunitstaffwhodevelopanincidentdemobilizationplanthatincludesspecificinstructionsforallpersonnelandother
resourcestobedemobilized.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1406:Single Type'), 'Division/Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1406', 'Incident Management', 'TheDivision/GroupSupervisor(DIVS)implementstheportionoftheIncidentActionPlan(IAP)pertainingtohisorherDivision/Group,supervisesassigned
resources,reportsontheprogressofoperationsandthestatusofassignedresourcesandprovidesassessmentandcontextasinputtothesharedsituational
picture'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1428:Single Type'), 'Documentation Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1428', 'Incident Management', 'TheDocumentationUnitLeaderoverseesunitstaffwhomaintainincidentfilesanddataforlegal,analyticalandhistoricalpurposes,includingacomplete
recordofthemajorstepstakentoresolvetheincident.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1351:Single Type'), 'Evacuation Coordination Team Leader', NULL, 'Single Type', 'Incident Management', '2-509-1351', 'Incident Management', 'TheEvacuationCoordinationTeamLeaderprovidesoversightandcoordinationoftheEvacuationCoordinationTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1031:Type 1'), 'Finance/Administration Section Chief (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1031', 'Incident Management', 'TheFinance/AdministrationSectionChiefoverseesstaffresponsibleforrecordingpersonneltime,negotiatingleases,maintainingvendorcontracts,
administeringclaimsandtrackingandanalyzingincidentcosts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1031:Type 2'), 'Finance/Administration Section Chief (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1031', 'Incident Management', 'TheFinance/AdministrationSectionChiefoverseesstaffresponsibleforrecordingpersonneltime,negotiatingleases,maintainingvendorcontracts,
administeringclaimsandtrackingandanalyzingincidentcosts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1031:Type 3'), 'Finance/Administration Section Chief (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1031', 'Incident Management', 'TheFinance/AdministrationSectionChiefoverseesstaffresponsibleforrecordingpersonneltime,negotiatingleases,maintainingvendorcontracts,
administeringclaimsandtrackingandanalyzingincidentcosts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1429:Single Type'), 'Forensic Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1429', 'Incident Management', 'TheForensicGroupSupervisoroverseesforensicoperationsandcoordinateswithothergroupsandauthoritiesregardingforensicneeds'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1037:Type 1'), 'Incident Command System Public Information Officer (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1037', 'Incident Management', 'ThePublicInformationOfficer(PIO)disseminatescommunityinformationtothepublic'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1037:Type 2'), 'Incident Command System Public Information Officer (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1037', 'Incident Management', 'ThePublicInformationOfficer(PIO)disseminatescommunityinformationtothepublic'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1037:Type 3'), 'Incident Command System Public Information Officer (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1037', 'Incident Management', 'ThePublicInformationOfficer(PIO)disseminatescommunityinformationtothepublic'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1032:Type 1'), 'Incident Commander (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1032', 'Incident Management', 'TheIncidentCommander(IC)isresponsiblefortheoverallmanagementoftheincidentanddetermineswhichCommandandGeneralStaffpositionstostaffin
ordertomaintainamanageablespanofcontrolandensureappropriateattentiontothenecessaryincidentmanagementfunctions.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1032:Type 2'), 'Incident Commander (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1032', 'Incident Management', 'TheIncidentCommander(IC)isresponsiblefortheoverallmanagementoftheincidentanddetermineswhichCommandandGeneralStaffpositionstostaffin
ordertomaintainamanageablespanofcontrolandensureappropriateattentiontothenecessaryincidentmanagementfunctions.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1032:Type 3'), 'Incident Commander (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1032', 'Incident Management', 'TheIncidentCommander(IC)isresponsiblefortheoverallmanagementoftheincidentanddetermineswhichCommandandGeneralStaffpositionstostaffin
ordertomaintainamanageablespanofcontrolandensureappropriateattentiontothenecessaryincidentmanagementfunctions.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1032:Type 4'), 'Incident Commander (NQS)', 'type4', 'Type 4', 'Incident Management', '2-509-1032', 'Incident Management', 'TheIncidentCommander(IC)isresponsiblefortheoverallmanagementoftheincidentanddetermineswhichCommandandGeneralStaffpositionstostaffin
ordertomaintainamanageablespanofcontrolandensureappropriateattentiontothenecessaryincidentmanagementfunctions.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1157:Type 1'), 'Individual Assistance Disaster Assessment Team Leader', 'type1', 'Type 1', 'Incident Management', '2-509-1157', 'Incident Management', 'Individual Assistance Disaster Assessment Team Leader'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1157:Type 2'), 'Individual Assistance Disaster Assessment Team Leader', 'type2', 'Type 2', 'Incident Management', '2-509-1157', 'Incident Management', 'Individual Assistance Disaster Assessment Team Leader'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1157:Type 3'), 'Individual Assistance Disaster Assessment Team Leader', 'type3', 'Type 3', 'Incident Management', '2-509-1157', 'Incident Management', 'Individual Assistance Disaster Assessment Team Leader'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1157:Type 4'), 'Individual Assistance Disaster Assessment Team Leader', 'type4', 'Type 4', 'Incident Management', '2-509-1157', 'Incident Management', 'Individual Assistance Disaster Assessment Team Leader'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1433:Single Type'), 'Intelligence Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1433', 'Incident Management', 'TheIntelligenceGroupSupervisormanagesandcoordinatesthegatheringanddisseminationofintelligenceandinformation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1432:Type 1'), 'Intelligence/Investigations Section Chief (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1432', 'Incident Management', 'TheIntelligence/Investigations(I/I)SectionChiefcoordinatesintelligenceandinvestigationefforts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1432:Type 2'), 'Intelligence/Investigations Section Chief (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1432', 'Incident Management', 'TheIntelligence/Investigations(I/I)SectionChiefcoordinatesintelligenceandinvestigationefforts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1432:Type 3'), 'Intelligence/Investigations Section Chief (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1432', 'Incident Management', 'TheIntelligence/Investigations(I/I)SectionChiefcoordinatesintelligenceandinvestigationefforts'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1434:Single Type'), 'Investigative Operations Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1434', 'Incident Management', 'TheInvestigativeOperationsGroupSupervisormanagesanddirectstheoverallinvestigativeeffort,includingmanagementofplans,leads,evidence,and
documentation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1435:Single Type'), 'Investigative Support Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1435', 'Incident Management', 'TheInvestigativeSupportGroupSupervisormanagesandcoordinatessupportfortheInvestigativeOperationsGroup'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1033:Single Type'), 'Liaison Officer (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1033', 'Incident Management', 'TheLiaisonOfficerisaconduitofinformationandassistancebetweenincidentpersonnelandorganizationsthatareassistingorcooperatingwiththe
response.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1034:Type 1'), 'Logistics Section Chief (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1034', 'Incident Management', 'TheLogisticsSectionChiefoverseestheprovisionofalltheincident’ssupportneeds—suchasorderingresourcesandprovidingfacilities,transportation,
supplies,equipmentmaintenance,equipmentfuel,communicationsandfoodandmedicalservices—forincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1034:Type 2'), 'Logistics Section Chief (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1034', 'Incident Management', 'TheLogisticsSectionChiefoverseestheprovisionofalltheincident’ssupportneeds—suchasorderingresourcesandprovidingfacilities,transportation,
supplies,equipmentmaintenance,equipmentfuel,communicationsandfoodandmedicalservices—forincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1034:Type 3'), 'Logistics Section Chief (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1034', 'Incident Management', 'TheLogisticsSectionChiefoverseestheprovisionofalltheincident’ssupportneeds—suchasorderingresourcesandprovidingfacilities,transportation,
supplies,equipmentmaintenance,equipmentfuel,communicationsandfoodandmedicalservices—forincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1034:Type 4'), 'Logistics Section Chief (NQS)', 'type4', 'Type 4', 'Incident Management', '2-509-1034', 'Incident Management', 'TheLogisticsSectionChiefoverseestheprovisionofalltheincident’ssupportneeds—suchasorderingresourcesandprovidingfacilities,transportation,
supplies,equipmentmaintenance,equipmentfuel,communicationsandfoodandmedicalservices—forincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1436:Single Type'), 'Missing Persons Group Supervisor (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1436', 'Incident Management', 'TheMissingPersonsGroupSupervisorcoordinatesandmanagesMissingPersonsGroupfunctions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1035:Type 1'), 'Operations Section Chief (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1035', 'Incident Management', 'TheOperationsSectionChiefmanagestacticalincidentactivitiestoachieveincidentobjectivesandoverseesIncidentActionPlan(IAP)implementation.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1035:Type 2'), 'Operations Section Chief (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1035', 'Incident Management', 'TheOperationsSectionChiefmanagestacticalincidentactivitiestoachieveincidentobjectivesandoverseesIncidentActionPlan(IAP)implementation.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1035:Type 3'), 'Operations Section Chief (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1035', 'Incident Management', 'TheOperationsSectionChiefmanagestacticalincidentactivitiestoachieveincidentobjectivesandoverseesIncidentActionPlan(IAP)implementation.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1036:Type 1'), 'Planning Section Chief (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1036', 'Incident Management', 'ThePlanningSectionChiefoverseesincident-relateddatagatheringandanalysisregardingincidentoperationsandassignedresources,facilitatesincident
actionplanningmeetingsandpreparestheIncidentActionPlan(IAP)foreachoperationalperiod.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1036:Type 2'), 'Planning Section Chief (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1036', 'Incident Management', 'ThePlanningSectionChiefoverseesincident-relateddatagatheringandanalysisregardingincidentoperationsandassignedresources,facilitatesincident
actionplanningmeetingsandpreparestheIncidentActionPlan(IAP)foreachoperationalperiod.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1036:Type 3'), 'Planning Section Chief (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1036', 'Incident Management', 'ThePlanningSectionChiefoverseesincident-relateddatagatheringandanalysisregardingincidentoperationsandassignedresources,facilitatesincident
actionplanningmeetingsandpreparestheIncidentActionPlan(IAP)foreachoperationalperiod.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1437:Single Type'), 'Procurement Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1437', 'Incident Management', 'TheProcurementUnitLeaderoverseesunitstaffwhoadministerallfinancialmatterspertainingtoleasesandvendorcontracts.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1438:Single Type'), 'Rapid Needs Assessment Team Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1438', 'Incident Management', 'TheRapidNeedsAssessment(RNA)TeamLeadersupervisesoverallteamoperationsandassessmentprocess'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1439:Single Type'), 'Rapid Needs Assessment Technical Specialist (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1439', 'Incident Management', 'TheRapidNeedsAssessment(RNA)TechnicalSpecialistconductsrapidassessmentoflifesafetyissues,criticalinfrastructureandhumanneeds,suchas
provisionofutilities,potablewaterandroadblockages'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1381:Single Type'), 'Remote Pilot-In-Command', NULL, 'Single Type', 'Incident Management', '2-509-1381', 'Incident Management', 'TheRemotePilot-in-Command(RemotePIC):
1.HoldsaRemotePilotCertificatewithasmallUnmannedAircraftSystem(sUAS)ratingandhasthefinalauthorityandresponsibilityfortheoperationand
safetyofasmall,unmannedaircraftoperationconductedunderFederalAviationAdministration(FAA)part107
2.OperatesasUASplatforminasafeandsecuremanneraccordingtoallstate,local,tribal,territorial,andfederalregulations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1440:Single Type'), 'Resources Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1440', 'Incident Management', 'TheResourcesUnitLeadertracksthelocationandstatusofallresourcesassignedtoanincident.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1441:Type 1'), 'Safety Officer (NQS)', 'type1', 'Type 1', 'Incident Management', '2-509-1441', 'Incident Management', 'TheSafetyOfficermonitorsincidentoperationsandadvisestheIncidentCommander(IC)orUnifiedCommandonallmattersrelatingtooperationalsafety,
includingthehealthandsafetyofincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1441:Type 2'), 'Safety Officer (NQS)', 'type2', 'Type 2', 'Incident Management', '2-509-1441', 'Incident Management', 'TheSafetyOfficermonitorsincidentoperationsandadvisestheIncidentCommander(IC)orUnifiedCommandonallmattersrelatingtooperationalsafety,
includingthehealthandsafetyofincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1441:Type 3'), 'Safety Officer (NQS)', 'type3', 'Type 3', 'Incident Management', '2-509-1441', 'Incident Management', 'TheSafetyOfficermonitorsincidentoperationsandadvisestheIncidentCommander(IC)orUnifiedCommandonallmattersrelatingtooperationalsafety,
includingthehealthandsafetyofincidentpersonnel.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1442:Single Type'), 'Situation Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1442', 'Incident Management', 'TheSituationUnitLeaderoverseesunitstaffwhocollect,processandorganizesituationinformation,preparesituationsummariesanddevelopprojectionsand
forecastsrelatedtotheincident.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1382:Single Type'), 'Technical Specialist - Small Unmanned Aircraft System', NULL, 'Single Type', 'Incident Management', '2-509-1382', 'Incident Management', 'TheTechnicalSpecialist–smallUnmannedAircraftSystem(sUAS)providestechnicalsupporttothesUASTeam,includingmanagingthedatarecording
payloadandsoftware,managingcommunicationssystemsandfrequencies,andmaintainingdocumentationintheappropriatechainofcustody.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1444:Single Type'), 'Time Unit Leader (NQS)', NULL, 'Single Type', 'Incident Management', '2-509-1444', 'Incident Management', 'TheTimeUnitLeadercollects,records,andmaintainsalltimedataandcumulativetimerecords'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1352:Single Type'), 'Traffic Control Specialist', NULL, 'Single Type', 'Incident Management', '2-509-1352', 'Incident Management', 'TheTrafficControlSpecialistcoordinatestrafficcontrolpointsduringtransportation-relatedincidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:2-509-1353:Single Type'), 'Transportation Specialist', NULL, 'Single Type', 'Incident Management', '2-509-1353', 'Incident Management', 'TheTransportationSpecialistcoordinatestransportation-relatedresourcesforevacuation')
ON CONFLICT DO NOTHING;

-- Law Enforcement Operations (20 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1258:Type 1'), 'Boat Crew Member (Law Enforcement)', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1258', 'Law Enforcement Operations', 'TheBoatCrewMember(LawEnforcement(LE))performsoperationaltasksandlawenforcementfunctions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1258:Type 2'), 'Boat Crew Member (Law Enforcement)', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1258', 'Law Enforcement Operations', 'TheBoatCrewMember(LawEnforcement(LE))performsoperationaltasksandlawenforcementfunctions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1257:Type 1'), 'Boat Operator (Law Enforcement)', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1257', 'Law Enforcement Operations', 'TheBoatOperator(LawEnforcement(LE))respondstomaritimelawenforcementmissionsincludingenforcement,searchandrescueandbasicfirefighting
missions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1257:Type 2'), 'Boat Operator (Law Enforcement)', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1257', 'Law Enforcement Operations', 'TheBoatOperator(LawEnforcement(LE))respondstomaritimelawenforcementmissionsincludingenforcement,searchandrescueandbasicfirefighting
missions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1207:Single Type'), 'Bomb Technician', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1207', 'Law Enforcement Operations', 'TheBombTechnicianrespondstoincidentsinvolvingexplosivesandrendersexplosivedevicessafe'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1489:Type 1'), 'Canine Handler - Explosives', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1489', 'Law Enforcement Operations', 'CanineHandler-Explosivesisapersonwhohassuccessfullycompletedarecognizedcourseofcaninehandlingintheexplosivesdetectiondisciplineand
maintainsthoseabilitiesthroughfieldapplications;maintenancetraining;certification;recertification;anddepartment,agency,ororganizationrequired
continuingcanineeducation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1489:Type 2'), 'Canine Handler - Explosives', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1489', 'Law Enforcement Operations', 'CanineHandler-Explosivesisapersonwhohassuccessfullycompletedarecognizedcourseofcaninehandlingintheexplosivesdetectiondisciplineand
maintainsthoseabilitiesthroughfieldapplications;maintenancetraining;certification;recertification;anddepartment,agency,ororganizationrequired
continuingcanineeducation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1489:Type 3'), 'Canine Handler - Explosives', 'type3', 'Type 3', 'Law Enforcement Operations', '6-509-1489', 'Law Enforcement Operations', 'CanineHandler-Explosivesisapersonwhohassuccessfullycompletedarecognizedcourseofcaninehandlingintheexplosivesdetectiondisciplineand
maintainsthoseabilitiesthroughfieldapplications;maintenancetraining;certification;recertification;anddepartment,agency,ororganizationrequired
continuingcanineeducation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1342:Single Type'), 'Crisis Negotiation Team Leader', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1342', 'Law Enforcement Operations', 'TheCrisisNegotiationTeamLeaderisalawenforcementofficerwhosupervisesaCrisisNegotiationTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1343:Single Type'), 'Crisis Negotiation Team Negotiator', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1343', 'Law Enforcement Operations', 'TheCrisisNegotiationTeamNegotiatorisaswornlawenforcementofficerwhoconductscrisisnegotiationswithindividualsorgroupsofpeople'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1375:Type 1'), 'Dive Team Leader', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1375', 'Law Enforcement Operations', 'TheDiveTeamLeadermanagesanddirectsallaspectsofdiveoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1375:Type 2'), 'Dive Team Leader', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1375', 'Law Enforcement Operations', 'TheDiveTeamLeadermanagesanddirectsallaspectsofdiveoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1374:Type 1'), 'Diver', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1374', 'Law Enforcement Operations', 'TheDiverperformsunderwaterfunctions,includingevidencecollectionandremainssearchandrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1374:Type 2'), 'Diver', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1374', 'Law Enforcement Operations', 'TheDiverperformsunderwaterfunctions,includingevidencecollectionandremainssearchandrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1374:Type 3'), 'Diver', 'type3', 'Type 3', 'Law Enforcement Operations', '6-509-1374', 'Law Enforcement Operations', 'TheDiverperformsunderwaterfunctions,includingevidencecollectionandremainssearchandrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1374:Type 4'), 'Diver', 'type4', 'Type 4', 'Law Enforcement Operations', '6-509-1374', 'Law Enforcement Operations', 'TheDiverperformsunderwaterfunctions,includingevidencecollectionandremainssearchandrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1280:Type 1'), 'Fusion Liaison Officer', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1280', 'Law Enforcement Operations', 'TheFusionLiaisonOfficer(FLO)servesastheconduitfortheflowofhomelandsecurityandcrime-relatedinformationbetweenthefieldandafusioncenterfor
assessmentandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1280:Type 2'), 'Fusion Liaison Officer', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1280', 'Law Enforcement Operations', 'TheFusionLiaisonOfficer(FLO)servesastheconduitfortheflowofhomelandsecurityandcrime-relatedinformationbetweenthefieldandafusioncenterfor
assessmentandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1281:Type 1'), 'Intelligence Analyst', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1281', 'Law Enforcement Operations', 'TheIntelligenceAnalystworkswithinafusioncenterorintelligenceunit,supportingintelligenceoperationsorprovidinganalyticsupporttoresponseoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1281:Type 2'), 'Intelligence Analyst', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1281', 'Law Enforcement Operations', 'TheIntelligenceAnalystworkswithinafusioncenterorintelligenceunit,supportingintelligenceoperationsorprovidinganalyticsupporttoresponseoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1281:Type 3'), 'Intelligence Analyst', 'type3', 'Type 3', 'Law Enforcement Operations', '6-509-1281', 'Law Enforcement Operations', 'TheIntelligenceAnalystworkswithinafusioncenterorintelligenceunit,supportingintelligenceoperationsorprovidinganalyticsupporttoresponseoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1281:Type 4'), 'Intelligence Analyst', 'type4', 'Type 4', 'Law Enforcement Operations', '6-509-1281', 'Law Enforcement Operations', 'TheIntelligenceAnalystworkswithinafusioncenterorintelligenceunit,supportingintelligenceoperationsorprovidinganalyticsupporttoresponseoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1364:Single Type'), 'Mobile Field Force Officer', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1364', 'Law Enforcement Operations', 'TheMobileFieldForceOfficerisaswornlawenforcementofficerassignedtoanagencyorregionalMobileFieldForce(MFF)withmultidisciplinaryskillsin
patrolorfixed-sitefunctions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1365:Single Type'), 'Mobile Field Force Supervisor', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1365', 'Law Enforcement Operations', 'TheMobileFieldForceSupervisoroverseesandmanagesaMobileFieldForce(MFF)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1366:Single Type'), 'Mobile Field Force Team Leader', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1366', 'Law Enforcement Operations', 'TheMobileFieldForceTeamLeadermanagesaMobileFieldForce(MFF)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1368:Single Type'), 'Patrol Team Leader', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1368', 'Law Enforcement Operations', 'ThePatrolTeamLeaderisalawenforcementmanagerwhohasoverallauthorityandresponsibilityforpatroloperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1369:Single Type'), 'Patrol Team Officer', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1369', 'Law Enforcement Operations', 'ThePatrolTeamOfficerisacertifiedlawenforcementofficerassignedtopatrolfunctionstoprevent,deter,anddetectcrime'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1370:Single Type'), 'Patrol Team Supervisor', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1370', 'Law Enforcement Operations', 'ThePatrolTeamSupervisoroverseespatroloperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1380:Single Type'), 'Special Weapons and Tactics Team Commander', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1380', 'Law Enforcement Operations', 'TheSpecialWeaponsandTactics(SWAT)TeamCommandersupervisesaSWATTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1379:Single Type'), 'Special Weapons and Tactics Team Leader', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1379', 'Law Enforcement Operations', 'TheSpecialWeaponsandTactics(SWAT)TeamLeaderdevelopsandexecutesSWAToperationaltacticsandtraining'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1378:Single Type'), 'Special Weapons and Tactics Team Officer', NULL, 'Single Type', 'Law Enforcement Operations', '6-509-1378', 'Law Enforcement Operations', 'TheSpecialWeaponsandTactics(SWAT)TeamOfficerrespondstohigh-riskincidentsasamemberofaSWATTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1376:Type 1'), 'Tender', 'type1', 'Type 1', 'Law Enforcement Operations', '6-509-1376', 'Law Enforcement Operations', 'TheTenderhelpscreateadiveplanandassistsdiversinallaspectsofadive'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:6-509-1376:Type 2'), 'Tender', 'type2', 'Type 2', 'Law Enforcement Operations', '6-509-1376', 'Law Enforcement Operations', 'TheTenderhelpscreateadiveplanandassistsdiversinallaspectsofadive')
ON CONFLICT DO NOTHING;

-- Logistics and Transportation (7 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1325:Single Type'), 'Facilities Unit Leader (NQS)', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1325', 'Logistics and Transportation', 'TheFacilitiesUnitLeaderoverseesunitstaffwhosetup,maintainanddemobilizeallfacilitiesusedinsupportofincidentoperationsandwhoprovidefacility
maintenanceandlawenforcement/securityservicesnecessaryforincidentsupport.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1293:Single Type'), 'Food Unit Leader (NQS)', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1293', 'Logistics and Transportation', 'TheFoodUnitLeaderoverseesunitstaffwhodeterminethefoodandhydrationneedsofpersonnelassignedtotheincidentandplanmenus,orderfood,
providecookingfacilities,cook,servefood,maintainfoodserviceareasandmanagefoodsecurityandsafety.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1298:Single Type'), 'Ground Support Unit Leader (NQS)', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1298', 'Logistics and Transportation', 'TheGroundSupportUnitLeaderoverseesunitstaffwhoprovidegroundtransportationinsupportofincidentoperations,overseesthemaintenanceandrepair
ofvehiclesandmobilegroundsupportequipmentandperformspre-andpost-useinspectionsonallgroundequipmentassignedtoanincident.TheGround
SupportUnitLeaderalsooverseesthesupplyoffuelforincidentmobileequipmentandthedevelopmentandimplementationoftheincidenttrafficplan.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1405:Single Type'), 'Ordering Team Leader', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1405', 'Logistics and Transportation', 'TheOrderingTeamLeaderoverseestheteamresponsibleforplacingallordersforpersonnel,resources,supplies,andequipmentfortheLogisticsStaging
Area(LSA)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1247:Single Type'), 'Service Branch Director (NQS)', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1247', 'Logistics and Transportation', 'TheServiceBranchDirectorsupervisesincident-relatedcommunications,foodandmedicalunits.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1304:Single Type'), 'Supply Unit Leader (NQS)', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1304', 'Logistics and Transportation', 'TheSupplyUnitLeaderoverseesunitstaffwhoorder,receive,process,store,inventoryanddistributeallincident-relatedresources.TheSupplyUnitLeader
alsooverseesunitstaffwhoassistinprojectingresourceneeds.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:11-509-1443:Single Type'), 'Support Branch Director (NQS)', NULL, 'Single Type', 'Logistics and Transportation', '11-509-1443', 'Logistics and Transportation', 'TheSupportBranchDirectoroverseesincident-relatedresources,supplies,facilities,andgroundtransportation')
ON CONFLICT DO NOTHING;

-- Mass Care Services (18 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1284:Single Type'), 'Access and Functional Needs (AFN) Advisor (NQS)', NULL, 'Single Type', 'Mass Care Services', '9-509-1284', 'Mass Care Services', 'TheAccessandFunctionalNeeds(AFN)AdvisorsupportsandassistsincidentmanagementpersonnelonmattersrelatedtopeoplewithdisabilitiesandAFN'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1284:Single Type'), 'Access and Functional Needs (AFN) Advisor (NQS)', NULL, 'Single Type', 'Mass Care Services', '9-509-1284', 'Mass Care Services', 'TheAccessandFunctionalNeeds(AFN)AdvisorsupportsandassistsincidentmanagementpersonnelonmattersrelatedtopeoplewithdisabilitiesandAFN'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1329:Type 1'), 'Distribution of Emergency Supplies (DES) Team Leader', 'type1', 'Type 1', 'Mass Care Services', '9-509-1329', 'Mass Care Services', 'TheDistributionofEmergencySupplies(DES)TeamLeadermanagesfixedormobileemergencysupplydistributionactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1329:Type 2'), 'Distribution of Emergency Supplies (DES) Team Leader', 'type2', 'Type 2', 'Mass Care Services', '9-509-1329', 'Mass Care Services', 'TheDistributionofEmergencySupplies(DES)TeamLeadermanagesfixedormobileemergencysupplydistributionactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1217:Type 1'), 'Donations Call Center Supervisor', 'type1', 'Type 1', 'Mass Care Services', '9-509-1217', 'Mass Care Services', 'TheDonationsCallCenterSupervisorcoordinatesandmanagesaphonebankorcallcenter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1217:Type 2'), 'Donations Call Center Supervisor', 'type2', 'Type 2', 'Mass Care Services', '9-509-1217', 'Mass Care Services', 'TheDonationsCallCenterSupervisorcoordinatesandmanagesaphonebankorcallcenter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1282:Single Type'), 'Donations Coordination Task Force Leader (NQS)', NULL, 'Single Type', 'Mass Care Services', '9-509-1282', 'Mass Care Services', 'TheDonationsCoordinationTaskForceLeaderhasknowledgeofallaspectsofdonationscoordinationandmanagessolicitedandunsolicitedgoods,funds
andservicesfromtheprivatesectorandthepublic'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1283:Single Type'), 'Donations Specialist (NQS)', NULL, 'Single Type', 'Mass Care Services', '9-509-1283', 'Mass Care Services', 'TheDonationsSpecialisthelpscreateandimplementthevolunteeranddonationsportionoftheoperationsplanandhelpsmanagetheflowofdonatedgoods,
fundsandservices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1218:Type 1'), 'Feeding Services Team Leader', 'type1', 'Type 1', 'Mass Care Services', '9-509-1218', 'Mass Care Services', 'TheFeedingServicesTeamLeaderprovidesmanagement,coordination,andsupervisionoffeedingoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1218:Type 2'), 'Feeding Services Team Leader', 'type2', 'Type 2', 'Mass Care Services', '9-509-1218', 'Mass Care Services', 'TheFeedingServicesTeamLeaderprovidesmanagement,coordination,andsupervisionoffeedingoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1084:Single Type'), 'Field Kitchen Manager', NULL, 'Single Type', 'Mass Care Services', '9-509-1084', 'Mass Care Services', 'TheFieldKitchenManageroverseesallfieldkitchencookingandfeedingprocesses.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1430:Single Type'), 'Human Services Disaster Assessment Team Leader (NQS)', NULL, 'Single Type', 'Mass Care Services', '9-509-1430', 'Mass Care Services', 'TheHumanServicesDisasterAssessmentTeamLeaderleadsateamperformingpost-disasterassessmentstodeterminetheneedsofdisastersurvivors'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1431:Type 1'), 'Human Services Recovery Support Specialist (NQS)', 'type1', 'Type 1', 'Mass Care Services', '9-509-1431', 'Mass Care Services', 'TheHumanServicesRecoverySupportSpecialistassistsemergencymanagementagencieswithclaimsforhumanservicesassistance'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1431:Type 2'), 'Human Services Recovery Support Specialist (NQS)', 'type2', 'Type 2', 'Mass Care Services', '9-509-1431', 'Mass Care Services', 'TheHumanServicesRecoverySupportSpecialistassistsemergencymanagementagencieswithclaimsforhumanservicesassistance'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1330:Single Type'), 'Mass Care Specialist', NULL, 'Single Type', 'Mass Care Services', '9-509-1330', 'Mass Care Services', 'TheMassCareSpecialistperformsawiderangeofdutiesinshelters,kitchens,onmobiledistributionvehicles,atdistributionsites,inwarehouses,andat
othermasscare/emergencyassistance(MC/EA)sites'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1219:Single Type'), 'Mass Evacuee Support Registration and Tracking Specialist', NULL, 'Single Type', 'Mass Care Services', '9-509-1219', 'Mass Care Services', 'TheMassEvacueeSupportRegistrationandTrackingSpecialistprovideson-siteinformationtechnology(IT)support,guidance,andtrainingtopersonnelwho
registerandtrackdisastersurvivorsatamassevacueesupportsite'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1229:Type 1'), 'Mass Evacuee Support Task Force Leader', 'type1', 'Type 1', 'Mass Care Services', '9-509-1229', 'Mass Care Services', 'TheMassEvacueeSupportTaskForceLeaderprovidesdirectsupervisionandguidancetoMassEvacueeSupportSiteTeampersonnelandcoordinates
activitieswithsupportteams,taskforces,andsingleresources'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1229:Type 2'), 'Mass Evacuee Support Task Force Leader', 'type2', 'Type 2', 'Mass Care Services', '9-509-1229', 'Mass Care Services', 'TheMassEvacueeSupportTaskForceLeaderprovidesdirectsupervisionandguidancetoMassEvacueeSupportSiteTeampersonnelandcoordinates
activitieswithsupportteams,taskforces,andsingleresources'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1223:Type 1'), 'Mass Evacuee Support Team Leader', 'type1', 'Type 1', 'Mass Care Services', '9-509-1223', 'Mass Care Services', 'TheMassEvacueeSupportTeamLeaderoverseestheoperationalcoordinationofmassevacueesupportservices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1223:Type 2'), 'Mass Evacuee Support Team Leader', 'type2', 'Type 2', 'Mass Care Services', '9-509-1223', 'Mass Care Services', 'TheMassEvacueeSupportTeamLeaderoverseestheoperationalcoordinationofmassevacueesupportservices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1308:Type 1'), 'Shelter Facilities Support Team Leader (NQS)', 'type1', 'Type 1', 'Mass Care Services', '9-509-1308', 'Mass Care Services', 'TheShelterFacilitiesSupportTeamLeaderprovideslogisticsandmaintenancesupportforashelter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1308:Type 2'), 'Shelter Facilities Support Team Leader (NQS)', 'type2', 'Type 2', 'Mass Care Services', '9-509-1308', 'Mass Care Services', 'TheShelterFacilitiesSupportTeamLeaderprovideslogisticsandmaintenancesupportforashelter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1308:Type 3'), 'Shelter Facilities Support Team Leader (NQS)', 'type3', 'Type 3', 'Mass Care Services', '9-509-1308', 'Mass Care Services', 'TheShelterFacilitiesSupportTeamLeaderprovideslogisticsandmaintenancesupportforashelter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1308:Type 4'), 'Shelter Facilities Support Team Leader (NQS)', 'type4', 'Type 4', 'Mass Care Services', '9-509-1308', 'Mass Care Services', 'TheShelterFacilitiesSupportTeamLeaderprovideslogisticsandmaintenancesupportforashelter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1085:Type 1'), 'Shelter Manager (NQS)', 'type1', 'Type 1', 'Mass Care Services', '9-509-1085', 'Mass Care Services', 'AShelterManagerisresponsibleforprovidingsupervisionandoperationalsupportforshelteroperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1085:Type 2'), 'Shelter Manager (NQS)', 'type2', 'Type 2', 'Mass Care Services', '9-509-1085', 'Mass Care Services', 'AShelterManagerisresponsibleforprovidingsupervisionandoperationalsupportforshelteroperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1085:Type 3'), 'Shelter Manager (NQS)', 'type3', 'Type 3', 'Mass Care Services', '9-509-1085', 'Mass Care Services', 'AShelterManagerisresponsibleforprovidingsupervisionandoperationalsupportforshelteroperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1307:Type 1'), 'Shelter Resident Services Team Leader (NQS)', 'type1', 'Type 1', 'Mass Care Services', '9-509-1307', 'Mass Care Services', 'TheShelterResidentServicesTeamLeaderoverseesshelterstaffandresidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1307:Type 2'), 'Shelter Resident Services Team Leader (NQS)', 'type2', 'Type 2', 'Mass Care Services', '9-509-1307', 'Mass Care Services', 'TheShelterResidentServicesTeamLeaderoverseesshelterstaffandresidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1307:Type 3'), 'Shelter Resident Services Team Leader (NQS)', 'type3', 'Type 3', 'Mass Care Services', '9-509-1307', 'Mass Care Services', 'TheShelterResidentServicesTeamLeaderoverseesshelterstaffandresidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1083:Type 1'), 'State Mass Care Coordinator', 'type1', 'Type 1', 'Mass Care Services', '9-509-1083', 'Mass Care Services', 'TheStateMassCareCoordinatorassistsandcoordinatestheeffortsofmasscareandemergencyassistancepersonnelinthestate.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:9-509-1083:Type 2'), 'State Mass Care Coordinator', 'type2', 'Type 2', 'Mass Care Services', '9-509-1083', 'Mass Care Services', 'TheStateMassCareCoordinatorassistsandcoordinatestheeffortsofmasscareandemergencyassistancepersonnelinthestate.')
ON CONFLICT DO NOTHING;

-- Medical and Public Health (83 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1039:Single Type'), 'Advanced Practice Registered Nurse (APRN)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1039', 'Medical and Public Health', 'Advanced Practice Registered Nurse (APRN)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1039:Single Type'), 'Advanced Practice Registered Nurse (APRN)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1039', 'Medical and Public Health', 'Advanced Practice Registered Nurse (APRN)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1220:Single Type'), 'Behavioral Health Chaplaincy Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1220', 'Medical and Public Health', 'TheBehavioralHealthChaplaincySpecialistprovidesspiritualandemotionalsupporttostaff,emergencyrespondersandthepublicduringtimesofstress'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1221:Type 1'), 'Behavioral Health Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1221', 'Medical and Public Health', 'TheBehavioralHealthSpecialistsupportsdisasterbehavioralhealthinterventions,triage,assessmentandstabilizationorreferralofresponders,disaster
survivorsandaffectedpopulations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1221:Type 2'), 'Behavioral Health Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1221', 'Medical and Public Health', 'TheBehavioralHealthSpecialistsupportsdisasterbehavioralhealthinterventions,triage,assessmentandstabilizationorreferralofresponders,disaster
survivorsandaffectedpopulations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1222:Single Type'), 'Behavioral Health Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1222', 'Medical and Public Health', 'TheBehavioralHealthTeamLeaderleadsanddirectsaBehavioralHealthTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1494:Single Type'), 'Certified Nursing Assistant (CNA)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1494', 'Medical and Public Health', 'TheCertifiedNursingAssistant(CNA)assistsindirectpatientcareanddocumentsandrecordspatientconditionsandtreatment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1043:Single Type'), 'Dental Assistant/Hygienist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1043', 'Medical and Public Health', 'TheDentalAssistant/Hygienistassistsdentistsandoralsurgeonsinmanagingacutedentalproblemsandwithexamsandprocedures'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1044:Single Type'), 'Dentist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1044', 'Medical and Public Health', 'TheDentistpromotesoralhealthandprovidesdiseasepreventionandcomprehensiveoralhealthcare'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1045:Single Type'), 'Dialysis Technician', NULL, 'Single Type', 'Medical and Public Health', '12-509-1045', 'Medical and Public Health', 'TheDialysisTechnicianoperatesandmaintainsdialysismachinesandmonitorspatientsundergoingtreatment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1367:Single Type'), 'Dietitian/Nutritionist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1367', 'Medical and Public Health', 'TheDietitian/Nutritionistprovidesclinicalnutritionrecommendations,nutritioneducation,publichealthnutritionprograms,andmayhelpoverseepreparation
anddistributionofmassfoodservicesfornutritionalcontent'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1048:Type 1'), 'Environmental Health Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1048', 'Medical and Public Health', 'TheEnvironmentalHealthSpecialistprovidesprofessionaltechnicalassistance,consultationandsupportinenvironmentalhealthspecialtyareas'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1048:Type 2'), 'Environmental Health Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1048', 'Medical and Public Health', 'TheEnvironmentalHealthSpecialistprovidesprofessionaltechnicalassistance,consultationandsupportinenvironmentalhealthspecialtyareas'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1049:Single Type'), 'Environmental Health Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1049', 'Medical and Public Health', 'TheEnvironmentalHealthTeamLeadersupervisestheEnvironmentalHealthTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1050:Type 1'), 'Epidemiologist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1050', 'Medical and Public Health', 'TheEpidemiologistperformsepidemiologicalassessmentandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1050:Type 2'), 'Epidemiologist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1050', 'Medical and Public Health', 'TheEpidemiologistperformsepidemiologicalassessmentandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1050:Type 3'), 'Epidemiologist', 'type3', 'Type 3', 'Medical and Public Health', '12-509-1050', 'Medical and Public Health', 'TheEpidemiologistperformsepidemiologicalassessmentandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1050:Type 4'), 'Epidemiologist', 'type4', 'Type 4', 'Medical and Public Health', '12-509-1050', 'Medical and Public Health', 'TheEpidemiologistperformsepidemiologicalassessmentandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1267:Type 1'), 'Fatality Management Autopsy Technician', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1267', 'Medical and Public Health', 'TheFatalityManagement(FM)AutopsyTechnicianassiststheforensicpathologistbefore,duringandafterautopsies'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1267:Type 2'), 'Fatality Management Autopsy Technician', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1267', 'Medical and Public Health', 'TheFatalityManagement(FM)AutopsyTechnicianassiststheforensicpathologistbefore,duringandafterautopsies'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1388:Single Type'), 'Fatality Management Call Taker Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1388', 'Medical and Public Health', 'TheFatalityManagement(FM)CallTakerSpecialistreceivesincomingcallsconcerningmissingpersonsandcompletesthecallcenterpaperworkorsoftware'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1391:Single Type'), 'Fatality Management Dental/Medical Records Acquisition Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1391', 'Medical and Public Health', 'TheFatalityManagement(FM)Dental/MedicalRecordsAcquisitionSpecialistcoordinateswithinterviewanddataentryfunctionstoreceivenoticeofmissing
persons’potentialdentalandmedicalcareproviders'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1259:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Building/Arrangements Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1259', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)Building/ArrangementsSpecialistsupervisestheoverallset-up,operation,and
deactivationoffacilitiesandmaysupportotherfacilitiessuchasaVictimInformationCenter,FamilyAssistanceCenter,MorgueIdentificationCenter,and
FatalityManagementBranchorGroup'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1260:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Communications Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1260', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)CommunicationsCoordinatordevelopsplansfortheeffectiveuseofincident
communicationsequipmentandfacilities,includingcomputernetworkingandinternetaccess'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1261:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Communications Information Technology Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1261', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)CommunicationsInformationTechnology(IT)Specialistensuresallinformation
managementsystemequipmentissetupandfunctioningproperly'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1262:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Communications Programming Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1262', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)CommunicationsProgrammingSpecialistprovidesreportanddataprogramming
changesandmayberequestedtosupportotherdatabases'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1263:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Facilities Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1263', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)FacilitiesSpecialistparticipatesintheoverallset-up,operation,anddeactivationof
facilities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1327:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Leader (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1327', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)LeadercoordinatesDPMUefforts,monitorsDPMUpersonnelandmanagesequipment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1326:Single Type'), 'Fatality Management Disaster Portable Morgue Unit Supply Specialist (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1326', 'Medical and Public Health', 'TheFatalityManagement(FM)DisasterPortableMorgueUnit(DPMU)SupplySpecialistmanagesequipmentandsuppliesfortheincident'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1268:Single Type'), 'Fatality Management DNA Collection Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1268', 'Medical and Public Health', 'TheFatalityManagement(FM)DNACollectionSpecialistoverseestheDNAcollectionfunctionatthetemporarymorgueandservesasleadfortheDNA
station'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1275:Single Type'), 'Fatality Management Embalming and Casketing Mortuary Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1275', 'Medical and Public Health', 'TheFatalityManagement(FM)EmbalmingandCasketingMortuarySpecialistcoordinateswiththeMorgueProcessingUnitLeader,MedicalExaminer,or
Coronertosetupanddetermineembalmingrequirementsandtheappropriatemethodsforembalminghumanremains'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1269:Single Type'), 'Fatality Management Forensic Anthropologist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1269', 'Medical and Public Health', 'TheFatalityManagement(FM)ForensicAnthropologisthelpstoidentifyskeletal,decomposed,orunidentifiedhumanremains,andmayalsoassistin
determiningage,sex,stature,anduniquefeaturesofthedeceased'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1270:Type 1'), 'Fatality Management Forensic Pathologist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1270', 'Medical and Public Health', 'TheFatalityManagement(FM)ForensicPathologistisspeciallytrainedphysicianswhoexaminesthebodiesofpeoplewhohavediedsuddenly,unexpectedly,
orviolentlytodeterminethecauseandthemannerofdeath'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1270:Type 2'), 'Fatality Management Forensic Pathologist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1270', 'Medical and Public Health', 'TheFatalityManagement(FM)ForensicPathologistisspeciallytrainedphysicianswhoexaminesthebodiesofpeoplewhohavediedsuddenly,unexpectedly,
orviolentlytodeterminethecauseandthemannerofdeath'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1277:Type 1'), 'Fatality Management Forensic Photographer', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1277', 'Medical and Public Health', 'TheFatalityManagement(FM)ForensicPhotographerrecordstheinitialappearanceofapotentialcrimesceneandphysicalevidenceinordertoprovidea
permanentrecordoftheevent'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1277:Type 2'), 'Fatality Management Forensic Photographer', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1277', 'Medical and Public Health', 'TheFatalityManagement(FM)ForensicPhotographerrecordstheinitialappearanceofapotentialcrimesceneandphysicalevidenceinordertoprovidea
permanentrecordoftheevent'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1264:Type 1'), 'Fatality Management Human Remains Recovery Collection Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1264', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsRecoveryCollectionSpecialisttagshumanremains,maintainsthechainofcustody,andplacesremainsin
theappropriatetransportationvehicle'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1264:Type 2'), 'Fatality Management Human Remains Recovery Collection Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1264', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsRecoveryCollectionSpecialisttagshumanremains,maintainsthechainofcustody,andplacesremainsin
theappropriatetransportationvehicle'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1265:Type 1'), 'Fatality Management Human Remains Recovery Documentation Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1265', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsRecoveryDocumentationSpecialistoverseesthereportwritingfunctionatthedisastersitedetailing
informationonrecoveredhumanremains'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1265:Type 2'), 'Fatality Management Human Remains Recovery Documentation Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1265', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsRecoveryDocumentationSpecialistoverseesthereportwritingfunctionatthedisastersitedetailing
informationonrecoveredhumanremains'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1322:Single Type'), 'Fatality Management Human Remains Recovery Team Leader (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1322', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsRecoveryTeamLeaderoversees,conductsanddirectsrecoveryeffortsforhumanremainsatthedisaster
site'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1279:Type 1'), 'Fatality Management Human Remains Storage and Release Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1279', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsStorageandReleaseSpecialist isresponsibleforstoring,protecting,andpreservingthehumanremainsfor
subsequentexamination,identification,andreleaseofthedeceasedtothefamily'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1279:Type 2'), 'Fatality Management Human Remains Storage and Release Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1279', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsStorageandReleaseSpecialist isresponsibleforstoring,protecting,andpreservingthehumanremainsfor
subsequentexamination,identification,andreleaseofthedeceasedtothefamily'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1266:Type 1'), 'Fatality Management Human Remains Transportation Staging Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1266', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsTransportationStagingSpecialistdirectsandassistsintheproperdocumentationofhumanremains
transportedfromthedisastersitetothemorguethroughatrackingdatabase'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1266:Type 2'), 'Fatality Management Human Remains Transportation Staging Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1266', 'Medical and Public Health', 'TheFatalityManagement(FM)HumanRemainsTransportationStagingSpecialistdirectsandassistsintheproperdocumentationofhumanremains
transportedfromthedisastersitetothemorguethroughatrackingdatabase'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1395:Single Type'), 'Fatality Management Information Collection Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1395', 'Medical and Public Health', 'TheFatalityManagement(FM)InformationCollectionCoordinator
coordinatesthecallcenterintakeoperatorsandtheinterviewteamcollectingantemortemdataonvictimsreportedmissing'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1389:Single Type'), 'Fatality Management Interview Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1389', 'Medical and Public Health', 'TheFatalityManagement(FM)InterviewSpecialistactsastheprimarycontactbetweentheVictimInformationCenter(VIC),nextofkin(NOK),andfamily
members'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1315:Single Type'), 'Fatality Management Morgue Admitting Specialist (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1315', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueAdmittingSpecialistprocesseshumanremainsenteringthemorgue'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1271:Single Type'), 'Fatality Management Morgue Dental Assistant', NULL, 'Single Type', 'Medical and Public Health', '12-509-1271', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueDentalAssistantensuresthecompletionofallodontologysupportfunctionsforprocessedhumanremains'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1276:Type 1'), 'Fatality Management Morgue Escort', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1276', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueEscortphysicallyaccompaniesandmaintainssecurityandcontroloverasetofhumanremainsfromtheAdmitting
Stationuntilcompletionofmorgueprocessing'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1276:Type 2'), 'Fatality Management Morgue Escort', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1276', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueEscortphysicallyaccompaniesandmaintainssecurityandcontroloverasetofhumanremainsfromtheAdmitting
Stationuntilcompletionofmorgueprocessing'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1272:Single Type'), 'Fatality Management Morgue Fingerprint Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1272', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueFingerprintSpecialistoverseesthepostmortemfingerprintingfunctionatthetemporarymorgueandmayserveaslead
fortheFingerprintStation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1273:Single Type'), 'Fatality Management Morgue Forensic Odontologist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1273', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueForensicOdontologistoverseesthemorgueforensicdentistryfunctionandservesasleadforthestation'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1314:Single Type'), 'Fatality Management Morgue Forensic Team Leader (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1314', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueForensicTeamLeaderinstitutesprocessingproceduresandoverseespersonnelintheFMMorgueForensicTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1313:Single Type'), 'Fatality Management Morgue Processing Unit Leader (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1313', 'Medical and Public Health', 'TheFatalityManagement(FM)MorgueProcessingUnit(MPU)Leaderoverseesprocessingteamsinthemorgueandprovidessecurityforhumanremains
andaccompanyingrecords.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1278:Type 1'), 'Fatality Management Personal Effects Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1278', 'Medical and Public Health', 'TheFatalityManagement(FM)PersonalEffectsSpecialistcoordinateswiththeFMMorgueProcessingUnitLeadertodeterminedocumentation,packaging,
andtransfer-to-storagerequirementsforpersonaleffectsrecoveredfromhumanremainsduringmorgueprocessing'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1278:Type 2'), 'Fatality Management Personal Effects Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1278', 'Medical and Public Health', 'TheFatalityManagement(FM)PersonalEffectsSpecialistcoordinateswiththeFMMorgueProcessingUnitLeadertodeterminedocumentation,packaging,
andtransfer-to-storagerequirementsforpersonaleffectsrecoveredfromhumanremainsduringmorgueprocessing'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1274:Type 1'), 'Fatality Management Radiology Specialist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1274', 'Medical and Public Health', 'TheFatalityManagement(FM)RadiologySpecialistperformsdiagnosticradiographproceduresofvictims,forthepurposesofdocumentationofthesubject'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1274:Type 2'), 'Fatality Management Radiology Specialist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1274', 'Medical and Public Health', 'TheFatalityManagement(FM)RadiologySpecialistperformsdiagnosticradiographproceduresofvictims,forthepurposesofdocumentationofthesubject'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1390:Single Type'), 'Fatality Management Records Management Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1390', 'Medical and Public Health', 'TheFatalityManagement(FM)RecordsManagementSpecialistmanagesthestorageandretrievalofallFMfilesrelatedtoadisaster'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1393:Single Type'), 'Fatality Management Training Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1393', 'Medical and Public Health', 'TheFatalityManagement(FM)TrainingSpecialistmanagesstafftrainingactivitiesintheVictimInformationCenter(VIC)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1394:Single Type'), 'Fatality Management Victim Information Center Data/Records Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1394', 'Medical and Public Health', 'TheFatalityManagement(FM)VictimInformationCenter(VIC)Data/RecordsCoordinatormanagesthecollectionandstorageofantemortemdataonvictims
reportedmissinganditstimelytransferintothedatabase'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1392:Single Type'), 'Fatality Management Victim Information Center Documentation Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1392', 'Medical and Public Health', 'TheFatalityManagement(FM)VictimInformationCenter(VIC)DocumentationSpecialistcreatesandmaintainsallassignedreportingfortheVIC'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1396:Single Type'), 'Fatality Management Victim Information Center Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1396', 'Medical and Public Health', 'TheFatalityManagement(FM)VictimInformationCenter(VIC)TeamLeader
establishestheVICandifactivated,managesacallcenter'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1318:Single Type'), 'Mass Fatality Management Group Supervisor (NQS)', NULL, 'Single Type', 'Medical and Public Health', '12-509-1318', 'Medical and Public Health', 'TheMassFatalityManagementGroupSupervisoroverseesthedisasterportablemorgueandforensicmorgueoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1355:Single Type'), 'Medical Communications/Information Technology Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1355', 'Medical and Public Health', 'TheMedicalCommunications/InformationTechnology(IT)Coordinatorprovidesmedicalteamswithtechnicalsupportforallformsofcommunication
technology'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1361:Single Type'), 'Medical Countermeasure (MCM) Point of Dispensing (POD) Intake/Line Flow Manager', NULL, 'Single Type', 'Medical and Public Health', '12-509-1361', 'Medical and Public Health', 'TheMedicalCountermeasure(MCM)PointofDispensing(POD)Intake/LineFlowManageroverseesclientflowatPODsites'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1362:Single Type'), 'Medical Countermeasure (MCM) Point of Dispensing (POD) Logistics Manager', NULL, 'Single Type', 'Medical and Public Health', '12-509-1362', 'Medical and Public Health', 'TheMedicalCountermeasure(MCM)PointofDispensing(POD)LogisticsManageroverseeslogisticsoperationsatMCMPODsites'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1363:Single Type'), 'Medical Countermeasure (MCM) Point of Dispensing (POD) Management Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1363', 'Medical and Public Health', 'TheMedicalCountermeasure(MCM)PointofDispensing(POD)ManagementTeamLeadermanagesoverallMCMPODsitefunctions'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1356:Single Type'), 'Medical Equipment Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1356', 'Medical and Public Health', 'TheMedicalEquipmentCoordinatoracquiresandmaintainscontrolofappropriatemedicalequipment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1371:Single Type'), 'Medical Laboratory Technician', NULL, 'Single Type', 'Medical and Public Health', '12-509-1371', 'Medical and Public Health', 'TheMedicalLaboratoryTechnicianperformsanalyticaltestingofblood,urine,otherbodyfluids,andothertypesofbiologicalspecimens'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1372:Single Type'), 'Medical Laboratory Technologist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1372', 'Medical and Public Health', 'TheMedicalLaboratoryTechnologistcollectsandprocessespatientbiologicalspecimens'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1357:Single Type'), 'Medical Materials Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1357', 'Medical and Public Health', 'TheMedicalMaterialsCoordinatoridentifiesthemedicalmaterialssupplychain,procuresmaterials,andmaintainsqualitycontrolofmedicalsupplies'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1241:Type 1'), 'Medical Officer', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1241', 'Medical and Public Health', 'TheMedicalOfficerisapractitionerlicensedtodiagnoseandtreatarangeofhealthproblemsandsupervisemedicaldecisionsandprotocols'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1241:Type 2'), 'Medical Officer', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1241', 'Medical and Public Health', 'TheMedicalOfficerisapractitionerlicensedtodiagnoseandtreatarangeofhealthproblemsandsupervisemedicaldecisionsandprotocols'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1241:Type 3'), 'Medical Officer', 'type3', 'Type 3', 'Medical and Public Health', '12-509-1241', 'Medical and Public Health', 'TheMedicalOfficerisapractitionerlicensedtodiagnoseandtreatarangeofhealthproblemsandsupervisemedicaldecisionsandprotocols'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1358:Single Type'), 'Medical Records Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1358', 'Medical and Public Health', 'TheMedicalRecordsCoordinatormanagesanddirectstheoperationsofamedicalrecordsteam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1359:Single Type'), 'Medical Security Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1359', 'Medical and Public Health', 'TheMedicalSecurityCoordinatorisresponsibleformedicalpersonnelsafetyandsecurity,andthereforemonitorsandanticipateshazardousandunsafe
situations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1239:Single Type'), 'Medical Systems Assessment Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1239', 'Medical and Public Health', 'TheMedicalSystemsAssessmentSpecialistprovidesdisasterassessmentofmedicalinfrastructure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1360:Single Type'), 'Medical Team Logistics Coordinator', NULL, 'Single Type', 'Medical and Public Health', '12-509-1360', 'Medical and Public Health', 'TheMedicalTeamLogisticsCoordinatorunpacks,setsup,maintains,breaksdown,andrepackstheHealthcareResourceCoordinationandSupportTeam
cache'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1063:Single Type'), 'Pharmacist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1063', 'Medical and Public Health', 'ThePharmacistpreparesanddispensesdrugsthatphysiciansorotherhealthcareprofessionalsprescribe'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1064:Single Type'), 'Pharmacy Technician', NULL, 'Single Type', 'Medical and Public Health', '12-509-1064', 'Medical and Public Health', 'ThePharmacyTechnicianpreparesmedicationsunderthesupervisionofalicensedpharmacistA'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1065:Single Type'), 'Phlebotomist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1065', 'Medical and Public Health', 'ThePhlebotomistcollectsbloodandprocessesbiologicallaboratoryspecimens'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1068:Single Type'), 'Public Health and Medical Shelter Support Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1068', 'Medical and Public Health', 'ThePublicHealthandMedicalShelterSupportTeamLeadercoordinatesallmedicalandpublichealthactivitiesforcongregateshelters'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1040:Single Type'), 'Public Health and Medical Systems Assessment Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1040', 'Medical and Public Health', 'ThePublicHealthandMedicalSystemsAssessmentTeamLeaderservesastheteamleaderandcoordinatesPublicHealthandMedicalSystems
Assessmentteamactivities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1495:Single Type'), 'Public Health Data Science Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1495', 'Medical and Public Health', 'ThePublicHealthDataScienceSpecialistentersandorganizespublichealthdatainauniformformat'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1496:Single Type'), 'Public Health Interviewer', NULL, 'Single Type', 'Medical and Public Health', '12-509-1496', 'Medical and Public Health', 'ThePublicHealthInterviewercollectspublichealthdatathroughinterviews,contacttracingorcanvasingtodeterminethecausesortrajectoriesofoutbreaks,
diseaseclustersorotherpublichealthdataasdeterminedbytheAuthorityHavingJurisdiction(AHJ)'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1238:Single Type'), 'Public Health Systems Assessment Specialist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1238', 'Medical and Public Health', 'ThePublicHealthSystemsAssessmentSpecialistprovidesdisasterassessmentofpublichealthinfrastructureandpublichealthdisasterservices'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1373:Type 1'), 'Radiologist', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1373', 'Medical and Public Health', 'TheRadiologistsupervisesmedicalimagingstudies'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1373:Type 2'), 'Radiologist', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1373', 'Medical and Public Health', 'TheRadiologistsupervisesmedicalimagingstudies'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1072:Single Type'), 'Radiology Technician', NULL, 'Single Type', 'Medical and Public Health', '12-509-1072', 'Medical and Public Health', 'TheRadiologyTechnicianperformsdiagnosticimagingexamsandadministersradiationtherapytreatment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1073:Single Type'), 'Receiving, Staging, and Storage Distribution Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1073', 'Medical and Public Health', 'TheReceiving,Staging,andStorage(RSS)DistributionTeamLeaderoverseesdistributionactivitiesformedications,medicalsupplies,medical
countermeasures,andmedicalequipment'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1074:Single Type'), 'Receiving, Staging, and Storage Finance/Administration Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1074', 'Medical and Public Health', 'TheReceiving,Staging,andStorage(RSS)Finance/AdministrationTeamLeaderorganizesandmanagestheadministrativesectionoftheRSSsite'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1075:Single Type'), 'Receiving, Staging, and Storage Logistics Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1075', 'Medical and Public Health', 'TheReceiving,Staging,andStorage(RSS)LogisticsTeamLeaderorganizesandmanagesthelogisticssectionoftheRSSsite'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1076:Single Type'), 'Receiving, Staging, and Storage Operations Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1076', 'Medical and Public Health', 'TheReceiving,Staging,andStorage(RSS)OperationsTeamLeaderorganizesanddirectstheRSSsite''soperationssectiontoensureeffectivedistributionof
medications,medicalsupplies,medicalcountermeasures,andmedicalequipmenttoPODsandhealthcarefacilities'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1077:Single Type'), 'Receiving, Staging, and Storage Tactical Communications Team Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1077', 'Medical and Public Health', 'TheReceiving,Staging,andStorage(RSS)TacticalCommunicationsTeamLeaderestablishesandmaintainsinternalandexternalcommunications
technology'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1078:Single Type'), 'Receiving, Staging, and Storage Task Force Leader', NULL, 'Single Type', 'Medical and Public Health', '12-509-1078', 'Medical and Public Health', 'TheReceiving,Staging,andStorage(RSS)TaskForceLeaderisresponsibleforoverallmanagementofaRSSTaskForce'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1079:Type 1'), 'Registered Nurse', 'type1', 'Type 1', 'Medical and Public Health', '12-509-1079', 'Medical and Public Health', 'TheRegisteredNurseisatrainedprofessionalwhocaresforthesickorinfirm'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1079:Type 2'), 'Registered Nurse', 'type2', 'Type 2', 'Medical and Public Health', '12-509-1079', 'Medical and Public Health', 'TheRegisteredNurseisatrainedprofessionalwhocaresforthesickorinfirm'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1079:Type 3'), 'Registered Nurse', 'type3', 'Type 3', 'Medical and Public Health', '12-509-1079', 'Medical and Public Health', 'TheRegisteredNurseisatrainedprofessionalwhocaresforthesickorinfirm'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1080:Single Type'), 'Respiratory Therapist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1080', 'Medical and Public Health', 'TheRespiratoryTherapistprovidesrespiratorycaretopatients'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1081:Single Type'), 'Social Worker', NULL, 'Single Type', 'Medical and Public Health', '12-509-1081', 'Medical and Public Health', 'TheSocialWorkerhelpspeoplesolveandcopewithproblemsduringadisaster,includingprovidingtreatmentforemotionalissues'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:12-509-1082:Single Type'), 'Surgical Technician/Technologist', NULL, 'Single Type', 'Medical and Public Health', '12-509-1082', 'Medical and Public Health', 'TheSurgicalTechnician/Technologistassistssurgeons,anesthesiologists,andotheroperatingroomstaffinthepreparationofpatientsforandduring
operativeprocedures')
ON CONFLICT DO NOTHING;

-- Prevention (3 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:0-509-1210:Type 1'), 'Preventive Radiological Nuclear Detection Screener', 'type1', 'Type 1', 'Prevention', '0-509-1210', 'Prevention', 'ThePreventiveRadiologicalNuclearDetection(PRND)Screenerservesastheprimaryscreenerandoperatesduringsteady-stateorenhancedsteady-state
operations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:0-509-1210:Type 2'), 'Preventive Radiological Nuclear Detection Screener', 'type2', 'Type 2', 'Prevention', '0-509-1210', 'Prevention', 'ThePreventiveRadiologicalNuclearDetection(PRND)Screenerservesastheprimaryscreenerandoperatesduringsteady-stateorenhancedsteady-state
operations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:0-509-1209:Type 1'), 'Preventive Radiological Nuclear Detection Team Leader', 'type1', 'Type 1', 'Prevention', '0-509-1209', 'Prevention', 'ThePreventiveRadiologicalNuclearDetection(PRND)TeamLeaderdirectstheoperationsofaPRNDteam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:0-509-1209:Type 2'), 'Preventive Radiological Nuclear Detection Team Leader', 'type2', 'Type 2', 'Prevention', '0-509-1209', 'Prevention', 'ThePreventiveRadiologicalNuclearDetection(PRND)TeamLeaderdirectstheoperationsofaPRNDteam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:0-509-1208:Type 1'), 'Preventive Radiological Nuclear Detection Team Operator', 'type1', 'Type 1', 'Prevention', '0-509-1208', 'Prevention', 'ThePreventiveRadiologicalNuclearDetection(PRND)TeamOperatoroperatesduringsteadystate,enhancedsteadystate,NationalSpecialSecurityEvent
(NSSE),andcrisissituations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:0-509-1208:Type 2'), 'Preventive Radiological Nuclear Detection Team Operator', 'type2', 'Type 2', 'Prevention', '0-509-1208', 'Prevention', 'ThePreventiveRadiologicalNuclearDetection(PRND)TeamOperatoroperatesduringsteadystate,enhancedsteadystate,NationalSpecialSecurityEvent
(NSSE),andcrisissituations')
ON CONFLICT DO NOTHING;

-- Public Works (24 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1476:Single Type'), 'Architect', NULL, 'Single Type', 'Public Works', '7-509-1476', 'Public Works', 'Anarchitectprovidesdesignservices;oversees,inspects,assesses,andevaluatesimpactedbuildings;andmakesappropriaterecommendations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1094:Single Type'), 'Assistant Public Works Director - Logistics', NULL, 'Single Type', 'Public Works', '7-509-1094', 'Public Works', 'TheAssistantPublicWorksDirector–LogisticsassiststhePublicWorksDirectorwithlogisticalrequirements'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1093:Single Type'), 'Assistant Public Works Director - Operations', NULL, 'Single Type', 'Public Works', '7-509-1093', 'Public Works', 'TheAssistantPublicWorksDirector–OperationsassiststhePublicWorksDirectorwiththeoperationalrequirements'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1095:Single Type'), 'Civil Engineer', NULL, 'Single Type', 'Public Works', '7-509-1095', 'Public Works', 'TheCivilEngineerprovidesgeneralengineeringsupport.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1347:Single Type'), 'Debris Operations Manager', NULL, 'Single Type', 'Public Works', '7-509-1347', 'Public Works', 'TheDebrisOperationsManageroverseesdebrisoperations.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1348:Single Type'), 'Debris Planning Manager', NULL, 'Single Type', 'Public Works', '7-509-1348', 'Public Works', 'TheDebrisPlanningManagerestablishesthedebrismanagementplanfordebrisremoval.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1098:Single Type'), 'Debris Supervisor', NULL, 'Single Type', 'Public Works', '7-509-1098', 'Public Works', 'TheDebrisSupervisoroverseesdebrisremovalandmanages/coordinatesdebrismonitoringactivitiesrelatedtoanincident,includingthedeploymentof
resources.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1460:Single Type'), 'Debris Technical Specialist', NULL, 'Single Type', 'Public Works', '7-509-1460', 'Public Works', 'TheDebrisTechnicalSpecialistevaluatesandestimatestypesandquantitiesofdisaster-generateddebris.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1099:Single Type'), 'Engineering Manager', NULL, 'Single Type', 'Public Works', '7-509-1099', 'Public Works', 'TheEngineeringManagerdirects,coordinatesandmanagestheresponseandrecoveryeffortsofengineering,facilitiesandpublicworksservices.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1416:Single Type'), 'Environmental Compliance Specialist – Water Sector Infrastructure', NULL, 'Single Type', 'Public Works', '7-509-1416', 'Public Works', 'TheEnvironmentalComplianceSpecialist–WaterSectorInfrastructureprovidesenvironmentalcompliancesupportbyapplyingknowledgeofvariouswater
andwastewaterprinciples,practicesandregulationsto:
1.Conductinspections
2.Monitoractivities,plansandsitesforcompliance
3.Compilevariousdataandinformationundermultipletypesofregulatoryframeworks'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1101:Single Type'), 'Equipment Operator', NULL, 'Single Type', 'Public Works', '7-509-1101', 'Public Works', 'TheEquipmentOperatorperformsphysicalactivitiesinvolvedintheoperationoftrucks,vehiclesandequipmentforrecoveryandresponseactivities,and
performsrelatedmanuallaborandgroundwork,asnecessary.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1418:Single Type'), 'Generator Support Team Leader - Water Sector Infrastructure', NULL, 'Single Type', 'Public Works', '7-509-1418', 'Public Works', 'TheGeneratorSupportTeamLeader–WaterSectorInfrastructureoverseesthefieldteamsresponsibleforassessing,deploying,rotating,operating,fueling
andmaintainingemergencypowergenerators'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1417:Single Type'), 'Hydraulic Modeler', NULL, 'Single Type', 'Public Works', '7-509-1417', 'Public Works', 'TheHydraulicModelerplansandmodelswatersystems,wastewatersystemsandprojectsrelatedtostormwater,groundwaterandrecycledwater'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1419:Type 1'), 'Laboratory Technician Specialist - Water/Wastewater', 'type1', 'Type 1', 'Public Works', '7-509-1419', 'Public Works', 'TheLaboratoryTechnicianSpecialist–Water/Wastewaterperformswaterandwastewatersampling,testingandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1419:Type 2'), 'Laboratory Technician Specialist - Water/Wastewater', 'type2', 'Type 2', 'Public Works', '7-509-1419', 'Public Works', 'TheLaboratoryTechnicianSpecialist–Water/Wastewaterperformswaterandwastewatersampling,testingandanalysis'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1461:Single Type'), 'Mechanic', NULL, 'Single Type', 'Public Works', '7-509-1461', 'Public Works', 'TheMechanicperformspreventivemaintenanceandrepairoperationsonvariousvehiclesandequipment.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1453:Type 1'), 'Pipeline Inspector', 'type1', 'Type 1', 'Public Works', '7-509-1453', 'Public Works', 'ThePipelineInspectorperformspipelinesafetycomplianceinspections,evaluatespipelineoperators,andinvestigatespipelinefailurestoincreasethesecurity
ofpipelineinfrastructure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1453:Type 2'), 'Pipeline Inspector', 'type2', 'Type 2', 'Public Works', '7-509-1453', 'Public Works', 'ThePipelineInspectorperformspipelinesafetycomplianceinspections,evaluatespipelineoperators,andinvestigatespipelinefailurestoincreasethesecurity
ofpipelineinfrastructure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1453:Type 3'), 'Pipeline Inspector', 'type3', 'Type 3', 'Public Works', '7-509-1453', 'Public Works', 'ThePipelineInspectorperformspipelinesafetycomplianceinspections,evaluatespipelineoperators,andinvestigatespipelinefailurestoincreasethesecurity
ofpipelineinfrastructure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1103:Single Type'), 'Public Works Director', NULL, 'Single Type', 'Public Works', '7-509-1103', 'Public Works', 'ThePublicWorksDirectorservesasanadvisoronthepreservationandrestorationofpublicworksservicesduringemergencyresponseandrecovery
operations.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1462:Single Type'), 'Public Works Safety Specialist', NULL, 'Single Type', 'Public Works', '7-509-1462', 'Public Works', 'ThePublicWorksSafetySpecialistmonitorspublicworksoperationsandprovidessafetyguidance,proceduralguidanceandrelatedoversightduringincident
responseandrecoveryoperations.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1463:Single Type'), 'Public Works Supervisor', NULL, 'Single Type', 'Public Works', '7-509-1463', 'Public Works', 'ThePublicWorksSupervisorleadsagroupofEquipmentOperatorsorsimilarfieldoroperationsstaff.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1106:Single Type'), 'Public Works Systems Manager', NULL, 'Single Type', 'Public Works', '7-509-1106', 'Public Works', 'ThePublicWorksSystemsManagerdirects,coordinatesandmanagestherestorationandoperationofvarioustypesofcontrolsystems.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1235:Single Type'), 'Public Works Systems Technician', NULL, 'Single Type', 'Public Works', '7-509-1235', 'Public Works', 'ThePublicWorksSystemsTechnicianoperates,maintainsandtroubleshootsvarioustypesofcontrolsystems.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1377:Single Type'), 'Public Works Team Leader', NULL, 'Single Type', 'Public Works', '7-509-1377', 'Public Works', 'ThePublicWorksTeamLeaderleadsaPublicWorksSupportTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1105:Single Type'), 'Structural Engineer', NULL, 'Single Type', 'Public Works', '7-509-1105', 'Public Works', 'TheStructuralEngineeroversees,inspectsandassessesimpactedstructuresintheaftermathofanincidentandmakesappropriaterecommendations.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:7-509-1420:Single Type'), 'Utility Worker Specialist - Water Sector Infrastructure', NULL, 'Single Type', 'Public Works', '7-509-1420', 'Public Works', 'TheUtilityWorkerSpecialist–WaterSectorInfrastructuresupportstherepair,restorationandoperationofwater/wastewaterinfrastructuresystemsand
facilities')
ON CONFLICT DO NOTHING;

-- Recovery (2 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:16-509-1474:Single Type'), 'Public Assistance Program Delivery Manager', NULL, 'Single Type', 'Recovery', '16-509-1474', 'Recovery', 'ThePublicAssistance(PA)ProgramDeliveryManagerfacilitatesthePAapplicationprocess,managesinformationcollection,andprovidescustomerservice
toPAgrantrecipients,applicants,pass-throughentities,andsubrecipients—stakeholderscollectivelycalled"applicants".'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:16-509-1473:Single Type'), 'Public Assistance Site Inspector', NULL, 'Single Type', 'Recovery', '16-509-1473', 'Recovery', 'ThePublicAssistance(PA)SiteInspectorassessesanddocumentsdamageincollaborationwithPAgrantrecipients,applicants,pass-throughentities,or
subrecipients—stakeholderscollectivelycalled“applicants”.')
ON CONFLICT DO NOTHING;

-- Screening, Search, and Detection (1 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:17-509-1415:Type 1'), 'Radiological Operations Support Specialist', 'type1', 'Type 1', 'Screening, Search, and Detection', '17-509-1415', 'Screening, Search, and Detection', 'TheRadiologicalOperationsSupportSpecialist(ROSS):
1.Providessubject-matterexpertiseandguidanceonquestionsaboutradiation,theenvironment,hazardmodeling,dataandriskmanagement,public
protectiveactionsandotherscientificandtechnicalissuestoincidentresponseleadersatanylevel
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Isabletoclearlyexplaintheimplicationsofmodeling,measurementandanalysismethods,aswel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:17-509-1415:Type 2'), 'Radiological Operations Support Specialist', 'type2', 'Type 2', 'Screening, Search, and Detection', '17-509-1415', 'Screening, Search, and Detection', 'TheRadiologicalOperationsSupportSpecialist(ROSS):
1.Providessubject-matterexpertiseandguidanceonquestionsaboutradiation,theenvironment,hazardmodeling,dataandriskmanagement,public
protectiveactionsandotherscientificandtechnicalissuestoincidentresponseleadersatanylevel
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Isabletoclearlyexplaintheimplicationsofmodeling,measurementandanalysismethods,aswel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:17-509-1415:Type 3'), 'Radiological Operations Support Specialist', 'type3', 'Type 3', 'Screening, Search, and Detection', '17-509-1415', 'Screening, Search, and Detection', 'TheRadiologicalOperationsSupportSpecialist(ROSS):
1.Providessubject-matterexpertiseandguidanceonquestionsaboutradiation,theenvironment,hazardmodeling,dataandriskmanagement,public
protectiveactionsandotherscientificandtechnicalissuestoincidentresponseleadersatanylevel
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Isabletoclearlyexplaintheimplicationsofmodeling,measurementandanalysismethods,aswel'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:17-509-1415:Type 4'), 'Radiological Operations Support Specialist', 'type4', 'Type 4', 'Screening, Search, and Detection', '17-509-1415', 'Screening, Search, and Detection', 'TheRadiologicalOperationsSupportSpecialist(ROSS):
1.Providessubject-matterexpertiseandguidanceonquestionsaboutradiation,theenvironment,hazardmodeling,dataandriskmanagement,public
protectiveactionsandotherscientificandtechnicalissuestoincidentresponseleadersatanylevel
2.Gathers,organizes,synthesizes,documentsanddistributesincidentandresourceinformationtoimprovesituationalawarenessatalllevelsofincident
management
3.Isabletoclearlyexplaintheimplicationsofmodeling,measurementandanalysismethods,aswel')
ON CONFLICT DO NOTHING;

-- Search and Rescue (38 positions)
INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1256:Single Type'), 'Boat Crew Member (Search and Rescue)', NULL, 'Single Type', 'Search and Rescue', '8-509-1256', 'Search and Rescue', 'TheBoatCrewMember(SearchandRescue)respondstomaritimesearchandrescue(SAR)missionsandisresponsibleforthesafetyofcrewand
passengers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1255:Single Type'), 'Boat Operator (Search and Rescue)', NULL, 'Single Type', 'Search and Rescue', '8-509-1255', 'Search and Rescue', 'TheBoatOperator(SearchandRescue[SAR])respondstowater-basedSARmissionsandisresponsibleforthesafetyofcrewandpassengers.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1175:Type 1'), 'Canine Search Specialist - Disaster/Structural Collapse Human Remains', 'type1', 'Type 1', 'Search and Rescue', '8-509-1175', 'Search and Rescue', 'TheCanineSearchSpecialist-Disaster/StructuralCollapseHumanRemainshandlesonecaninethatistrainedtosearchforanddetecthumanremainsinina
collapsedstructure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1175:Type 2'), 'Canine Search Specialist - Disaster/Structural Collapse Human Remains', 'type2', 'Type 2', 'Search and Rescue', '8-509-1175', 'Search and Rescue', 'TheCanineSearchSpecialist-Disaster/StructuralCollapseHumanRemainshandlesonecaninethatistrainedtosearchforanddetecthumanremainsinina
collapsedstructure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1176:Type 1'), 'Canine Search Specialist - Disaster/Structural Collapse Live', 'type1', 'Type 1', 'Search and Rescue', '8-509-1176', 'Search and Rescue', 'TheCanineSearchSpecialist-Disaster/StructuralCollapseLivehandlesonecaninethatistrainedtosearchforanddetectlivehumansinacollapsed
structure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1176:Type 2'), 'Canine Search Specialist - Disaster/Structural Collapse Live', 'type2', 'Type 2', 'Search and Rescue', '8-509-1176', 'Search and Rescue', 'TheCanineSearchSpecialist-Disaster/StructuralCollapseLivehandlesonecaninethatistrainedtosearchforanddetectlivehumansinacollapsed
structure'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1177:Single Type'), 'Canine Search Specialist - Land Human Remains', NULL, 'Single Type', 'Search and Rescue', '8-509-1177', 'Search and Rescue', 'TheCanineSearchSpecialist-LandHumanRemainshandlesonecaninethatistrainedtosearchforanddetecthumanremainsoutsideoftheurbancollapse
structureenvironment,indebrisfieldsandinareasofvariedterrainwithlimitedstructures'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1178:Single Type'), 'Canine Search Specialist - Land Live', NULL, 'Single Type', 'Search and Rescue', '8-509-1178', 'Search and Rescue', 'TheCanineSearchSpecialist-LandLivehandlesonecaninethatistrainedtosearchforanddetectlivehumansoutsideoftheurbancollapsestructure
environment,indebrisfieldsandinareasofvariedterrainwithlimitedstructures'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1179:Type 1'), 'Canine Search Specialist - Water Human Remains', 'type1', 'Type 1', 'Search and Rescue', '8-509-1179', 'Search and Rescue', 'TheCanineSearchSpecialist-WaterHumanRemainshandlesonecaninethatistrainedtosearchforanddetecthumanremainsinandalongbodiesof
stillwaterandswiftwater/flood'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1179:Type 2'), 'Canine Search Specialist - Water Human Remains', 'type2', 'Type 2', 'Search and Rescue', '8-509-1179', 'Search and Rescue', 'TheCanineSearchSpecialist-WaterHumanRemainshandlesonecaninethatistrainedtosearchforanddetecthumanremainsinandalongbodiesof
stillwaterandswiftwater/flood'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1397:Type 1'), 'Cave Search and Rescue (SAR) Team Leader', 'type1', 'Type 1', 'Search and Rescue', '8-509-1397', 'Search and Rescue', 'TheCaveSearchandRescue(SAR)TeamLeaderleadsCaveSARteamsperformingsearch,rescueandrecoveryinnaturallyformedcaveenvironments,
includingbothhorizontalandverticalcaves'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1397:Type 2'), 'Cave Search and Rescue (SAR) Team Leader', 'type2', 'Type 2', 'Search and Rescue', '8-509-1397', 'Search and Rescue', 'TheCaveSearchandRescue(SAR)TeamLeaderleadsCaveSARteamsperformingsearch,rescueandrecoveryinnaturallyformedcaveenvironments,
includingbothhorizontalandverticalcaves'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1181:Type 1'), 'Cave Search and Rescue (SAR) Technician', 'type1', 'Type 1', 'Search and Rescue', '8-509-1181', 'Search and Rescue', 'TheCaveSearchandRescue(SAR)Technicianperformssearch,rescueandrecoveryincavesfeaturingprimarilyhorizontalcavepassage,butmayinclude
slopesorverticalsegments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1181:Type 2'), 'Cave Search and Rescue (SAR) Technician', 'type2', 'Type 2', 'Search and Rescue', '8-509-1181', 'Search and Rescue', 'TheCaveSearchandRescue(SAR)Technicianperformssearch,rescueandrecoveryincavesfeaturingprimarilyhorizontalcavepassage,butmayinclude
slopesorverticalsegments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1181:Type 3'), 'Cave Search and Rescue (SAR) Technician', 'type3', 'Type 3', 'Search and Rescue', '8-509-1181', 'Search and Rescue', 'TheCaveSearchandRescue(SAR)Technicianperformssearch,rescueandrecoveryincavesfeaturingprimarilyhorizontalcavepassage,butmayinclude
slopesorverticalsegments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1130:Single Type'), 'Emergency Services Rescue Manager', NULL, 'Single Type', 'Search and Rescue', '8-509-1130', 'Search and Rescue', 'TheEmergencyServicesRescueManagerleadsandsupervisesteammembers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1131:Single Type'), 'Emergency Services Rescue Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1131', 'Search and Rescue', 'TheEmergencyServicesRescueTechnicianrespondstotechnicalsearchandrescue(SAR)incidents,identifieshazards,usesequipmentandapplies
advancedSARtechniques'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1170:Single Type'), 'Helicopter Search and Rescue (SAR) Crew Chief', NULL, 'Single Type', 'Search and Rescue', '8-509-1170', 'Search and Rescue', 'TheHelicopterSearchandRescue(SAR)CrewChiefconductsairSAR,recovery,andevacuationoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1171:Single Type'), 'Helicopter Search and Rescue (SAR) Pilot', NULL, 'Single Type', 'Search and Rescue', '8-509-1171', 'Search and Rescue', 'TheHelicopterSearchandRescue(SAR)PilotisresponsibleforaircraftoperationsandprovidesairSARusinghelicopterstolocatelost,stranded,or
abandonedindividuals'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1172:Single Type'), 'Helicopter Search and Rescue (SAR) Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1172', 'Search and Rescue', 'TheHelicopterSearchandRescue(SAR)TechnicianconductsairSAR,recovery,andevacuationoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1191:Single Type'), 'Land Search and Rescue (SAR) Strike Team/Task Force Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1191', 'Search and Rescue', 'TheLandSearchandRescue(SAR)StrikeTeam/TaskForceLeaderprovidesgeneralleadershipanddirectsupervisionwithinaLandSARTaskForce'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1192:Type 1'), 'Land Search and Rescue (SAR) Team Leader', 'type1', 'Type 1', 'Search and Rescue', '8-509-1192', 'Search and Rescue', 'TheLandSearchandRescue(SAR)TeamLeaderprovidesgeneralleadership,directsupervision,wellness,andsafetyoftheteammembers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1192:Type 2'), 'Land Search and Rescue (SAR) Team Leader', 'type2', 'Type 2', 'Search and Rescue', '8-509-1192', 'Search and Rescue', 'TheLandSearchandRescue(SAR)TeamLeaderprovidesgeneralleadership,directsupervision,wellness,andsafetyoftheteammembers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1193:Type 1'), 'Land Search and Rescue (SAR) Technician', 'type1', 'Type 1', 'Search and Rescue', '8-509-1193', 'Search and Rescue', 'TheLandSearchandRescue(SAR)Technicianperformslandsearch,rescue,andrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1193:Type 2'), 'Land Search and Rescue (SAR) Technician', 'type2', 'Type 2', 'Search and Rescue', '8-509-1193', 'Search and Rescue', 'TheLandSearchandRescue(SAR)Technicianperformslandsearch,rescue,andrecovery'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1132:Single Type'), 'Logistics Search and/or Rescue Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1132', 'Search and Rescue', 'TheLogisticsSearchand/orRescue(SAR)TechnicianisresponsibleforsupportingthelogisticalneedsofaSARTeam'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1133:Single Type'), 'Medical Search and/or Rescue Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1133', 'Search and Rescue', 'TheMedicalSearchand/orRescueTechnicianprovidesSAR-specificmedicalcapabilitiesforteammembersandrescuesduringSAR-relatedoperations'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1243:Single Type'), 'Mine Search and Rescue (SAR) Strike Team/Task Force Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1243', 'Search and Rescue', 'TheMineSearchandRescue(SAR)StrikeTeam/TaskForceLeaderprovidesgeneralleadership,directsupervision,wellness,andsafetyoftheteam,team
members,andothersingleresources O'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1182:Type 1'), 'Mine Search and Rescue (SAR) Team Leader', 'type1', 'Type 1', 'Search and Rescue', '8-509-1182', 'Search and Rescue', 'TheMineSearchandRescue(SAR)TeamLeaderleadsa MineSARteamperformingsearch,rescue,andrecoveryinvariousmineenvironments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1182:Type 2'), 'Mine Search and Rescue (SAR) Team Leader', 'type2', 'Type 2', 'Search and Rescue', '8-509-1182', 'Search and Rescue', 'TheMineSearchandRescue(SAR)TeamLeaderleadsa MineSARteamperformingsearch,rescue,andrecoveryinvariousmineenvironments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1183:Type 1'), 'Mine Search and Rescue (SAR) Technician', 'type1', 'Type 1', 'Search and Rescue', '8-509-1183', 'Search and Rescue', 'TheMineSearchandRescue(SAR)Technicianperformssearch,rescue,andrecoveryinvariousmineenvironments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1183:Type 2'), 'Mine Search and Rescue (SAR) Technician', 'type2', 'Type 2', 'Search and Rescue', '8-509-1183', 'Search and Rescue', 'TheMineSearchandRescue(SAR)Technicianperformssearch,rescue,andrecoveryinvariousmineenvironments'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1194:Single Type'), 'Mountain Search and Rescue (SAR) Strike Team/Task Force Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1194', 'Search and Rescue', 'TheMountainSearchandRescue(SAR) StrikeTeam/TaskForceLeaderprovidesgeneralleadership,directsupervision,wellness,andsafetyoftheStrike
Team/TaskForcemembersandothersingleresources'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1195:Type 1'), 'Mountain Search and Rescue (SAR) Team Leader', 'type1', 'Type 1', 'Search and Rescue', '8-509-1195', 'Search and Rescue', 'TheMountainSearchandRescue(SAR)TeamLeaderdirectlysupervisesaMountainSARTeamandprovidesgeneralleadership,directsupervision,
wellness,andsafetyoftheteammembers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1195:Type 2'), 'Mountain Search and Rescue (SAR) Team Leader', 'type2', 'Type 2', 'Search and Rescue', '8-509-1195', 'Search and Rescue', 'TheMountainSearchandRescue(SAR)TeamLeaderdirectlysupervisesaMountainSARTeamandprovidesgeneralleadership,directsupervision,
wellness,andsafetyoftheteammembers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1195:Type 3'), 'Mountain Search and Rescue (SAR) Team Leader', 'type3', 'Type 3', 'Search and Rescue', '8-509-1195', 'Search and Rescue', 'TheMountainSearchandRescue(SAR)TeamLeaderdirectlysupervisesaMountainSARTeamandprovidesgeneralleadership,directsupervision,
wellness,andsafetyoftheteammembers'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1196:Type 1'), 'Mountain Search and Rescue (SAR) Technician', 'type1', 'Type 1', 'Search and Rescue', '8-509-1196', 'Search and Rescue', 'TheMountainSearchandRescue(SAR)Technicianperformssearch,rescue,andrecoveryeffortsinmountainousterrain'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1196:Type 2'), 'Mountain Search and Rescue (SAR) Technician', 'type2', 'Type 2', 'Search and Rescue', '8-509-1196', 'Search and Rescue', 'TheMountainSearchandRescue(SAR)Technicianperformssearch,rescue,andrecoveryeffortsinmountainousterrain'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1196:Type 3'), 'Mountain Search and Rescue (SAR) Technician', 'type3', 'Type 3', 'Search and Rescue', '8-509-1196', 'Search and Rescue', 'TheMountainSearchandRescue(SAR)Technicianperformssearch,rescue,andrecoveryeffortsinmountainousterrain'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1459:Single Type'), 'Stillwater/Flood Search and Rescue Team Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1459', 'Search and Rescue', 'TheStillwater/FloodSearchandRescue(SAR)TeamLeaderprovidesdirectsupervisionoftheStillwater/FloodSARTeam.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1458:Single Type'), 'Stillwater/Flood Search and Rescue Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1458', 'Search and Rescue', 'TheStillwater/FloodSearchandRescue(SAR)Technicianperformssearch,rescueandrecoveryoperationsinvariouswaterenvironments.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1166:Single Type'), 'Structural Collapse  Rescue Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1166', 'Search and Rescue', 'TheStructuralCollapseRescueTechnicianconductsrescueoperationsincollapsedstructuresanddebrisfieldsresultingfromnaturalorhumancauses.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1164:Type 1'), 'Structural Collapse - Search Technician', 'type1', 'Type 1', 'Search and Rescue', '8-509-1164', 'Search and Rescue', 'TheStructuralCollapseSearchTechnicianperformssearchinstructuralcollapseincidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1164:Type 2'), 'Structural Collapse - Search Technician', 'type2', 'Type 2', 'Search and Rescue', '8-509-1164', 'Search and Rescue', 'TheStructuralCollapseSearchTechnicianperformssearchinstructuralcollapseincidents'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1167:Single Type'), 'Structural Collapse Rescue Team Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1167', 'Search and Rescue', 'TheStructuralCollapseRescueTeamLeaderconductsrescueoperationsincollapsedstructuresanddebrisfieldsresultingfromnaturalorhumancausesand
providesgeneralteamleadershipandsupervision.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1165:Single Type'), 'Structural Collapse Search Team Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1165', 'Search and Rescue', 'TheStructuralCollapseSearchTeamLeaderconductssearchoperationsincollapsedstructuresanddebrisfieldsresultingfromnaturalorhumancausesand
providesgeneralteamleadershipandsupervision.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1184:Single Type'), 'Swiftwater/Flood Search and Rescue Team Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1184', 'Search and Rescue', 'TheSwiftwater/FloodSearchandRescue(SAR)TeamLeaderprovidesdirectsupervisionoftheSwiftwater/FloodSARTeam.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1236:Single Type'), 'Swiftwater/Flood Search and Rescue Technician', NULL, 'Single Type', 'Search and Rescue', '8-509-1236', 'Search and Rescue', 'TheSwiftwater/FloodSearchandRescue(SAR)Technicianperformssearch,rescueandrecoveryoperationsinvariouswaterenvironments.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1186:Single Type'), 'Swiftwater/Flood Search and Rescue Technician - Boat Bowman', NULL, 'Single Type', 'Search and Rescue', '8-509-1186', 'Search and Rescue', 'TheSwiftwater/FloodSearchandRescue(SAR)Technician–BoatBowmanperformssearch,rescueandrecoveryoperationsinvariouswaterenvironments.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1187:Single Type'), 'Swiftwater/Flood Search and Rescue Technician - Boat Operator', NULL, 'Single Type', 'Search and Rescue', '8-509-1187', 'Search and Rescue', 'TheSwiftwater/FloodSearchandRescue(SAR)Technician–BoatOperatoroperatestheboat,providesdirectiontotheSwiftwater/FloodSARTechnician–
BoatBowmanandisultimatelyresponsibleforallaspectsofboatoperations.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1168:Single Type'), 'Urban Search and Rescue (US&R) Task Force Leader', NULL, 'Single Type', 'Search and Rescue', '8-509-1168', 'Search and Rescue', 'TheUrbanSearchandRescue(US&R)TaskForceLeaderprovidesgeneralleadership,directsupervision,wellnessandsafetytotaskforcemembers.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1471:Single Type'), 'Urban Search and Rescue Logistics Specialist', NULL, 'Single Type', 'Search and Rescue', '8-509-1471', 'Search and Rescue', 'TheUrbanSearchandRescue(US&R)LogisticsSpecialistisresponsibleforsupportingthelogisticalneedsofsearchandrescue(SAR)teams,including
StructuralCollapseSearchTeamsandStructuralCollapseRescueTeams.'),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'pos:8-509-1472:Single Type'), 'Urban Search and Rescue Medical Specialist', NULL, 'Single Type', 'Search and Rescue', '8-509-1472', 'Search and Rescue', 'TheUrbanSearchandRescue(US&R)MedicalSpecialistprovidessearchandrescue(SAR)-specificmedicalcareforteammembersandthoserescued
duringSAR-relatedoperations.')
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════
-- 4. Affinities (37 across 3 categories)
-- ══════════════════════════════════════════════════════════

-- 4.1 Hazard Types (13)
INSERT INTO affinities (id, category, value, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:hurricane'), 'hazard_type', 'Hurricane', 'Tropical cyclone response and recovery', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:tornado'), 'hazard_type', 'Tornado', 'Tornado response and recovery', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:flood'), 'hazard_type', 'Flood', 'Riverine and flash flood response', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:earthquake'), 'hazard_type', 'Earthquake', 'Seismic event response and recovery', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:wildfire'), 'hazard_type', 'Wildfire', 'Wildland and wildland-urban interface fire', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:hazmat_release'), 'hazard_type', 'HazMat Release', 'Hazardous materials release or spill', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:structural_collapse'), 'hazard_type', 'Structural Collapse', 'Building or infrastructure collapse', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:mass_casualty'), 'hazard_type', 'Mass Casualty', 'Mass casualty incident response', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:pandemic'), 'hazard_type', 'Pandemic', 'Pandemic and public health emergency', 9),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:radiological'), 'hazard_type', 'Radiological', 'Radiological or nuclear incident', 10),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:terrorism'), 'hazard_type', 'Terrorism', 'Terrorism and active threat response', 11),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:cyber'), 'hazard_type', 'Cyber', 'Cyber incident and critical infrastructure disruption', 12),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:hazard_type:dam_levee_failure'), 'hazard_type', 'Dam/Levee Failure', 'Dam or levee failure and downstream flooding', 13)
ON CONFLICT (category, value) DO NOTHING;

-- 4.2 Functional Specialties (15)
INSERT INTO affinities (id, category, value, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:incident_command'), 'functional_specialty', 'Incident Command', 'ICS command and general staff functions', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:operations'), 'functional_specialty', 'Operations', 'Tactical operations and field response', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:planning'), 'functional_specialty', 'Planning', 'Situation analysis, resource tracking, and IAP development', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:logistics'), 'functional_specialty', 'Logistics', 'Supply chain, facilities, and service support', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:finance_admin'), 'functional_specialty', 'Finance/Admin', 'Cost tracking, procurement, and administrative functions', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:emergency_communications'), 'functional_specialty', 'Emergency Communications', 'Interoperable communications and information systems', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:damage_assessment'), 'functional_specialty', 'Damage Assessment', 'Preliminary and detailed damage assessment', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:mass_care'), 'functional_specialty', 'Mass Care', 'Sheltering, feeding, and emergency assistance', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:evacuation'), 'functional_specialty', 'Evacuation', 'Population evacuation planning and execution', 9),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:search_rescue'), 'functional_specialty', 'Search & Rescue', 'All-hazard search and rescue operations', 10),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:law_enforcement'), 'functional_specialty', 'Law Enforcement', 'Security, access control, and law enforcement operations', 11),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:fire_suppression'), 'functional_specialty', 'Fire Suppression', 'Structural and wildland fire suppression', 12),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:ems'), 'functional_specialty', 'EMS', 'Emergency medical services and pre-hospital care', 13),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:public_health'), 'functional_specialty', 'Public Health', 'Public health surveillance, epidemiology, and medical countermeasures', 14),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:functional_specialty:environmental_response'), 'functional_specialty', 'Environmental Response', 'Environmental hazard mitigation and remediation', 15)
ON CONFLICT (category, value) DO NOTHING;

-- 4.3 Sector Experience (9)
INSERT INTO affinities (id, category, value, description, sort_order) VALUES
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:federal'), 'sector_experience', 'Federal', 'Federal government agencies (FEMA, DHS, DOD, etc.)', 1),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:state'), 'sector_experience', 'State', 'State-level emergency management and response agencies', 2),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:county'), 'sector_experience', 'County', 'County-level government and emergency services', 3),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:municipal'), 'sector_experience', 'Municipal', 'City and municipal government services', 4),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:tribal'), 'sector_experience', 'Tribal', 'Tribal nation emergency management', 5),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:private_sector'), 'sector_experience', 'Private Sector', 'Private sector disaster response and business continuity', 6),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:ngo_voluntary'), 'sector_experience', 'NGO/Voluntary', 'Non-governmental and voluntary organizations (Red Cross, NVOAD, etc.)', 7),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:military'), 'sector_experience', 'Military', 'Military DSCA, National Guard, and defense support to civil authorities', 8),
  (uuid_generate_v5('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'affinity:sector_experience:international'), 'sector_experience', 'International', 'International disaster response and humanitarian assistance', 9)
ON CONFLICT (category, value) DO NOTHING;

