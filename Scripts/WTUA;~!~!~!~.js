      
//cancel=true;
showDebug=true;
logDebug("wtua from script" + capId);
if(wfStatus=="Issued"){
createLicense("Active",true)
logDebug("created license");
}
logDebug("wfDue" + wfDue);
logDebug("wfTask = " + wfTask);
var hold=wfDue;
logDebug("hold:" + hold);

