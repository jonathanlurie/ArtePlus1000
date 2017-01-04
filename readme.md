# What?
Arte+1000JS is just a small browser side library, there is nothing graphic in it. Though, you can use it for your own fancy web project coupled with monsters like React/Angular and all the modern things they do these days.

Get the data from [Arte+7](http://www.arte.tv/guide/fr/plus7) TV programs. This contains:
- the title (text)
- the original URL on Arte+7 (text)
- the video information in several versions (depending on language and quality), with for each:
  - the URL to the MP4 file (text)
  - the bitrate (integer)
  - the width (integer)
  - the height (integer)
  - a label containing language, dubbing and possibly subtitle information (text)
- a cover image (url to jpg)
- a long abstract (text)
- a short abstract (text)
- the duration in second (integer)
- a list of suggestions to other Arte+7 programs, each containing the same info as mentioned above.


# How?
See the the relatively short `index.html`, but it's something like that:

```js
// create an instance of ArteParser
var ap = new ArteParser("http://www.arte.tv/guide/fr/062863-000-A/charlie-louise");
ap.fetchData();


// called when the TV program data are all fetched
ap.onLoaded( function(programData){
  console.log(programData);

  // Optional: Fetching the suggestions can be done only when the data for _this_ program are fetched
  ap.fetchSuggestions();
});

// An error may occur, i.e. if the program url does not lead to any program
ap.onError( function(msg){
  console.log(msg);
});

// Since we called ap.fetchSuggestions() earlier, we have to deal with the result, here an array
ap.onSuggestionsFetched( function(programDataArray){
  console.log(programDataArray);
})
```

Note: If you open `index.html` in a web browser, everything is displayed in console! (nothing in the page)

# License
MIT
