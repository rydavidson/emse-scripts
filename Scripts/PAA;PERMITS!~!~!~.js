cancel=true;
showDebug=true;
logDebug("paafrom script" + capId);


var parcelNumber = "1600"; 
var conditionType = "Parcel"; 
var conditionDescription = "Not in City"; 
var conditionComment = "Parcel is not located within Santa Clarita city limits"; 
var refNumber1 = null; 
var refNumber2 = null; 
var impactCode = "Lock"; 
var conditionStatus = "Applied"; 
var effectDate = sysDate; 
var expireDate = null; 
var issuedDate = sysDate; 
var statusDate = sysDate; 
var issuedByUser = systemUserObj; 
var statusByUser = systemUserObj; 
var conditionStatusType = "Applied"; 
var displayConditionNotice = "Y"; 
var includeInConditionName = "Y"; 
var includeInShortDescription = "N"; 
var inheritable = "Y"; 
var longDescripton = null; 
var publicDisplayMessage = null; 
var resolutionAction = null; 
var conditionGroup = "Property"; 
var displayNoticeOnACA = "Y"; 
var displayNoticeOnACAFee = "N"; 

//aa.parcelCondition.addParcelCondition(parcelNumber,conditionType,conditionDescription,conditionComment,refNumber1,refNumber2,impactCode,conditionStatus,effectDate,expireDate,issuedDate,statusDate,issuedByUser,statusByUser,conditionStatusType,displayConditionNotice,includeInConditionName,includeInShortDescription,inheritable,longDescripton,publicDisplayMessage,resolutionAction,conditionGroup,displayNoticeOnACA,displayNoticeOnACAFee);

//aa.parcelCondition.addParcelCondition(parcelNumber,conditionType,conditionDescription,conditionComment,refNumber1,refNumber2,impactCode,conditionStatus,effectDate,expireDate,issuedDate,statusDate,issuedByUser,statusByUser,conditionStatusType,displayConditionNotice,includeInConditionName,includeInShortDescription,inheritable,longDescripton,publicDisplayMessage,resolutionAction,conditionGroup,displayNoticeOnACA,displayNoticeOnACAFee);      
aa.parcelCondition.addParcelCondition(parcelNumber,conditionType,conditionDescription,conditionComment,refNumber1,refNumber2,impactCode,conditionStatus,effectDate,expireDate,issuedDate,statusDate,issuedByUser,statusByUser,conditionStatusType,displayConditionNotice,includeInConditionName,includeInShortDescription,inheritable,longDescripton,publicDisplayMessage,resolutionAction,conditionGroup,displayNoticeOnACA,displayNoticeOnACAFee,3);