
console.log("loaded len");

// var allSubs = [];
var allPeople = [];
var allOrganizations = [];
var allPlaces = [];
var allTopics = [];
var allCapitals = [];

//must be on the watch screen
// var title = document.getElementsByClassName("ellipsize-text");

// browser.runtime.sendMessage();
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
            organization = org.replace(/[.,\/#?!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");

            if(!allOrganizations.includes(organization)){
                allOrganizations.push(organization);
                addTopic(org, "organizations");

                if(allOrganizations.length > 20) {
                    allOrganizations.splice(0, allOrganizations.length - 2);
                    removeAllChildNodes("organizations");
                }
            }
        });
    }

    if(m.people.length > 0) {
        m.people.forEach(per => {
            person = per.replace(/[.,\/#?!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");

            if(!allPeople.includes(person)) {
                allPeople.push(person);
                addTopic(person, "people");

                if(allPeople.length > 20) {
                    allPeople.splice(0, allPeople.length - 2);
                    removeAllChildNodes("people");
                }
            }
        });
        
    }
    if(m.places.length > 0) {
        m.places.forEach(pl => {
            place = pl.replace(/[.,\/#?!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");

            if(!allPlaces.includes(place)) {
                allPlaces.push(place);
                addTopic(place, "places");

                if(allPlaces.length > 20) {
                    allPlaces.splice(0, allPlaces.length - 2);
                    removeAllChildNodes("places");
                }
            }
        });
    }
    
    console.log("Cap: " + m.capitals.toString());

    if(m.capitals.length > 0) {
        m.capitals.forEach(cap => {
            capital = cap.replace(/[.,\/#?!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");

            if(!allCapitals.includes(capital)) {
                allCapitals.push(capital);
                addTopic(capital, "possible");

                if(allCapitals.length > 6) {
                    //if more than 20 inside array, remove all old ones.
                    allCapitals.splice(0, allCapitals.length - 2);
                    removeAllChildNodes("possible");
                }
            }
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

function removeAllChildNodes(category) {
    var sec = document.getElementById(category+"-section");
    var divs = sec.getElementsByTagName("div");
    if(divs !== null) {
        for(var v = divs.length - 1; v >= 2; v--) {
            sec.removeChild(divs[0]);
        }
    }
}

/**
 * @TODO
 * 1. Wait until on the watch panel then detec title. 
 * 2. connect to fandom api for that title (if it exists)
 * 3. Search the fandom site for the term /api/v1/Search/List
 * 4. Make the UI better
 * 
 */
