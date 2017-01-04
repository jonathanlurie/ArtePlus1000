/**
* Constructor.
* @param {String} programURL - The URL of the TV program on Arte+7
*/
var ArteParser = function( programURL ){
  this._programURL = programURL;
  this._programID = null;
  this._programLang = null;
  this._rawData = null;
  this._programData = null;
  this._onLoadedCallback = null;
  this._onErrorCallback = null;
  this._onSuggestionsFetchedCallback = null;
  this._suggestions = [];
  this._numberOfSuggestion = 0;
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
  var that = this;

  if(this._programID){
    var jsonInfoURL = "https://api.arte.tv/api/player/v1/config/" +
      this._programLang + "/" + this._programID;

    getJSON(jsonInfoURL, function(data) {
      that._parseJsonObject(data);
    }, function(status) {
    	console.log('Something went wrong.');
    });

  }
}


/**
* @return the URL of the TV program
*/
ArteParser.prototype.getProgramURL = function(){
  this._programURL
}


/**
* [PRIVATE]
* Select some specific information to be kept among the pile of stuff we can find in the TV program related JSON file.
* This function is called by fetchData.
* @param {Object} jObj - TV program related JSON file parsed as an object.
*/
ArteParser.prototype._parseJsonObject = function(jObj){

  var that = this;

  // If the program URL is wrong, then we trigger the error callback and end.
  if("custom_msg" in jObj.videoJsonPlayer){
    if(this._onErrorCallback){
      this._onErrorCallback( jObj.videoJsonPlayer.custom_msg.msg );
    }
    return;
  }

  this._rawData = jObj;

  // Fetching basic info
  this._programData = {
    url: this._programURL,
    title: jObj.videoJsonPlayer.VTI,
    cover: jObj.videoJsonPlayer.VTU.IUR,
    duration: jObj.videoJsonPlayer.videoDurationSeconds,
    abstractShort: jObj.videoJsonPlayer.V7T,
    abstractLong: jObj.videoJsonPlayer.VDE
  }

  // temporary object to store the video list
  var videoList = [];

  // Fetching video info
  var videoKeys = Object.keys(jObj.videoJsonPlayer.VSR);
  videoKeys.forEach( function(tag){
    let videoObj = jObj.videoJsonPlayer.VSR[tag];

    if(videoObj.mimeType == "video/mp4"){
      videoList.push(
        {
          label: videoObj.versionLibelle,
          width: videoObj.width,
          height: videoObj.height,
          bitrate: videoObj.bitrate,
          url: videoObj.url
        }
      );
    }
  });

  this._programData.videoList = videoList;

  if(this._onLoadedCallback){
    this._onLoadedCallback( this._programData );
  }
}


/**
* Defines the callback when the data is entirely fetched.
* @param {function} cb - Callback. Called with one arg: the video data
*/
ArteParser.prototype.onLoaded = function( cb ){
  this._onLoadedCallback = cb;
}


/**
* Defines the callback when the data fetching failled.
* @param {function} cb - Callback. Called with one arg: the fail message
*/
ArteParser.prototype.onError = function( cb ){
  this._onErrorCallback = cb;
}


/**
* Defines a callback when all the data from the suggestions are fetched.
* @param {function} cb - callback. Called with one arg: the array of suggestions.
*/
ArteParser.prototype.onSuggestionsFetched = function( cb ){
  this._onSuggestionsFetchedCallback = cb;
}


/**
* Once fetchData is done, the suggestions for this TV program can be fetched too.
* Be sure to call this within the onLoaded() callback, otherwise, the data won't be ready.
* When all the suggestions are fetched, the onSuggestionsFetched() callback is called.
*/
ArteParser.prototype.fetchSuggestions = function(){
  if(!this._rawData){
    console.error("The method fetchData must be called first and the data must be valid. It's actually safer to call this method from the onLoaded() callback.");
    return;
  }

  var that = this;

  var postrollURL = this._rawData.videoJsonPlayer.postroll;
  //console.log(postrollURL);

  getJSON(postrollURL, function(data) {
    that._numberOfSuggestion =  data.videoList.length;

    // for each suggestion, we try to fetch it.
    data.videoList.forEach( function(vid){
      var suggestionProgramURL = vid.VUP;

      // we build an ArteParser for each suggestion too
      var sugg = new ArteParser(suggestionProgramURL);
      sugg.fetchData();

      // Much inception in this code!
      sugg.onLoaded( function(data){
        that._suggestions.push(data);

        if(that._suggestions.length == that._numberOfSuggestion){
          if(that._onSuggestionsFetchedCallback){
            that._onSuggestionsFetchedCallback(that._suggestions);
          }
        }
      });

    })

  }, function(status) {
    console.log('Something went wrong with the suggestions.');
  });

}
