/**
* Constructor.
* @param {String} programURL - The URL of the TV program on Arte+7
*/
var ArteParser = function( programURL ){
  this._programURL = programURL;
  this._programID = null;
  this._programLang = null;

  this._extractProgramID();

}


/**
* Extract the unique ID using the programURL
*/
ArteParser.prototype._extractProgramID = function(){
  var reURLPattern = /arte.tv[\/]guide[\/]([\S]{2})[\/](.*)[\/](.*)/g;
  var match  = reURLPattern.exec( this._programURL );

  if(match){
    this._programLang = match[1];
    this._programID = match[2];
  }

}


/**
* Get some data from the JSON file
*/
ArteParser.prototype.fetchData = function(){

  if(this._programID){
    var jsonInfoURL = "https://api.arte.tv/api/player/v1/config/" +
      this._programLang + "/" + this._programID;

    console.log(jsonInfoURL);
  }

}
