// **********************************************
// function subGetEmailAddress()
//
// This function gets the email addresses from 
// the configuration file
//
// **********************************************

function subGetEmailAddress(shtConfig, Addresses, WinPlyr, LosPlyr){
  
  // Config File Email Address column
  var colEmail = 6;
  var NbPlayers = shtConfig.getRange(16,7).getValue();
  var rowWinr = 0;
  var rowLosr = 0;
  //var Addresses = new Array(3);
  
  var PlayerNames = shtConfig.getRange(17,2,NbPlayers,1).getValues();
  
  // Find Players rows
  for (var row = 0; row < NbPlayers; row++){
    if (PlayerNames[row] == WinPlyr) rowWinr = row + 17;
    if (PlayerNames[row] == LosPlyr) rowLosr = row + 17;
    if (rowWinr > 0 && rowLosr > 0) row = NbPlayers + 1;
  }
  
  // Get Email addresses using the players rows
  Addresses[1] = shtConfig.getRange(rowWinr,colEmail).getValue();
  Addresses[2] = shtConfig.getRange(rowLosr,colEmail).getValue();
  
  return Addresses;
}


// **********************************************
// function fcnSendConfirmEmail()
//
// This function generates the confirmation email 
// after a match report has been submitted
//
// **********************************************

function fcnSendConfirmEmailEn(shtConfig, LeagueName, Address, MatchData) {
  
  // Variables
  var EmailSubject;
  var EmailMessage;
  
  // Get Document URLs
  var StandingsUrl = shtConfig.getRange(51,2).getValue();
  var CardPoolUrl = shtConfig.getRange(53,2).getValue();
  var MatchReporterUrl = shtConfig.getRange(55,2).getValue();
  
  // Open GLM - Email Templates
  var ssEmail = SpreadsheetApp.openById('15-IjvgcgHWx6nRc0U_Fzg0iUYS_rD6-u5tNZELdZxOo');
  var shtEmailTemplates = ssEmail.getSheetByName('Templates');
  var Headers = shtEmailTemplates.getRange(3,2,25,1).getValues();
  
  // Match Data Assignation
  var MatchID = MatchData[2][0];
  var Week    = MatchData[3][0];
  var Winr    = MatchData[4][0];
  var Losr    = MatchData[5][0];
  
  // Add Masterpiece mention if necessary
  if (MatchData[24][2] == 'Last Card is Masterpiece'){
    var Masterpiece = MatchData[23][2];
    MatchData[23][2] += ' (Masterpiece)' 
  }

  // Set Email Subject
  EmailSubject = LeagueName + " - Week " + Week + " - Match Result" ;
    
  // Start of Email Message
  EmailMessage = '<html><body>';
  
  EmailMessage += 'Hi ' + Winr + ' and ' + Losr + ',<br><br>Your match result has been received and succesfully processed for the ' + LeagueName + ', Week ' + Week + 
    '<br><br>Here is your match result:<br><br>';
    
  // Generate Match Data Table
  EmailMessage = subMatchReportTable(EmailMessage, Headers, MatchData,1);
  
  EmailMessage += '<br>Click here to access the League Standings and Results:'+
    '<br>'+ StandingsUrl +
      '<br><br>Click here to access your Card Pool:'+
        '<br>'+ CardPoolUrl +
          '<br><br>Click here to send another Match Report:'+
            '<br>'+ MatchReporterUrl +
              '<br><br>If you find any problems with your match result, please reply to this message and describe the situation as best you can. You will receive a response once it has been processed.'+
                '<br><br>Thank you for using TCG Booster League Manager from Turn 1 Gaming Leagues Applications';
  
  // End of Email Message
  EmailMessage += '</body></html>';
  
  // Sends email to both players with the Match Data
  if (Address[1] != '') MailApp.sendEmail(Address[1], EmailSubject, EmailMessage,{name:'Triad Gaming League Manager',htmlBody:EmailMessage});
  if (Address[2] != '') MailApp.sendEmail(Address[2], EmailSubject, EmailMessage,{name:'Triad Gaming League Manager',htmlBody:EmailMessage});
}


// **********************************************
// function fcnSendErrorEmail()
//
// This function generates the error email 
// after a match report has been submitted
//
// **********************************************

function fcnSendErrorEmail(shtConfig, LeagueName, Address, MatchData, MatchID, Status) {
  
  // Variables
  var EmailSubject;
  var EmailMessage;
  var EmailName1 = '';
  var EmailName2 = '';
  
  // Get Document URLs
  var StandingsUrl = shtConfig.getRange(51,2).getValue();
  var CardPoolUrl = shtConfig.getRange(53,2).getValue();
  var MatchReporterUrl = shtConfig.getRange(55,2).getValue();
  
  // Open GLM - Email Templates
  var ssEmail = SpreadsheetApp.openById('15-IjvgcgHWx6nRc0U_Fzg0iUYS_rD6-u5tNZELdZxOo');
  var shtEmailTemplates = ssEmail.getSheetByName('Templates');
  var Headers = shtEmailTemplates.getRange(3,2,25,1).getValues();
  
  // Match Data Assignation
  var MatchID = MatchData[2][0];
  var Week    = MatchData[3][0];
  var Winr    = MatchData[4][0];
  var Losr    = MatchData[5][0];
  
  var StatusMsg;
   
  // Selects the Appropriate Error Message
  switch (Status[0]){
  
    case -10 : StatusMsg = 'Match Result has already been submitted.'; break; // Administrator + Players
    case -11 : StatusMsg = '<b>'+Winr+'</b> is eliminated from League.'; break;    // Administrator + Players
    case -12 : StatusMsg = '<b>'+Winr+'</b> has played too many matches this week. Matches played: '+MatchData[4][1]; break;  // Administrator + Players 
    case -21 : StatusMsg = '<b>'+Losr+'</b> is eliminated from League.'; break;    // Administrator + Players
    case -22 : StatusMsg = '<b>'+Losr+'</b> has played too many matches this week. Matches played: '+MatchData[5][1]; break;  // Administrator + Players 
    case -31 : StatusMsg = 'Both players are eliminated from League.'; break; // Administrator + Players 
    case -32 : StatusMsg = '<b>'+Winr+'</b> is eliminated from League.<br><b>'+Losr+'</b> has played too many matches this week. Matches played: '+MatchData[5][1]; break;  // Administrator + Players
    case -33 : StatusMsg = '<b>'+Winr+'</b> has player too many matches this week. Matches played: <b>'+MatchData[4][1]+'</b>.<br><b>'+Losr+'</b> is eliminated from League.'; break;  // Administrator + Players
    case -34 : StatusMsg = 'Both Players have played too many matches this week.<br><b>'+Winr+'</b> Matches played: <b>'+MatchData[4][1]+'</b><br><b>'+Losr+'</b> Matches played: <b>'+MatchData[5][1]+'</b>'; break; // Administrator + Players
    case -50 : StatusMsg = 'Same player selected for Win and Loss.<br>Winner: <b>'+Winr+'</b><br>Loser: <b>' +Losr+ '</b>'; break; // Administrator + Players
    case -60 : StatusMsg = Status[1]; break;  // Administrator + Players
	case -97 : StatusMsg = 'Process Error, Match Results Post Not Executed'; break;        // Administrator
    case -98 : StatusMsg = 'Process Error, Matching Response Search Not Executed'; break;  // Administrator
    case -99 : StatusMsg = 'Process Error, Duplicate Entry Search Not Executed'; break;    // Administrator
  }
  
  // Set Email Subject
  EmailSubject = LeagueName + ' - Week ' + Week + ' - Match Report Error' ;
  
  // Start of Email Message
  EmailMessage = '<html><body>';

  // If Error prevented Match Data to be processed (Duplicate Entry or Player Match is not valid)  
  if (Status[0] < 0 && Status[0] > -60) {
    EmailMessage += 'Hi ' + Winr + ' and ' + Losr + ',<br><br>Your match result has been succesfully received for the ' + LeagueName + ', Week ' + Week + 
      "<br><br>An error has been detected in one of the player's record. Unfortunately, this error prevented us to process the match report.<br><br>"+
        "<b>Error Message</b><br>" + StatusMsg +
          '<br><br>Here is your match result:<br><br>';
    
    // Populate the Match Data Table
    EmailMessage = subMatchReportTable(EmailMessage, Headers, MatchData,StatusMsg);
  }

  // If Error did not prevent Match Data to be processed (Card Name not Found for Card Number X)    
  if (Status[0] == -60){
    EmailMessage += 'Hi ' + Winr + ' and ' + Losr + ',<br><br>Your match result has been succesfully received for the ' + LeagueName + ', Week ' + Week + 
      "<br><br>We were able to process the match data but an error has been detected in the submitted form.<br>Please contact us to resolve this error as soon as possible<br><br>"+
        "<b>Error Message</b><br>" + StatusMsg +
          '<br><br>Here is your match result:<br><br>';
    
    // Populate the Match Data Table
    EmailMessage = subMatchReportTable(EmailMessage, Headers, MatchData,StatusMsg);
  }

  // If Process Error was Detected 
  if (Status[0] < -60) {
    EmailMessage += 'Process Error was detected<br><br>'+
        "<b>Error Message</b><br>" + StatusMsg;
  }
  
  if (Status[0] >= -60) {
    EmailMessage += '<br>Click here to access the League Standings and Results:'+
      '<br>'+ StandingsUrl +
        '<br><br>Click here to access your Card Pool:'+
          '<br>'+ CardPoolUrl +
            '<br><br>Click here to send another Match Report:'+
              '<br>'+ MatchReporterUrl +
                '<br><br>If you find any problems with your match result, please reply to this message and describe the situation as best you can. You will receive a response once it has been processed.'+
                  '<br><br>Thank you for using TCG Booster League Manager from Turn 1 Gaming Leagues Applications';
  }
  
  // End of Email Message
  EmailMessage += '</body></html>';
   
  // Send email to Administrator
  MailApp.sendEmail(Address[0], EmailSubject, EmailMessage,{name:'Triad Gaming Booster League Manager',htmlBody:EmailMessage});
  
  // If Error is between 0 and -60, send email to players. If not, only send to Administrator
  if (Status[0] >= -60){
    // Sends email to both players with the Match Data
    if (Address[1] != '') {
      MailApp.sendEmail(Address[1], EmailSubject, EmailMessage,{name:'Triad Gaming League Manager',htmlBody:EmailMessage});
    }
    if (Address[2] != '' && Address[1] != Address[2]) {
      MailApp.sendEmail(Address[2], EmailSubject, EmailMessage,{name:'Triad Gaming League Manager',htmlBody:EmailMessage});
    }
  }
}


// **********************************************
// function fcnSendFeedbackEmail()
//
// This function generates the feedback email 
//
// **********************************************

function fcnSendFeedbackEmail(LeagueName, Address, MatchData, Feedback) {
  
  // Variables
  var EmailSubject;
  var EmailMessage;
    
  // Match Data Assignation
  var MatchID = MatchData[2][0];
  var Week    = MatchData[3][0];
  var Winr    = MatchData[4][0];
  var Losr    = MatchData[5][0];
  
  // Set Email Subject
  EmailSubject = LeagueName + ' - Week ' + Week + ' - Player Feedback' ;
  
  // Start of Email Message
  EmailMessage = '<html><body>';
  
  EmailMessage += 'Here is the feedback received by:<br><br>'+
    Address[1]+'<br>'+
      Address[2]+'<br><br>'+
        Feedback;
  
  // End of Email Message
  EmailMessage += '</body></html>';
  
  // Send email to Administrator
  MailApp.sendEmail(Address[0], EmailSubject, EmailMessage,{name:'Triad Gaming League Manager',htmlBody:EmailMessage});
}



// **********************************************
// function subMatchReportTable()
//
// This function generates the HTML table that displays 
// the Match Data and Booster Pack Data
//
// **********************************************

function subMatchReportTable(EmailMessage, Headers, MatchData, Param){
  for(var row=0; row<24; ++row){

    if(row == 1) ++row;
    
    // Start of Match Table
    if(row == 0) {
      EmailMessage += '<table style="border-collapse:collapse;" border = 1 cellpadding = 5><tr>';
    }
    
    // Match Data
    if(row < 7) {
      EmailMessage += '<tr><td>'+Headers[row][0]+'</td><td>'+MatchData[row][0]+'</td></tr>';
    }
    
    // End of first Table
    if(row == 7) EmailMessage += '</table><br>';
    
    // Start of Pack Table
    if(row == 9 && Param == 1) {
      EmailMessage += 'Booster Pack Content<br><br><font size="4"><b>'+MatchData[row][0]+
        '</b></font><br><table style="border-collapse:collapse;" border = 1 cellpadding = 5><th>Item</th><th>Card Number</th><th>Card Name</th><th>Rarity</th>';
    }
    
    // Pack Data
    if(row > 9 && Param == 1) {
      EmailMessage += '<tr><td>'+Headers[row][0]+'</td><td>'+MatchData[row][1]+'</td><td>'+MatchData[row][2]+'</td><td>'+MatchData[row][3]+'</td></tr>';
    }
    
    // If Param is Not 1, Error is Present 
    if(row == 9 && Param != 1) {
      row = 24;
    }
    
  }
  return EmailMessage +'</table>';
}

// **********************************************
// function subMatchReportTable()
//
// This function generates the HTML table that displays 
// the Match Data and Booster Pack Data
//
// **********************************************

function subEmailPlayerPenaltyTable(PlayerData){
  
  var EmailMessage;
  
  for(var row=0; row<33; ++row){

    if(PlayerData[row][0] != ''){
      
      // Start of Table
      if(row == 0) {
        EmailMessage = 'Players who have not completed the minimum number of matches have received penalty losses on their record.<br>Here is the list of penalty losses this week.<br><font size="4"><b><table style="border-collapse:collapse;" border = 1 cellpadding = 5><tr>';
        EmailMessage += '<tr><td><b>Player Name</b></td><td><b>Penalty Losses</b></td></tr>';
      }
      
      // Player Data
      EmailMessage += '<tr><td>'+PlayerData[row][0]+'</td><td>'+PlayerData[row][1]+'</td></tr>';
    }
    if(PlayerData[row][0] == '') row = 33;
  }
  return EmailMessage +'</table>';
}

