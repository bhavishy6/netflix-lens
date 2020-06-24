
console.log("loaded len");

// var allSubs = [];
var allPeople = [];
var allOrganizations = [];
var allPlaces = [];
var allTopics = [];
var allCapitals = [];



if(document.getElementById('netflix-lens-panel') == null) {

    var overlay = document.createElement('div');
    overlay.id = 'netflix-lens-panel';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = 1000;
    overlay.style.right = 0;
    overlay.style.top = 0;
    overlay.style.bottom = 0;
    overlay.style.width = '300px';
    overlay.style.backgroundColor = 'white';
    overlay.style.overflow = 'auto';
    overlay.style.color = '#000';
    
    var organizationDiv = createTopicSubSection("organizations");
    var peopleDiv = createTopicSubSection("people");
    var placesDiv = createTopicSubSection("places");
    var capitalsDiv = createTopicSubSection("possible");

    
    overlay.appendChild(organizationDiv);
    overlay.appendChild(peopleDiv);
    overlay.appendChild(placesDiv);
    overlay.appendChild(capitalsDiv);
    
    document.body.appendChild(overlay);

}

function createTopicSubSection(section) {
    var newDiv = document.createElement('div');
    newDiv.id = section+"-section";
    var title = document.createElement('h3');
    var text = document.createTextNode(section);
    title.appendChild(text);
    newDiv.appendChild(title);

    return newDiv;
}


var subsDiv = document.querySelector('.player-timedtext');
var subsSpans = subsDiv.getElementsByClassName('player-timedtext-text-container');
let prevSubs;

const mo = new MutationObserver(() => {
    const thisSpan = subsSpans[0];

    var thisSubs = "";

    thisSpan.childNodes.forEach(element => {
        thisSubs = thisSubs.concat(element.innerText.replace(/\n/g, " "));
    });

    if(thisSubs && thisSubs !== prevSubs) {
        prevSubs = thisSubs;

        handleSubs(prevSubs);
    }

});

mo.observe(subsDiv, { childList: true, subtree: true });


function handleSubs(subs){
    // allSubs.push(subs);
    console.log("sub recieved.");

    findWOI(subs);

}

let myPort = browser.runtime.connect({name:"port-from-cs"});
myPort.onMessage.addListener(function(m) {
//   console.log("In content script, received message from background script: ");
console.log("Found Topics: " +m.topics);

    if(m.topics.length > 0) {
        Array.prototype.push.apply(allTopics, m.topics);
    }

    if(m.organizations.length > 0) {
        Array.prototype.push.apply(allOrganizations, m.organizations); 
        m.organizations.forEach(org => {
            addTopic(org, "organizations");
        });
    }

    if(m.people.length > 0) {
        Array.prototype.push.apply(allPeople, m.people);
        m.people.forEach(person => {
            addTopic(person, "people");
        });
        
    }
    if(m.places.length > 0) {
        Array.prototype.push.apply(allPlaces, m.places);
        m.places.forEach(place => {
            addTopic(place, "places");
        });
    }
    
    console.log("Cap: " + m.capitals.toString());

    if(m.capitals.length > 0) {
        Array.prototype.push.apply(allCapitals, m.capitals);
        m.capitals.forEach(capital => {
            console.log(capital);
            addTopic(capital, "possible");
        });
    }
    
});


function findWOI(subs) {
    myPort.postMessage({sub: String(subs)});
}

function addTopic(topic, category) {
    var item = document.createElement('div');
    item.textContent = String(topic);
    item.style.whiteSpace = 'nowrap';
    item.style.padding = '10px 5px';

    document.getElementById(category+"-section").appendChild(item);
}

/**
 * @TODO
 * 1. remove duplicates from collected WOI
 * 2. Weed out bad 'possible' WOI
 * 3. Look up the terms
 * 4. Make the UI better
 * 
 */
