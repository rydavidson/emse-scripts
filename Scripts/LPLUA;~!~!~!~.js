showDebug=true; cancel=true;

for (i in licenseList)
{for (j in licenseList[i]) if(typeof(licenseList[i][j])=="function"){logDebug(" method: " + j);}}
for (l in licenseList)
{for (m in licenseList[l]) if(typeof(licenseList[l][m])!="function"){logDebug(" attribute: " + m + " " + licenseList[l][m]);}}