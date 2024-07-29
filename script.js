document.addEventListener("DOMContentLoaded", function () {
    const jsmediatags = window.jsmediatags;
    let files = [];
    let currentIndex = 0;
    let isShuffle = false;

    function loadTags(file) {
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                const data = tag.tags.picture?.data;
                const format = tag.tags.picture?.format;
                let base64String = "";

                if (data) {
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    document.querySelector("#cover").style.backgroundImage = `url(data:${format};base64,${window.btoa(base64String)})`;
                } else {
                    document.querySelector("#cover").style.backgroundImage = '';
                }

                document.querySelector("#title").textContent = tag.tags.title || "No title";
                document.querySelector("#artist").textContent = tag.tags.artist || "No artist";
                document.querySelector("#album").textContent = tag.tags.album || "No album";
                document.querySelector("#genre").textContent = tag.tags.genre || "No genre";
            },
            onError: function (error) {
                console.log(error);
            }
        });
    }

    function playSong(index) {
        if (index >= 0 && index < files.length) {
            const audio = document.querySelector("#audio");
            audio.src = URL.createObjectURL(files[index]);
            audio.load();
            audio.play();
            currentIndex = index;
            loadTags(files[index]);

            // Update playlist selection
            const playlistItems = document.querySelectorAll("#playlist li");
            playlistItems.forEach((item, i) => {
                item.classList.toggle("selected", i === index);
            });
        }
    }

    function getRandomIndex() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * files.length);
        } while (newIndex === currentIndex);
        return newIndex;
    }

    document.querySelector("#input").addEventListener("change", (event) => {
        files = Array.from(event.target.files);

        // Populate playlist
        const playlist = document.querySelector("#playlist");
        playlist.innerHTML = '';
        files.forEach((file, index) => {
            const li = document.createElement("li");
            li.textContent = file.name;
            li.addEventListener("click", () => playSong(index));
            playlist.appendChild(li);
        });

        if (files.length > 0) {
            playSong(0); // Play the first song by default
        }
    });

    document.querySelector("#playPause").addEventListener("click", () => {
        const audio = document.querySelector("#audio");
        if (audio.paused) {
            audio.play();
            document.querySelector("#playPause").textContent = "Pause";
        } else {
            audio.pause();
            document.querySelector("#playPause").textContent = "Play";
        }
    });

    document.querySelector("#stop").addEventListener("click", () => {
        const audio = document.querySelector("#audio");
        audio.pause();
        audio.currentTime = 0;
        document.querySelector("#playPause").textContent = "Play";
    });

    document.querySelector("#prev").addEventListener("click", () => {
        if (files.length > 0) {
            if (isShuffle) {
                playSong(getRandomIndex());
            } else {
                let newIndex = (currentIndex - 1 + files.length) % files.length;
                playSong(newIndex);
            }
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        if (files.length > 0) {
            if (isShuffle) {
                playSong(getRandomIndex());
            } else {
                let newIndex = (currentIndex + 1) % files.length;
                playSong(newIndex);
            }
        }
    });

    document.querySelector("#shuffle").addEventListener("click", () => {
        isShuffle = !isShuffle;
        document.querySelector("#shuffle").textContent = isShuffle ? "Shuffle On" : "Shuffle Off";
    });

    document.querySelector("#audio").addEventListener("ended", () => {
        if (files.length > 0) {
            if (isShuffle) {
                playSong(getRandomIndex());
            } else {
                let newIndex = (currentIndex + 1) % files.length;
                playSong(newIndex);
            }
        }
    });
});
