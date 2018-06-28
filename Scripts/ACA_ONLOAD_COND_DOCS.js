/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ONLOAD_COND_DOCS.JS
| Event   : ACA Page Flow onload attachments component
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true;  			// if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));


function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}


var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();					// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
	}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess())
	{
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
	}

var AInfo = new Array();						// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables4ACA();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId A= " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);


// page flow custom code begin

try{
	docsMissing = false;
	showList = true;
	addConditions = true;
	addTableRows = false;
	var tblRow = [];
	var conditionTable = [];
	dr = "";
	capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
//	r = getReqdDocs("Application");

	var itemCap = capId;
		
	//application documents
    var businessFormation = {condition : "Proof of Tenant Space", document : "Business - Business Formation Documents"};
    var businessBond = {condition : "Driver's License", document : "Business - Evidence of Surety Bond"};


		r = new Array();
	//these documents are always required
		r.push(businessFormation);
		r.push(businessBond);



		for(d in r)
			logDebug("Documents " + r[d]);




	logDebug("what is returned a: " + r);
	
	submittedDocList = aa.document.getDocumentListByEntity(capIdString,"TMP_CAP").getOutput().toArray();
	uploadedDocs = new Array();
	for (var i in submittedDocList ){
		uploadedDocs[submittedDocList[i].getDocCategory()] = true;
	}
	if (r.length > 0 && showList) {
		for (x in r) { 
			if(uploadedDocs[r[x].document] == undefined) {	
				showMessage = true; 
				if (!docsMissing)  {
					comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>A.The following documents are required based on the information you have provided: </span><ol>"); 	
					docsMissing = true; 
				}
				conditionType = "License Required Documents";


				dr = r[x].condition;
				publicDisplayCond = null;
				if (dr) {
					ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
					for(var i = 0; i<ccr.length; i++) 
						if(ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase()) 
							publicDisplayCond = ccr[i];
				}
				if (dr && ccr.length > 0 && showList && publicDisplayCond) {
					message += "<li><span>" + dr + "</span>: " + publicDisplayCond.getPublicDisplayMessage() + "</li>";
				}
				if (dr && ccr.length > 0 && addConditions) {
					message += "<li><span> A:" + dr + "</span>: " + ccr.length + "</li>";
					addStdCondition(conditionType,dr);
				}
					message += "<li><span> B:" + dr + "</span>: " + ccr.length + "</li>";
				if (dr && ccr.length > 0) {
										message += "<li><span> C:" + dr + "</span>: " + ccr.length + "</li>";
					tblRow["Document Type"] = new asiTableValObj("Document Type","Business ", "Y"); 
					tblRow["Document Description"]= new asiTableValObj("Document Description","anything for now", "Y"); 
					tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
					tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y"); ; 
					conditionTable.push(tblRow);
				}	
			}	
		}
			message += "<li><span> D:" + dr + "</span>: " + typeof(ATTACHMENTS)== "object" + "</li>";
			removeASITable("ATTACHMENTS"); 
			asit = cap.getAppSpecificTableGroupModel();
			new_asit = addASITable4ACAPageFlow(asit,"ATTACHMENTS",conditionTable);
										message += "<li><span> E:" + dr + "</span>: " + new_asit + "</li>";
										for (x in new_asit) if(typeof(new_asit[x])!= "function"){{message += "<li><span> nonfuncvalues:" + x + "</span>: " + new_asit[x] + "</li>";}}
	}

		comment("</ol></div>");
	
} catch (err) {
	showDebug =true;
	logDebug("An error has occurred in ACA_ONLOAD_COND_DOCS: Main function: " + err.message);
	logDebug(err.stack);
}


// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}



