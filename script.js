// var baseurl = "http://127.0.0.1:5173/";
var baseurl = "songs/";
let currentSong = new Audio();
let songs = [];
var currFolder = "";




const playMusic = (track) => {
    if (currentSong.src == track) {
        if (currentSong.paused) {
            currentSong.play();
            playbutton.src = "icons/pause.svg";
        } else {
            currentSong.pause();
            playbutton.src = "icons/play.svg";
        }
        return;
    }
    currentSong.src = track;
    document.querySelector(".playbar").getElementsByClassName("songinfo")[0].innerHTML = track.split("/").pop().split(".")[0].replace(/%20/, " ");
    currentSong.play();

    playbutton.src = "icons/pause.svg";
}

function secondsToMMSS(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    var roundedMinutes = Math.round(minutes);
    var roundedSeconds = Math.round(remainingSeconds);
    var formattedMinutes = String(roundedMinutes).padStart(2, '0');
    var formattedSeconds = String(roundedSeconds).padStart(2, '0');
    var formattedTime = formattedMinutes + ':' + formattedSeconds;

    return formattedTime;
}


//Fetch the data from the server

async function getData(folder) {
    songs = [];
    currFolder = folder + '/';
    let a = await fetch(baseurl + currFolder)
    // let a = await fetch(`/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    //Show all the songs in the playlist

    document.querySelector(".songsList").getElementsByTagName("ul")[0].innerHTML = "";

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            let link = element.href;
            console.log(link)
            var filename = link.substring(link.lastIndexOf("/") + 1);

            songs.push(baseurl + currFolder + filename);
            console.log(baseurl + currFolder + filename);
            let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];

            songUL.innerHTML += `<li>
            <img class="invert" src="icons/music.svg" alt="Music">
            <div class="songinfo">
                ${filename.replace(".mp3", "").replace(/%20/, " ")}
            </div>
            <img class="invert playsquare" src="icons/playsquare.svg" alt="">
        </li>`
        }

    }

    //Add event listener to each song

    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            // console.log(e.querySelector(".songinfo").innerHTML.trim())
            console.log("clicked the song")
            playMusic(baseurl + currFolder + e.querySelector(".songinfo").innerHTML.trim() + ".mp3")
            console.log(baseurl + currFolder + e.querySelector(".songinfo").innerHTML.trim() + ".mp3")
        })
    })


    return songs;
}


async function displayAlbums(){
    console.log("displaying albums")
    // let a = await fetch(baseurl)
    let a = await fetch(`songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    let folders = []
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith("/")) {
            // console.log(element.href.split("/").slice(-2)[0])
            folders.push(element.href.split("/").slice(-2)[0])
        }
    }
    // console.log(folders)
    folders = folders.slice(1)
    folders.forEach(async (e) => {
        //get the metadata of the folder
        
        let a = await fetch(baseurl + e + "/metadata.json")
        let response = await a.json()
        // console.log(response)
    



        document.querySelector(".cardContainer").innerHTML += `<div data-folder="${e}" class="card">
    <div class="play">
        <div
            style="width: 50px; height: 50px; background-color: #1ed760; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
            <svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24"
                class="Svg-sc-ytk21e-0 bneLcE" style="width: 70%; height: 70%;">
                <path
                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                </path>
            </svg>
        </div>
    </div>
    <img src=${baseurl + e + "/cover.jpeg"}>
    <h2>${response.title}</h2>
    <p>${response.desc}</p>
</div>`;
    })
}



async function main() {
    await displayAlbums();
    let songs = await getData("English");
    
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        e.addEventListener("click", async item => {
            console.log(item.currentTarget.dataset.folder)
            songs = await getData(item.currentTarget.dataset.folder)
            document.querySelector(".left").style.left = '0%';
        })
    })






    //Play the song when clicked on the play button

    playbutton.addEventListener("click", () => {
        if (currentSong.paused) {
            // console.log("playing")
            currentSong.play()
            playbutton.src = playbutton.src.replace("play.svg", "pause.svg");
        } else {
            console.log(currentSong)
            currentSong.pause()
            playbutton.src = playbutton.src.replace("pause.svg","play.svg");
            console.log(playbutton.src)
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        let progress = (currentSong.currentTime / currentSong.duration) * 100;
        document.getElementById("songduration").innerHTML = `${secondsToMMSS(currentSong.currentTime)}/${secondsToMMSS(currentSong.duration)}`;
        document.getElementById("circle").style.width = progress + "%";
        // document.querySelector(".songinfo").innerHTML = currentSong.src.split("/").pop().split(".")[0];
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.offsetX)
        rect = e.target.getBoundingClientRect();
        let progress = (e.offsetX);
        let duration = currentSong.duration;
        currentSong.currentTime = (progress / rect.width) * duration;
    })

    document.querySelector(".burger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0%';
    })

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-100%';
    })

    document.getElementById("prevbutton").addEventListener("click", (e) => {
        const index = songs.indexOf(currentSong.src);
        // console.log(index)
        if (index == 0) {
            currentSong.play();
            return;
        }
        playMusic(songs[index - 1])
        currentSong.play();
    })

    document.getElementById("nextbutton").addEventListener("click", (e) => {
        const index = songs.indexOf(currentSong.src);
        console.log(index)
        if (index == songs.length - 1) {
            return;
        }
        playMusic(songs[index + 1])
    })

    document.querySelector(".volbar").addEventListener("click", (e) => {
        // console.log(e.offsetX)
        fullvol = e.target.getBoundingClientRect();
        let currvol = (e.offsetX);
        let vol = currentSong.volume;
        currentSong.volume = (currvol / fullvol.width);
        document.getElementById("volcircle").style.width = (currvol / fullvol.width) * 100 + "%";
    })

    document.querySelector(".volumebutton").addEventListener("click", () => {
        if (currentSong.volume == 0) {
            currentSong.volume = 1;
            document.getElementById("volcircle").style.width = "100%";
            document.getElementById("volume").src = "icons/highvol.svg"
        } else {
            currentSong.volume = 0;
            document.getElementById("volume").src = "icons/volumeoff.svg"
            document.getElementById("volcircle").style.width = "0%";
        }
    })

}

main()
