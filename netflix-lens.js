
console.log("loaded len");

// var allSubs = [];
var allPeople = [];
var allOrganizations = [];
var allPlaces = [];
var allTopics = [];
var allCapitals = [];

var activated;

var mo;
var myPort;

var sTitle = "";


createButton();

function createButton(){
    activated = false;
    var button = document.createElement('button');
    button.id = 'activate-lens-button';
    var buttonStyle = document.createElement('style');
    var css = "button#activate-lens-button{transition:all .5s ease;color:#fff;border:3px solid #fff;font-family:'Montserrat',sans-serif;text-transform:uppercase;text-align:center;line-height:1;font-size:17px;background-color:trasnparent;margin-left:100px;padding:1px;outline:none;border-radius:4px}button#activate-lens-button:hover{color:#001f3f;background-color:#fff}";
    if(buttonStyle.styleSheet) {    
        buttonStyle.styleSheet.cssText = css;
    } else {
        buttonStyle.appendChild(document.createTextNode(css));
    } 
    button.innerText = "lens!";
    button.appendChild(buttonStyle);
    button.addEventListener("click", toggleLens);
    var playerbar = document.getElementsByClassName("PlayerControlsNeo__button-control-row")[0];
    playerbar.insertBefore(button, playerbar.childNodes[5]);
}


function toggleLens() {
    var title = document.getElementsByClassName("ellipsize-text")[0];
    var name = "";
    name = String(title.childNodes[0].innerHTML);
    console.log('name of title: ' + name);
    sTitle = name;
    console.log("clicked");
    if(activated == false) {

        activated = true;
        var overlay = document.createElement('div');
        overlay.id = 'netflix-lens-panel';
        overlay.style.position = 'fixed';
        overlay.style.zIndex = 1000;
        overlay.style.right = 0;
        overlay.style.top = "30%";
        overlay.style.bottom = '30%';
        overlay.style.width = '300px';
        overlay.style.backgroundColor = 'rgba( 3, 213, 226 , 0.5)';
        overlay.style.overflow = 'auto';
        overlay.style.color = '#000';
        overlay.style.border = '2px solid black';
        
        var organizationDiv = createTopicSubSection("organizations");
        var peopleDiv = createTopicSubSection("people");
        var placesDiv = createTopicSubSection("places");
        var capitalsDiv = createTopicSubSection("possible");
    
        
        overlay.appendChild(organizationDiv);
        overlay.appendChild(peopleDiv);
        overlay.appendChild(placesDiv);
        overlay.appendChild(capitalsDiv);
        
        document.body.appendChild(overlay);
    
        main();
    } else {
        document.getElementById('netflix-lens-panel').style.display = 'none';
        activated = false;
        close();
    }
    
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

function handleSubs(subs){
    // allSubs.push(subs);
    console.log("sub recieved.");

    findWOI(subs);

}

function findWOI(subs) {
    myPort.postMessage({sub: String(subs)});
}

function createFandomURL(topic) {
    console.log("reated url");
    return "https://" + sTitle.replace(" ", "") +".fandom.com/api/v1/Search/List?query=" + topic.replace(" ", "+") + "&limit=25&minArticleQuality=10&batch=1&namespaces=0%2C14";
}


function addTopic(topic, category, link) {
    var link = document.createElement('a');
    link.href = link;
    var item = document.createElement('div');
    item.textContent = String(topic);
    item.style.whiteSpace = 'nowrap';
    item.style.padding = '10px 5px';
    link.appendChild(item);
    document.getElementById(category+"-section").appendChild(link);
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

function main() {
    
    startMessaging();
    //must be on the watch screen
    
    // browser.runtime.sendMessage();

    var subsDiv = document.querySelector('.player-timedtext');
    var subsSpans = subsDiv.getElementsByClassName('player-timedtext-text-container');
    let prevSubs;

    mo = new MutationObserver(() => {
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


}

function startMessaging() {
    
    myPort = browser.runtime.connect({name:"port-from-cs"});
    myPort.onMessage.addListener(function(m) {
    //console.log("In content script, received message from background script: ");
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

                    var link = "";
                    var fanURL = createFandomURL(capital);

                    console.log(fanURL);

                    window.fetch(url)
                    .then(response => response.json())
                    .then(data => { console.log(data); link = data.items[0]; });

                    addTopic(capital, "possible", link);

                    if(allCapitals.length > 6) {
                        //if more than 20 inside array, remove all old ones.
                        allCapitals.splice(0, allCapitals.length - 2);
                        removeAllChildNodes("possible");
                    }
                }
            });
        }
        
    });
}

function close() {
    mo.disconnect();
    myPort.disconnect();
}

/**
 * @TODO
 * 1. Wait until on the watch panel then detec title. 
 * 2. connect to fandom api for that title (if it exists)
 * 3. Search the fandom site for the term /api/v1/Search/List
 * 4. Make the UI better
 * 
 */
