/**
* Constructor.
* @param {String} programURL - The URL of the TV program on Arte+7
*/
var ArteParser = function( programURL ){
  this._programURL = programURL;
  this._programID = null;
  this._programLang = null;
  this._programData = null;
  this._onLoadedCallback = null;

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
* [PRIVATE]
* Select some specific information to be kept among the pile of stuff we can find in the TV program related JSON file.
* This function is called by fetchData.
* @param {Object} jObj - TV program related JSON file parsed as an object.
*/
ArteParser.prototype._parseJsonObject = function(jObj){
  var that = this;

  // TODO: test validity
  // TODO: recuperer la collection
  // TODO: recuperer les reco (postroll)

  // Fetching basic info
  this._programData = {
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
