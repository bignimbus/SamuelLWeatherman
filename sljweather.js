/* 
Concept and code by BIGnimbus
OAuth(), encodeString() and sendTweet() functions have been heavily borrowed from Amit Agarwal @labnol.

TO DO:
- store keys, tokens, etc. in a database to improve security

HISTORY:

version 0.1: Set up private tweets, sent dummy tweets
version 0.2: Added weather underground API scraper script (wunderground.js) and database.
version 0.3: Set up so that each type of weather tweet would draw a random SLJ quote from a pre-filled database
version 1.0: Added database of Samuel L. Jackson-like tweets and integrated a random quote selector, set all tweets to public
version 1.1: Modified the timing of some tweets.
version 1.2: App now stores previous conditions to prevent non-helpful tweets (we don't need to know that it's Party Cloudy 15 times a day).
             Now the currentConditions() function checks the conditions from 1 hour ago and will only tweet if the conditions have changed.
version 1.3: Added wind gusts to currentWind()

*/

function start() {

  var TWITTER_CONSUMER_KEY     = "Secret Code Here";
  
  var TWITTER_CONSUMER_SECRET  = "Secret Code Here";
  
  var TWITTER_TOKEN            = "Secret Code Here";
  
  var TWITTER_TOKEN_SECRET     = "Secret Code Here";
  
  var TWITTER_HANDLE           = "sljweather";
  
  
  // Store variables
  
  ScriptProperties.setProperty("TWITTER_CONSUMER_KEY",    TWITTER_CONSUMER_KEY);

  ScriptProperties.setProperty("TWITTER_CONSUMER_SECRET", TWITTER_CONSUMER_SECRET);

  ScriptProperties.setProperty("TWITTER_HANDLE",          TWITTER_HANDLE);

  ScriptProperties.setProperty("MAX_TWITTER_ID",          0);
  
  ScriptProperties.setProperty("TWITTER_TOKEN",          TWITTER_TOKEN);
  
  ScriptProperties.setProperty("TWITTER_TOKEN_SECRET",   TWITTER_TOKEN_SECRET);
  
  
  // Begin Triage
  
  triage();
     
}

function oAuth() {

  var oAuthConfig = UrlFetchApp.addOAuthService("twitter");
  oAuthConfig.setAccessTokenUrl("https://api.twitter.com/oauth/access_token");
  oAuthConfig.setRequestTokenUrl("https://api.twitter.com/oauth/request_token");
  oAuthConfig.setAuthorizationUrl("https://api.twitter.com/oauth/authorize");
  oAuthConfig.setConsumerKey(ScriptProperties.getProperty("TWITTER_CONSUMER_KEY"));
  oAuthConfig.setConsumerSecret(ScriptProperties.getProperty("TWITTER_CONSUMER_SECRET"));
  oAuthConfig.setMethod("post");
 
}

function triage() {
  
 var ss = SpreadsheetApp.openById("**SecretCodeHere**");
 var sheet = ss.getSheets()[2];
 var sunriseH = sheet.getRange(2, 1); //row #, column
  var sunriseH = sunriseH.getValue();
 var sunriseM = sheet.getRange(2, 2); //get day's sunrise and sunset data
  var sunriseM = sunriseM.getValue();
 var sunsetH = sheet.getRange(2, 3);
  var sunsetH = sunsetH.getValue();
 var sunsetM = sheet.getRange(2, 4);
  var sunsetM = sunsetM.getValue();
  
 var h = Utilities.formatDate(new Date(), "GMT-5", "HH");
 Logger.log(h);
  
 var m = Utilities.formatDate(new Date(), "GMT-5", "mm");
 Logger.log(m);
  
  // if midnight, sunrise or sunset, go to midnight(), sunrise() or sunset()
  
  if (h==0 && m==0) midnight();
  if (sunriseH == h && sunriseM == m) sunrise();
  if (sunsetH == h && sunsetM == m) sunset(); 
  
 
  // if 4am, 7am, 9am or 12pm, tweet forecastToday
  
  if (h==4 && m==00) forecastToday();
  if (h==7 && m==00) forecastToday();
  if (h==9 && m==00) forecastToday();
  if (h==12 && m==00) forecastToday();
  
  //if 6pm, 7:30pm, 9pm or 11:30pm, tweet forecastTomorrow
  
  if (h==18 && m==00) forecastTomorrow();
  if (h==19 && m==30) forecastTomorrow();
  if (h==21 && m==00) forecastTomorrow();
  if (h==23 && m==30) forecastTomorrow();
  
  // if every 3 hours, tweet currentTemp
  
  if (h%3==0 && m==45) currentTemp();
  
  // if every 1 hours, tweet currrentConditions
  
  if (m==15) currentConditions();
  
  // if every 4 hours, currentWind
  
  if (h%4==0 && m==45) currentWind();
  
  // if 3:30pm, tweet getQuote
  
  if (h==15 && m==30) getQuote();
  
} 

function sendTweet(tweet) {

  var options =
  {
    "method": "POST",
    "oAuthServiceName":"twitter",
    "oAuthUseToken":"always"    
  };
  
  oAuth();
  
  var status = "https://api.twitter.com/1.1/statuses/update.json";
  
  status = status + "?status=" + encodeString(tweet);  
  
  try {
    var result = UrlFetchApp.fetch(status, options);
    ScriptProperties.setProperty("MAX_TWITTER_ID");
    logger.log(result.getContentText());    
  }  
  catch (e) {
    Logger.log(e.toString());
  }

}

function encodeString (q) {
  
  // Update: 09/06/2013
  
  // Google Apps Script is having issues storing oAuth tokens with the Twitter API 1.1 due to some encoding issues.
  // Hence this workaround to remove all the problematic characters from the status message.
  
  var str = q.replace(/\(/g,'{').replace(/\)/g,'}').replace(/\[/g,'{').replace(/\]/g,'}').replace(/\!/g, '.').replace(/\*/g, 'x').replace(/\'/g, '"');
  return encodeURIComponent(str);

   //var str =  encodeURIComponent(q);
   //str = str.replace(/\*/g,'%2A');
   //str = str.replace(/\(/g,'%28');
   //str = str.replace(/\)/g,'%29');
   //str = str.replace(/'/g,'%27');
   //return str;

}

function forecastToday() {
  //
  //
  // get the day's forecast
  // 3x day: morning, afternoon, night
  // include high, low, conditions, chance of precip
  // comment on it
  //
  //
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[1];
  var tyF;
  var todaysForecast = new Array();
  
  for (var n=0; n<4; n++){
  tyF = sheet.getRange(2, n+1); //row #, column #
  todaysForecast[n] = tyF.getValue();
  Logger.log(todaysForecast[n]);
  }
  
  //todaysForecast[0=high, 1=low, 2=conditions, 3=pop]
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[2];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var oF = sheet.getRange(quoteNumber, 1); //row #, column #
  var ofQuote = oF.getValue(); //get quote
  
  var tweet = ofQuote + " Today's #chicago #forecast: " + todaysForecast[2] + ". " + todaysForecast[0] + "/" + todaysForecast[1] + ". " + todaysForecast[3] + "% precip.";
  
  Logger.log(tweet);
    
  sendTweet(tweet);
}

function forecastTomorrow() {
  //
  //
  // get the following day's forecast
  // 3x day: evening, night, night
  // include high, low, conditions, chance of precip
  // comment on it
  //
  //
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[1];
  var tmF;
  var tomorrowsForecast = new Array();
  
  for (var n=0; n<4; n++){
  tmF = sheet.getRange(3, n+1); //row #, column #
  tomorrowsForecast[n] = tmF.getValue();
  Logger.log(tomorrowsForecast[n]);
  }
  
  //tomorrowsForecast[0=high, 1=low, 2=conditions, 3=pop]
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[1];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var tF = sheet.getRange(quoteNumber, 1); //row #, column #
  var tfQuote = tF.getValue(); //get quote
  
  
  
  var tweet = tfQuote + " Tomorrow's  #chicago #forecast: " + tomorrowsForecast[2] + ". " + tomorrowsForecast[0] + "/" + tomorrowsForecast[1] + ". " + tomorrowsForecast[3] + "% precip.";
  
  Logger.log(tweet);
    
  sendTweet(tweet);
}

function currentTemp() {
  //
  //
  // get current temp
  // comment on it
  // every 2 hours
  //
  //
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[0];
  var cT = sheet.getRange(2, 3); //row #, column #
  var currentTemperature = cT.getValue();
  Logger.log(currentTemperature);
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[2];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var sheet2 = ss.getSheets()[6];
  var max2 = sheet2.getLastRow(); //find range of rows w/ quotes
  var quoteNumber2=Math.floor((Math.random()*max2)+1); //get random row
  
  var cC = sheet.getRange(quoteNumber, 1); //row #, column #
  var ccQuote = cC.getValue(); //get quote
  
  var cC2 = sheet2.getRange(quoteNumber2, 1);
  var ccQuote2 = cC2.getValue();
  
  var tweet = Math.round(currentTemperature) + " F " + ccQuote2 + ". " + ccQuote + " #chicago #weather";
  Logger.log(tweet);
    
  sendTweet(tweet);
  
}

function currentWind() {
  //
  //
  // get current wind speed
  //
  //
  var ss = SpreadsheetApp.openById("**Secret Code Here**");
  var sheet = ss.getSheets()[0];
  var cW = sheet.getRange(2, 2); //row #, column #
  var currentWind = cW.getValue();
  var cG = sheet.getRange(2, 7);
  var currentGust = cG.getValue();
  Logger.log(currentWind);
  Logger.log(currentGust);
  
  var ss = SpreadsheetApp.openById("**Secret Code Here**");
  var sheet = ss.getSheets()[2];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var sheet2 = ss.getSheets()[6];
  var max2 = sheet2.getLastRow(); //find range of rows w/ quotes
  var quoteNumber2=Math.floor((Math.random()*max2)+1); //get random row
  
  var cC = sheet.getRange(quoteNumber, 1); //row #, column #
  var ccQuote = cC.getValue(); //get quote
  
  var cC2 = sheet2.getRange(quoteNumber2, 1);
  var ccQuote2 = cC2.getValue();
  
  var tweet = Math.round(currentWind) + " mph winds " + ccQuote2 + ", gusts up to " + Math.round(currentGust) + " mph. " + ccQuote + " #chicago #weather";
  Logger.log(tweet);
    
  sendTweet(tweet);
}

function currentConditions() {
  //
  //
  // get current conditions
  // comment on it
  //
  //
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[0];
  var cC = sheet.getRange(2, 4); //row #, column #
  var currentConditions = cC.getValue();
  Logger.log(currentConditions);
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[2];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var sheet2 = ss.getSheets()[6];
  var max2 = sheet2.getLastRow(); //find range of rows w/ quotes
  var quoteNumber2=Math.floor((Math.random()*max2)+1); //get random row
  
  var sheet3 = ss.getSheets()[7];
  var pC = sheet3.getRange(1,1); //get conditions from an hour ago
  var previousConditions = pC.getValue();
  
  var cC = sheet.getRange(quoteNumber, 1); //row #, column #
  var ccQuote = cC.getValue(); //get quote
  
  var cC2 = sheet2.getRange(quoteNumber2, 1);
  var ccQuote2 = cC2.getValue(); //get "right now" synonym
  
  var tweet = currentConditions + " " + ccQuote2 + ". " + ccQuote + " #chicago #weather";
  //Logger.log(tweet);
  sheet3.appendRow([currentConditions]);
  sheet3.deleteRow(1);
  
  if (previousConditions !== currentConditions){ //only tweet if conditions have changed
  sendTweet(tweet);
  }
}

function getQuote() {
  //
  //
  // get quote
  //
  //
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[0];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+2); //get random row
  
  var sQ = sheet.getRange(quoteNumber, 1); //row #, column #
  var sljQuote = sQ.getValue(); //get quote
  
  var sA = sheet.getRange(quoteNumber, 2); //row#, column #
  var sljAttribution = sA.getValue(); //get attribution
  
  var tweet = sljQuote + "-" + sljAttribution;
   
  sendTweet(tweet);
}

function sunrise(){
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[3];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var sR = sheet.getRange(quoteNumber, 1); //row #, column #
  var sunriseQuote = sR.getValue(); //get quote
  
  var tweet = sunriseQuote;
  
  sendTweet(tweet);
}

function sunset(){
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[4];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var sS = sheet.getRange(quoteNumber, 1); //row #, column #
  var sunsetQuote = sS.getValue(); //get quote
  
  var tweet = sunsetQuote;
  
  sendTweet(tweet);
}

function midnight(){
 var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[5];
  var max = sheet.getLastRow(); //find range of rows w/ quotes
  var quoteNumber=Math.floor((Math.random()*max)+1); //get random row
  
  var mN = sheet.getRange(quoteNumber, 1); //row #, column #
  var midnightQuote = mN.getValue(); //get quote
  
  var tweet = midnightQuote;
  
  sendTweet(tweet); 
}