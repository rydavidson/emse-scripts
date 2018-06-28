/*------------------------------------------------------------------------------------------------------/
| Program : UniversalMasterScriptV3.0.js
| Event   : UniversalMasterScript
|
| Usage   : Designed to work with most events and generate a generic framework to expose standard master scirpt functionality
|			To utilize associate UniversalMasterScript to event and create a standard choice with same name as event
|			universal master script will execute and attempt to call standard choice with same name as associate event. 
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START Configurable Parameters
|	The following script code will attempt to read the assocaite event and invoker the proper standard choices
|    
/------------------------------------------------------------------------------------------------------*/
var triggerEvent = aa.env.getValue("EventName");
					// Document Only -- displays hierarchy of std choice steps
showDebug=false;
showMessage=false;


/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/
//Log All Environmental Variables as  globals
	aa.env.setValue("ScriptReturnCode", "0");
aa.print("in1" + showDebug + " event: " + triggerEvent);

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

	
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/