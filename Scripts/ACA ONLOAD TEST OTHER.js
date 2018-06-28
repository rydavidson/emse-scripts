/*------------------------------------------------------------------------------------------------------/
| Program : ACA _ADD_ASIT.js
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
loadASITables4ACA();
var conditionTable = new Array();
showMessage = true;
comment(" at P4 " + capId);

    if (typeof (ATTACHMENTS) == "object") {
	comment("attachemetns exist : ");}
	else{
	comment("attachemetns do not exist : ");
    }

asit = cap.getAppSpecificTableGroupModel();

					var tblRow = [];
					tblRow["Document Type"] = new asiTableValObj("Document Type","yyyy", "Y"); 
					tblRow["Document Description"]= new asiTableValObj("Document Description","xxx", "Y"); 
					tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
					tblRow["Status"] = new asiTableValObj("Status","Not Submitted", "Y");
					conditionTable.push(tblRow);
					var tblRow = [];
					tblRow["Document Type"] = new asiTableValObj("Document Type","yyyy2", "Y"); 
					tblRow["Document Description"]= new asiTableValObj("Document Description","xxx2", "Y"); 
					tblRow["Uploaded"] = new asiTableValObj("Uploaded","UNCHECKED", "Y"); 
					tblRow["Status"] = new asiTableValObj("Status","Not Submitted2", "Y");
					conditionTable.push(tblRow);					

		removeASITable("ATTACHMENTS", capId);
		new_asit = addASITable4ACAPageFlowHere(asit,"ATTACHMENTS", conditionTable, capId);

		addASITable("ATTACHMENTS",conditionTable,capId);


showMessage = true;
comment(" at  P5 " + capId + " capIDSTRING " + capIDString);
comment("lengthOFtable: " + conditionTable.length);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function addASITable4ACAPageFlowHere(destinationTableGroupModel, tableName, tableValueArray) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
    //
    //  override to handle null values

    //logDebug("**666 : ");

    var itemCap = capId
    if (arguments.length > 3)
        itemCap = arguments[3]; // use cap ID specified in args

    var ta = destinationTableGroupModel.getTablesMap().values();
    var tai = ta.iterator();

    var found = false;

    while (tai.hasNext()) {
        var tsm = tai.next();  // com.accela.aa.aamain.appspectable.AppSpecificTableModel
        if (tsm.getTableName().equals(tableName)) { found = true; break; }
    }

    //logDebug("**777 : itemCap:" + itemCap);

    if (!found) { logDebug("cannot update asit for ACA, no matching table name"); return false; }

    var fld = aa.util.newArrayList();  // had to do this since it was coming up null.
    var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
    var i = -1; // row index counter

    for (thisrow in tableValueArray) {

        var col = tsm.getColumns()
        var coli = col.iterator();

        while (coli.hasNext()) {
            var colname = coli.next();

            if (typeof (tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
            {
                var args = new Array("" + tableValueArray[thisrow][colname.getColumnName()].fieldValue, colname);
                var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
                fldToAdd.setRowIndex(i);
                fldToAdd.setFieldLabel(colname.getColumnName());
                fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
                fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
                fld.add(fldToAdd);
                fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
                //logDebug("**1313 : " + tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));

            }
            else // we are passed a string
            {
                var args = new Array("" + tableValueArray[thisrow][colname.getColumnName()], colname);
                var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
                fldToAdd.setRowIndex(i);
                fldToAdd.setFieldLabel(colname.getColumnName());
                fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
                fldToAdd.setReadOnly(false);
                fld.add(fldToAdd);
                fld_readonly.add("N");
                //logDebug("**1414 : ");
            }
        }

        i--;

    }
    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field

    tssm = tsm;

    return destinationTableGroupModel;

}
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

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/