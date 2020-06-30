let portFromCS;


function connected(p) {
  portFromCS = p;


  portFromCS.onMessage.addListener(function(m) {
    var subs = m.sub;
    
    var doc = nlp(subs);
    let topics = doc.topics().data().map(function(a) { return a.text.trim(); });
    let organizations = doc.organizations().match('(@isTitleCase)+').data().map(function(a) { return a.text.trim(); });
    let people = doc.people().match('(@isTitleCase)+').data().map(function(a) { return a.text.trim(); });
    let places = doc.places().match('(@isTitleCase)+').data().map(function(a) { return a.text.trim(); });
    let capitals = doc.match('(@isTitleCase)+').if('#ProperNoun').data().map(function(a) { return a.text.trim(); });
    //https://observablehq.com/@spencermountain/topics-named-entity-recognition
    //https://observablehq.com/@spencermountain/compromise-match-syntax
    //https://observablehq.com/@spencermountain/compromise-match
    portFromCS.postMessage({
      sub: subs,
      topics: topics,
      organizations: organizations,
      people: people,
      places: places,
      capitals: capitals
    });

  });
}


browser.runtime.onConnect.addListener(connected);
