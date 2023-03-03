(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj,sender,response) => {
        const {type, value, videoId} = obj;

        if(type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        } else if(type === "PLAY"){
            youtubePlayer.currentTime = value;
        } else if(type === "DELETE"){
            updatedBookmark(value);
        }
    });

    const newVideoLoaded = () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0]

        if (!bookmarkBtnExists){
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
        
            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener("click",addNewBookmarkEventHandler);
        }
    }

    const  addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time:currentTime,
            description: "Bookmark at " + getTime(currentTime)
        };

        currentVideoBookmarks = await fetchBookmarks();

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a,b) => a.time - b.time))
        })
    };

    const  updatedBookmark = async (value) => {
        currentVideoBookmarks = await fetchBookmarks();
        currentVideoBookmarks = currentVideoBookmarks.filter((input) => input.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks)});
    };

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            });
        });
    }
})();

function getTime(t){
    var date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substring(11,19)
}