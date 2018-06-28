/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
	    available to all master scripts
|
| Notes   : createRefLicProf - override to default the state if one is not provided
|
|         : createRefContactsFromCapContactsAndLink - testing new ability to link public users to new ref contacts
/------------------------------------------------------------------------------------------------------*/

function returnAnythingiii(dxID1)
{logDebug("in returnAnything");
//myResult = aa.cap.getCapID(dxID1,dxID2,dxID3);
logDebug("can we get myresult: " + dxID1);
return  4;}

function createRefLicProf(rlpId,rlpType,pContactType)
	{
	//Creates/updates a reference licensed prof from a Contact
	//06SSP-00074, modified for 06SSP-00238
	var updating = false;
	var capContResult = aa.people.getCapContactByCapID(capId);
	if (capContResult.getSuccess())
		{ conArr = capContResult.getOutput();  }
	else
		{
		logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
		return false;
		}

	if (!conArr.length)
		{
		logDebug ("**WARNING: No contact available");
		return false;
		}


	var newLic = getRefLicenseProf(rlpId)

	if (newLic)
		{
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
		}
	else
		var newLic = aa.licenseScript.createLicenseScriptModel();

	//get contact record
	if (pContactType==null)
		var cont = conArr[0]; //if no contact type specified, use first contact
	else
		{
		var contFound = false;
		for (yy in conArr)
			{
			if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
				{
				cont = conArr[yy];
				contFound = true;
				break;
				}
			}
		if (!contFound)
			{
			logDebug ("**WARNING: No Contact found of type: "+pContactType);
			return false;
			}
		}

	peop = cont.getPeople();
	addr = peop.getCompactAddress();

	newLic.setContactFirstName(cont.getFirstName());
	//newLic.setContactMiddleName(cont.getMiddleName());  //method not available
	newLic.setContactLastName(cont.getLastName());
	newLic.setBusinessName(peop.getBusinessName());
	newLic.setAddress1(addr.getAddressLine1());
	newLic.setAddress2(addr.getAddressLine2());
	newLic.setAddress3(addr.getAddressLine3());
	newLic.setCity(addr.getCity());
	newLic.setState(addr.getState());
	newLic.setZip(addr.getZip());
	newLic.setPhone1(peop.getPhone1());
	newLic.setPhone2(peop.getPhone2());
	newLic.setEMailAddress(peop.getEmail());
	newLic.setFax(peop.getFax());

	newLic.setAgencyCode(aa.getServiceProviderCode());
	newLic.setAuditDate(sysDate);
	newLic.setAuditID(currentUserID);
	newLic.setAuditStatus("A");

	if (AInfo["Insurance Co"]) 		newLic.setInsuranceCo(AInfo["Insurance Co"]);
	if (AInfo["Insurance Amount"]) 		newLic.setInsuranceAmount(parseFloat(AInfo["Insurance Amount"]));
	if (AInfo["Insurance Exp Date"]) 	newLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Exp Date"]));
	if (AInfo["Policy #"]) 			newLic.setPolicy(AInfo["Policy #"]);

	if (AInfo["Business License #"]) 	newLic.setBusinessLicense(AInfo["Business License #"]);
	if (AInfo["Business License Exp Date"]) newLic.setBusinessLicExpDate(aa.date.parseDate(AInfo["Business License Exp Date"]));

	newLic.setLicenseType(rlpType);

	if(addr.getState() != null)
		newLic.setLicState(addr.getState());
	else
		newLic.setLicState("AK"); //default the state if none was provided

	newLic.setStateLicense(rlpId);

	if (updating)
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
	else
		myResult = aa.licenseScript.createRefLicenseProf(newLic);

	if (myResult.getSuccess())
		{
		logDebug("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		logMessage("Successfully added/updated License No. " + rlpId + ", Type: " + rlpType);
		return true;
		}
	else
		{
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
		return false;
		}
	}


function createRefContactsFromCapContactsAndLink(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES". 
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will 
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.   
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization), 
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).
	
	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";
	
	
	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];
	
	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];

	   var p = con.getPeople();
	   
	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());
	   
	   if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   	{
	   	if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
		}
	
	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}
	   
	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}

	   if (ruleForRefContactType.equals("D"))
	   	continue;
	   	
	   var refContactType = "";
	   
	   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}
	   
	   var refContactNum = con.getCapContactModel().getRefContactNumber();
	   
	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);
	   		
	   						var a = p.getAttributes();
			
							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}
					
	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());
	   		
			if (!r.getSuccess()) 
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage()); 
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data"); 
			}
			
	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}
			
	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{

				var a = p.getAttributes();

				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}
				
				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p,a);

				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);
				
				// Need to link to an existing public user.
				
			    var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
			    if (getUserResult.getSuccess() && getUserResult.getOutput()) {
			        var userModel = getUserResult.getOutput();
			        logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());
					
					if (refPeopleId)	{
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
						}
					}
				}

			//
			// now that we have the reference Id, we can link back to reference
			//

		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

		    ccm.setRefContactNumber(refPeopleId);
		    r = aa.people.editCapContact(ccm);

		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


	    }  // end if user hand entered contact 
	}  // end for each CAP contact
} // end function


function getReqdDocs(recdType){
try{
	if(!matches(recdType, "Application", "Owner")){
		logDebug("Function is currently only set up for Application and Owner documentation.");
		return false;
	}
	//optional capId
	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args
		
	//application documents
    var businessFormation = {condition : "Business - Business Formation Documents", document : "Business - Business Formation Documents"};
    var businessBond = {condition : "Business - Evidence of Surety Bond", document : "Business - Evidence of Surety Bond"};
	var foriegnCorp = {condition : "Business - Foreign Corp. Certificate of Qualification", document : "Business - Foreign Corp. Certificate of Qualification"};
	var stateDocuments = {condition : "Business - CA Secretary of State Documents", document : "Business - CA Secretary of State Documents"};
	var soveriegnImmunity = {condition : "Business - Waiver of Sovereign Immunity", document : "Business - Waiver of Sovereign Immunity"};
	var localOrdinance = {condition : "VI - Copy of the Local Ordinance", document : "VI - Copy of the Local Ordinance"};
	var cannabisActivity = {condition : "VI - Evidence of Conducting Cannabis Activity", document : "VI - Evidence of Conducting Cannabis Activity"};
	var BOE = {condition : "VI - Registration with CA BOE", document : "VI - Registration with CA BOE"};
	var fullCompliance = {condition : "VI - Evidence of Full Local Compliance", document : "VI - Evidence of Full Local Compliance"};
	var occupyUse = {condition : "Premises - Legal Right to Occupy and Use", document : "Premises - Legal Right to Occupy and Use"};
	var ownership = {condition : "Premises - Property Ownership Documentation", document : "Premises - Property Ownership Documentation"};
	var operationDate = {condition : "Premises - Evidence of the Date Operations Began", document : "Premises - Evidence of the Date Operations Began"};
	var enviroStor = {condition : "Premises - EnviroStor Hazardous Materials Search", document : "Premises - EnviroStor Hazardous Materials Search"};
	var premiseDiagram = {condition : "Cultivation Plan - Premises Diagram", document : "Cultivation Plan - Premises Diagram"};
	var wastePlan = {condition : "Cultivation Plan - Waste Management Plan", document : "Cultivation Plan - Waste Management Plan"};
	var pestPlan = {condition : "Cultivation Plan - Pest Management Plan", document : "Cultivation Plan - Pest Management Plan"};
	var lightDiagram = {condition : "Cultivation Plan - Lighting Diagram", document : "Cultivation Plan - Lighting Diagram"};
	var streambedAlter = {condition : "Water - Streambed Alteration Document", document : "Water - Streambed Alteration Document"};
	var wellLog = {condition : "Water - Well Log", document : "Water - Well Log"};
	var SWRCBAhuth = {condition : "Water - SWRCB Diversion Authorization", document : "Water - SWRCB Diversion Authorization"};
	var SWRCBExcept = {condition : "Water - SWRCB Exception Document", document : "Water - SWRCB Exception Document"};
	var waterQuality = {condition : "Water - Water Quality Protection Permit", document : "Water - Water Quality Protection Permit"};
	var localAuth = {condition : "Local - Local Authorization", document : "Local - Local Authorization"};
	var planningPermit = {condition : "Local - Certified Planning Permit", document : "Local - Certified Planning Permit"};
	var goodStanding = {condition : "Local - Evidence of Good Standing", document : "Local - Evidence of Good Standing"};
	var CEQA = {condition : "Local - Evidence of CEQA Compliance", document : "Local - Evidence of CEQA Compliance"};
	var localComply = {condition : "Local - Certification of Local Compliance", document : "Local - Certification of Local Compliance"};
	
	//owner documents
    var governmentIssuedID = {condition : "Government Issued ID", document : "Government Issued ID"};
    var fingerprintApp = {condition : "Electronic Fingerprint Application", document : "Electronic Fingerprint Application"};
    var evidenceOfDismissal = {condition : "Evidence of Dismissal", document : "Evidence of Dismissal"};
    var certificateOfRehabilitation = {condition : "Certificate of Rehabilitation", document : "Certificate of Rehabilitation"};
    var referenceLetters = {condition : "Reference Letters", document : "Reference Letters"};
	var convictions = {condition : "History of Convictions", document : "History of Convictions"};
	var calResidency = {condition : "Evidence of California Residency", document : "Evidence of California Residency"};

	if(recdType == "Application"){
		arrReqdDocs_App = new Array();
	//these documents are always required
		arrReqdDocs_App.push(businessFormation);
		arrReqdDocs_App.push(businessBond);
		arrReqdDocs_App.push(ownership);
		arrReqdDocs_App.push(operationDate);
		arrReqdDocs_App.push(waterQuality);
		arrReqdDocs_App.push(enviroStor);
		arrReqdDocs_App.push(enviroStor);		
		
	//these are qualified documents
		var bsnsEntity = getAppSpecific("Business Entity Structure", itemCap);
		var foriegn = getAppSpecific("Foriegn Corporation", itemCap);
		var VI = getAppSpecific("Vertical Integration", itemCap);
		var SR2 = getAppSpecific("Small Retail Supplier 2", itemCap);
		var GWW = getAppSpecific("Small Retail Supplier 2", itemCap);
		var diversion = getAppSpecific("Diversion", itemCap);
		var diversionExcept = getAppSpecific("Diversion Exception", itemCap);
		var licType = getAppSpecific("License Type", itemCap);
		var localAuthority = getAppSpecific("Local Authority Type", itemCap);
		
		if (bsnsEntity != "Sole Proprietorship"){
			arrReqdDocs_App.push(stateDocuments);
		}
		if (bsnsEntity == "Soveriegn Entity"){
			arrReqdDocs_App.push(soveriegnImmunity);
		}
		if (foriegn == "Yes"){
			arrReqdDocs_App.push(foriegnCorp);
		}
		if (VI == "CHECKED"){
			arrReqdDocs_App.push(localOrdinance);
			arrReqdDocs_App.push(cannabisActivity);
			arrReqdDocs_App.push(fullCompliance);
			arrReqdDocs_App.push(BOE);
		}
		if (SR2 == "CHECKED"){
			arrReqdDocs_App.push(wellLog);
		}
		if (GWW == "CHECKED"){
			arrReqdDocs_App.push(wellLog);
		}
		if (diversion == "CHECKED"){
			arrReqdDocs_App.push(SWRCBAhuth);
		}				
		if (diversionExcept == "CHECKED"){
			arrReqdDocs_App.push(SWRCBExcept);
		}
		if(matches(licType,"Specialty Cottage Indoor","Specialty Cottage Mixed-Light","Specialty Indoor","Specialty Mixed-Light","Small Indoor","Small Mixed-Light","Medium Indoor","Medium Mixed-Light")) {
			arrReqdDocs_App.push(premiseDiagram);
			arrReqdDocs_App.push(wastePlan);
			arrReqdDocs_App.push(pestPlan);
			arrReqdDocs_App.push(lightDiagram);
		}
		if(matches(licType,"Specialty Cottage Outdoor","Specialty Outdoor","Small Outdoor","Medium Outdoor","Nursery")) {
			arrReqdDocs_App.push(premiseDiagram);
			arrReqdDocs_App.push(wastePlan);
			arrReqdDocs_App.push(pestPlan);
		}
		if(licType =="Processor") {
			arrReqdDocs_App.push(premiseDiagram);
			arrReqdDocs_App.push(wastePlan);
		}
		if(appTypeArray[2] == "Medical") {
			arrReqdDocs_App.push(localAuth);
			arrReqdDocs_App.push(planningPermit);
			arrReqdDocs_App.push(localComply);	
			arrReqdDocs_App.push(goodStanding);
			arrReqdDocs_App.push(CEQA);	
		}
		//for(d in arrReqdDocs_App)
		//	logDebug("Documents " + arrReqdDocs_App[d]);
		return arrReqdDocs_App;
	}
	if(recdType == "Owner"){
		arrReqdDocs_Own = new Array();
	//these documents are always required
		arrReqdDocs_Own.push(governmentIssuedID);
		arrReqdDocs_Own.push(fingerprintApp);
	
	//these are qualified documents
		if(appTypeArray[2] == "AdultUse") {
			arrReqdDocs_Own.push(calResidency);
		}
		var discipAction = getAppSpecific("Disciplinary Action", itemCap);
		if (discipAction == "Yes"){
			for(c in CONVICTIONS) {
				arrReqdDocs_Own.push(evidenceOfDismissal);
				arrReqdDocs_Own.push(certificateOfRehabilitation);
				arrReqdDocs_Own.push(referenceLetters);
			}
		}
		return arrReqdDocs_Own;
	}
}catch (err){
	logDebug("A JavaScript Error occurred:getReqdDocs: " + err.message);
	logDebug(err.stack);
}}

/*------------------------------------------------------------------------------------------------------/
|  Notification Template Functions (Start)
/------------------------------------------------------------------------------------------------------*/

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}

function getRecordParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$altID$$", capIDString);
	addParameter(params, "$$capName$$", capName);
	addParameter(params, "$$capStatus$$", capStatus);
	addParameter(params, "$$fileDate$$", fileDate);
	addParameter(params, "$$workDesc$$", workDescGet(capId));
	addParameter(params, "$$balanceDue$$", "$" + parseFloat(balanceDue).toFixed(2));
	addParameter(params, "$$capTypeAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
	if (wfComment != null) {
		addParameter(params, "$$wfComment$$", wfComment);
	}
	return params;
}

function getACARecordParam4Notification(params,acaUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl));
	
	return params;	
}

function getACADeepLinkParam4Notification(params,acaUrl,pAppType,pAppTypeAlias,module) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaDeepLinkUrl$$", getDeepLinkUrl(acaUrl, pAppType, module));
	addParameter(params, "$$acaDeepLinkAppTypeAlias$$", pAppTypeAlias);
	
	return params;
}

function getACADocDownloadParam4Notification(params,acaUrl,docModel) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl,docModel));
	
	return params;	
}

function getContactParams4Notification(params,pContact) {
	// pass in a hashtable and it will add the additional parameters to the table
	// pass in contact to retrieve informaiton from

		thisContact = pContact;
		conType = "contact";
		//logDebug("Contact Array: " + thisContact["contactType"] + " Param: " + conType);

		addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);
		addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);
		addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);
		addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);
		addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);
		addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);
		addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);
		addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);
		addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);
		addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);
		addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);
		addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);
		addParameter(params, "$$" + conType + "City$$", thisContact["city"]);
		addParameter(params, "$$" + conType + "State$$", thisContact["state"]);
		addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);
		addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);
		addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);
		addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);
		addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

	return params;	
}

function getPrimaryAddressLineParam4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

    var addressLine = "";

	adResult = aa.address.getPrimaryAddressByCapID(capId,"Y");

	if (adResult.getSuccess()) {
		ad = adResult.getOutput().getAddressModel();

		addParameter(params, "$$addressLine$$", ad.getDisplayAddress());
	}

	return params;
}

function getPrimaryOwnerParams4Notification(params) {
	// pass in a hashtable and it will add the additional parameters to the table

	capOwnerResult = aa.owner.getOwnerByCapId(capId);

	if (capOwnerResult.getSuccess()) {
		owner = capOwnerResult.getOutput();

		for (o in owner) {
			thisOwner = owner[o];
			if (thisOwner.getPrimaryOwner() == "Y") {
				addParameter(params, "$$ownerFullName$$", thisOwner.getOwnerFullName());
				addParameter(params, "$$ownerPhone$$", thisOwner.getPhone);
				break;	
			}
		}
	}
	return params;
}


function getACADocumentDownloadUrl(acaUrl,documentModel) {
   	
   	//returns the ACA URL for supplied document model

	var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);
	if(acaUrlResult.getSuccess())
	{
		acaDocUrl = acaUrlResult.getOutput();
		return acaDocUrl;
	}
	else
	{
		logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
		return false;
	}
}


function getACARecordURL(acaUrl) {
	
	var acaRecordUrl = "";
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

   	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

   	return acaRecordUrl;
}

function getDeepLinkUrl(acaUrl, appType, module) {
	var acaDeepLinkUrl = "";
	
	acaDeepLinkUrl = acaUrl + "/Cap/CapApplyDisclaimer.aspx?CAPType=";
	acaDeepLinkUrl += appType;
	acaDeepLinkUrl += "&Module=" + module;
	
	return acaDeepLinkUrl;
}

/*
 * add parameter to a hashtable, for use with notifications.
 */
function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}

/*
 * Send notification
 */
function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)
{
	var id1 = capId.ID1;
 	var id2 = capId.ID2;
 	var id3 = capId.ID3;

	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

/*------------------------------------------------------------------------------------------------------/
|  Notification Template Functions (End)
/------------------------------------------------------------------------------------------------------*/

