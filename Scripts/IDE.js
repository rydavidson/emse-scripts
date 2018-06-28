/*------------------------------------------------------------------------------------------------------/
| Program		: IDE.js
| Event			: used in Eclipse and Excel plugin, please dont delete it
| Created by	: SLEIMAN KOZAIAN-
| Created at	: 01/08/2016 14:26:22
/------------------------------------------------------------------------------------------------------*/
try{var service=com.accela.aa.emse.dom.service.CachedService.getInstance().getEMSEService();var scriptText=aa.env.getValue("SCRIPT_TEXT");var commit=aa.env.getValue("SCRIPT_COMMIT");
var bcommit=String("true").equals(commit);var htResult=service.testScript(scriptText,aa.getServiceProviderCode(),aa.env.getParamValues(),aa.getAuditID(),bcommit);aa.env.setValue("SCRIPT_TEXT","");
var ret=htResult.get("ScriptReturnDebug");if(ret==null||ret==""){ret=" "}aa.env.setValue("SCRIPT_RESULT",ret);if(bcommit){aa.env.setValue("ScriptReturnCode","0")}else{aa.env.setValue("ScriptReturnCode","-1")
}}catch(e){aa.env.setValue("ScriptReturnCode","-2");aa.print(e);aa.env.setValue("ERROR",e+"")};