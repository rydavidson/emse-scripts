var documentList = aa.env.getValue("DocumentModelList");
var templateName = "DOCUMENTUPLOAD";
var from = "ethan.mo@achievo.com";
var to = "ethan.mo@achievo.com";
var cc = "william.wang@achievo.com";
var dateFormatStr = "MM/dd/yyyy hh:mm";
var entityType ="LICENSEPROFESSIONAL";

if("ACA".equals(aa.env.getValue("From")) && isCorrectFile())
{
	sendMail();
}
else
{
	aa.print("Do not send mail for this file(s).");
	
	//------------------------------------ 
var documentModelArray = aa.env.getValue("DocumentModelList"); //The new added line 
aa.print("DUB: documentModelArray = " + documentModelArray); //Add the new like to show the debug info. 

if (documentModelArray) { 
var it = documentModelArray.iterator(); 
while (it.hasNext()) 
{ 
var documentModel = it.next(); 
fileName = documentModel.getFileName(); 
//var timeLogSeq = timeLog.getTimeLogSeq(); 
aa.print("DUB 1 Filename is: " + fileName); 
} 
} 
	
	
	
	
}

function sendMail()
{
	var fileNames = [];
	var result = aa.document.sendEmailByTemplateName(from, to, cc, templateName, getParams(), fileNames);
	if(result.getSuccess())
	{
		aa.print("Send mail success.");
	}
	else
	{
		aa.print("DUB: Send mail fail.");
	}
}

function isCorrectFile()
{
	var validateResult = true;
	if(documentList == null)
	{
		validateResult = false;
	}
	else
	{
		for(var i=0; i<documentList.size(); i++)
		{
			if(!entityType.equals(documentList.get(i).getEntityType()))
			{
				validateResult = false;
				break;
			}
		}
	}
	return validateResult
}

function getProviderModel(providerNbr)
{
	var result = aa.licenseScript.getProviderBySeq(providerNbr);
	if(result.getSuccess())
	{
		return result.getOutput();
	}
	return null;
}

function getParams()
{
	var params = aa.util.newHashtable();
	if(documentList != null)
	{
		addParameter(params, "$$DocumentName$$", documentList.get(0).getDocName());
		addParameter(params, "$$EntityID$$", documentList.get(0).getEntityID());
		addParameter(params, "$$EntityType$$", documentList.get(0).getEntityType());
		addParameter(params, "$$UploadDate$$", formatDate(documentList.get(0).getFileUpLoadDate() ,dateFormatStr));
	}
	return params;
}

function formatDate(date, dateFormat)
{
	var dateStr = "";
	if(date != null)
	{
		dateStr = aa.util.formatDate(date, dateFormat);
	}
	return dateStr;
}

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

function getCapIDScriptModel()
{
	return aa.cap.createCapIDScriptModel("", "", "");
}

aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage","DocumentUploadAfter successful");