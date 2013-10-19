function getJSON(aUrl,sheetname) {
  
  //
  // set up json feeds
  //
  
  // current conditions
  var ccUrl = "http://api.wunderground.com/api/**SecretCodeHere**/conditions/q/60605.json";
  var ccResp = UrlFetchApp.fetch(ccUrl); // get feed
  var ccData = Utilities.jsonParse(ccResp); // parse feed
  var ccPrefix = ccData.current_observation; // set prefix for json fields

  
  // forecast
  var fUrl = "http://api.wunderground.com/api/**fec317d14379b1a2**/forecast/q/60605.json";
  var fResp = UrlFetchApp.fetch(fUrl); // get feed
  var fData = Utilities.jsonParse(fResp); // parse feed
  var fPrefix = fData.forecast.simpleforecast; // set prefix for json fields
  
  //
  // end json feed info
  //
  
  //
  // set data columns for current conditions
  //
  
  var humidity = ccPrefix.relative_humidity;
 
  var wind = ccPrefix.wind_mph;
  
  var temp = ccPrefix.temp_f;
  
  var conditions = ccPrefix.weather;
  
  var heatIndex = ccPrefix.heat_index_f;
  
  var windChill = ccPrefix.wind_chill_f;
  
  ccSpreadsheet(humidity, wind, temp, conditions, heatIndex, windChill);
  
  
  
  //
  // set data columns for forecast
  //
  
  var high=new Array();
  
  var low=new Array();
  
  var conditionsForecast=new Array();
  
  var pop=new Array();
  
  
  for (var i=0;i<2;i++) {
  high[i] = fPrefix.forecastday[i].high.fahrenheit;
  low[i] = fPrefix.forecastday[i].low.fahrenheit;
  conditionsForecast[i] = fPrefix.forecastday[i].conditions;
  pop[i] = fPrefix.forecastday[i].pop;
  }
  
  fSpreadsheet(high, low, conditionsForecast, pop);
  
}
 
function ccSpreadsheet(humidity, wind, temp, conditions, heatIndex, windChill) {
  
  var ss = SpreadsheetApp.openById("Secret Code Here");
  var sheet = ss.getSheets()[0];
  sheet.appendRow([humidity, wind, temp, conditions, heatIndex, windChill]); //replace with condition data
  sheet.deleteRow(2);
  
}

function fSpreadsheet(high, low, conditionsForecast, pop) {
  
  var ss = SpreadsheetApp.openById("Secret Code Here");
  var sheet = ss.getSheets()[1];
  sheet.appendRow([high[0], low[0], conditionsForecast[0], pop[0]]); //replace with today's forecast
  sheet.appendRow([high[1], low[1], conditionsForecast[1], pop[1]]); //replace with tomorrow's forecast
  sheet.deleteRows(2, 2)
  
}

function sun(){
  var sunUrl = "http://api.wunderground.com/api/**SecretCodeHere**/astronomy/q/60605.json";
  var sunResp = UrlFetchApp.fetch(sunUrl); // get feed
  var sunData = Utilities.jsonParse(sunResp); // parse feed
  var sunPrefix = sunData.sun_phase; // set prefix for json fields
  
  var sunrisePrefix = sunPrefix.sunrise; //set hour and minute values for sunrise
  var sunriseH = sunrisePrefix.hour;
  var sunriseM = sunrisePrefix.minute;
  
  var sunsetPrefix = sunPrefix.sunset; //set hour and minute values for sunset
  var sunsetH = sunsetPrefix.hour;
  var sunsetM = sunsetPrefix.minute;
  
  var ss = SpreadsheetApp.openById("**SecretCodeHere**");
  var sheet = ss.getSheets()[2];
  sheet.deleteRow(2); //delete yesterday's data
  sheet.appendRow([sunriseH, sunriseM, sunsetH, sunsetM]); //hour, minute values
}