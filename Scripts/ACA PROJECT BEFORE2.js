/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ADD_ASIT.js
| Event   : ACA_Button Event
|
| Usage   : 
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
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;                                                                            // Set to true to see results in popup window
var showDebug = false;                                                                                                 // Set to true to see debug messages in popup window
var disableTokens = false;                                                                            // turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;                                 // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;                                // Use Group name when populating Task Specific Info Values
var enableVariableBranching = false;                      // Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;                                                                                       // Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = "";                                                                                             // Message String
var debug = "";                                                                                                  // Debug String
var br = "<BR>";                                                                                                // Break Tag

//add include files
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));


function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()                                      // Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();                                                                 // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();                                  // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");                                      // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();

var AInfo = new Array();                                                                               // Create array for tokenized variables

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

//loadASITables4ACA();
loadASITables4ACA_corrected();

var addedRow = false;

if(typeof(ATTACHMENTS) == "object") 
                addedRow = true;
                
if (!addedRow) {
                cancel=true; 
                showMessage=true; 
                comment("You must enter at least one row to the ACAPROJECTBEFORE xxvii table to continue.");
                }


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}