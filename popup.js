document.addEventListener("DOMContentLoaded", async() => {
    const activeTab = await getCurrentTab();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");
    
    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo], (obj) => {
        const CurrentVideoBookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];
        viewBookmarks(CurrentVideoBookmarks);  
        })
    }else {
        document.getElementsByClassName("container")[0].innerHTML = "<div class='title'>This is not a Youtube video page</div>"
    }
});

const viewBookmarks = (currentBookmarks=[]) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length >0){
        for(let i=0; i<currentBookmarks.length; i++){
            addNewBookmark(bookmarksElement, currentBookmarks[i]);
        }
    }else{
        bookmarksElement.innerHTML = "<i class='row'>No bookmarks</i>"
    }
};

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.description;
    bookmarkTitleElement.className = "bookmark-title";

    newBookmarkElement.id = "bookmark" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    controlElement.className = "bookmark-controls";
    setBookmarkAttributes("play", onPlay, controlElement);
    setBookmarkAttributes("delete", onDelete, controlElement);
    
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

const setBookmarkAttributes =  (src, eventListener, ParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" +src +".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    ParentElement.appendChild(controlElement);
};

const onPlay = async(e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();
    
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    });
};

const onDelete = async(e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();
    const deletedBookmark = document.getElementById("bookmark" + bookmarkTime);
    
    deletedBookmark.parentNode.removeChild(deletedBookmark);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    });
};

async function getCurrentTab(){
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    return tab;
}
