document.addEventListener("DOMContentLoaded", function () {
    const jsmediatags = window.jsmediatags;
    const colorThief = new ColorThief();
    let files = [];
    let currentIndex = 0;
    let isShuffle = false;
    const audio = document.createElement("audio");
    document.body.appendChild(audio);

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
                    const coverImageUrl = `data:${format};base64,${window.btoa(base64String)}`;
                    document.querySelectorAll(".carousel-item")[1].style.backgroundImage = `url(${coverImageUrl})`;
                    applyGradient(coverImageUrl);
                } else {
                    document.querySelectorAll(".carousel-item")[1].style.backgroundImage = '';
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

    function applyGradient(imageUrl) {
        const img = new Image();
        img.src = imageUrl;
        img.onload = function () {
            const color = colorThief.getColor(img);
            const gradient = `linear-gradient(rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5), rgba(0, 0, 0, 0.8))`;
            document.querySelector(".sub-container").style.background = gradient;
        };
    }

    function playSong(index) {
        if (index >= 0 && index < files.length) {
            audio.src = URL.createObjectURL(files[index]);
            audio.load();
            audio.play();
            currentIndex = index;
            loadTags(files[index]);

            loadCover(index - 1, 0);
            loadCover(index, 1);
            loadCover(index + 1, 2);

            const playlistItems = document.querySelectorAll("#playlist li");
            playlistItems.forEach((item, i) => {
                item.classList.toggle("selected", i === index);
            });
        }
    }

    function loadCover(index, carouselPosition) {
        if (index >= 0 && index < files.length) {
            jsmediatags.read(files[index], {
                onSuccess: function (tag) {
                    const data = tag.tags.picture?.data;
                    const format = tag.tags.picture?.format;
                    let base64String = "";

                    if (data) {
                        for (let i = 0; i < data.length; i++) {
                            base64String += String.fromCharCode(data[i]);
                        }
                        const coverImageUrl = `url(data:${format};base64,${window.btoa(base64String)})`;
                        document.querySelectorAll(".carousel-item")[carouselPosition].style.backgroundImage = coverImageUrl;
                    } else {
                        document.querySelectorAll(".carousel-item")[carouselPosition].style.backgroundImage = '';
                    }
                },
                onError: function (error) {
                    console.log(error);
                }
            });
        } else {
            document.querySelectorAll(".carousel-item")[carouselPosition].style.backgroundImage = '';
        }
    }

    document.querySelector("#input").addEventListener("change", (event) => {
        files = Array.from(event.target.files);
        const playlist = document.querySelector("#playlist");
        playlist.innerHTML = '';
        files.forEach((file, index) => {
            const li = document.createElement("button");
            li.textContent = file.name;
            li.className = "text-white bg-gradient-to-br w-full from-indigo-950 to-blue-700 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-500 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2";
            li.addEventListener("click", () => playSong(index));
            playlist.appendChild(li);
        });

        if (files.length > 0) {
            playSong(0);
        }
    });

    document.querySelector("#playPause").addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            document.querySelector("#playPause").innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            document.querySelector("#playPause").innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * files.length);
            playSong(randomIndex);
        } else {
            playSong(currentIndex < files.length - 1 ? currentIndex + 1 : 0);
        }
    });

    document.querySelector("#prev").addEventListener("click", () => {
        playSong(currentIndex > 0 ? currentIndex - 1 : files.length - 1);
    });

    audio.addEventListener("timeupdate", () => {
        const progress = document.querySelector("#progress");
        progress.value = (audio.currentTime / audio.duration) * 100 || 0;
        document.querySelector("#currentTime").textContent = formatTime(audio.currentTime);
        document.querySelector("#duration").textContent = formatTime(audio.duration);
    });

    document.querySelector("#progress").addEventListener("input", (event) => {
        audio.currentTime = (event.target.value / 100) * audio.duration;
    });

    document.querySelector("#volume").addEventListener("input", (event) => {
        audio.volume = event.target.value;
    });

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    //document.querySelector("#shuffle").addEventListener("click", () => {
      //  isShuffle = !isShuffle;
        //document.querySelector("#shuffle").classList.toggle("bg-blue-500", isShuffle);
    //});

    let startX;
    let isDragging = false;

    const carouselContainer = document.querySelector(".carousel-container");

    // Mouse events
    carouselContainer.addEventListener("mousedown", (event) => {
        console.log("Mouse down", event.clientX);
        startX = event.clientX;
        isDragging = true;
        event.preventDefault(); // Evitar selección de texto.
    });

    carouselContainer.addEventListener("mouseup", (event) => {
        if (isDragging) {
            const endX = event.clientX;
            if (endX < startX) {
                document.querySelector("#next").click();
            } else if (endX > startX) {
                document.querySelector("#prev").click();
            }
        }
        isDragging = false;
    });

    carouselContainer.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    // Touch events for mobile
    carouselContainer.addEventListener("touchstart", (event) => {
        startX = event.touches[0].clientX;
        isDragging = true;
        event.preventDefault(); // Prevenir comportamiento por defecto.
    });

    carouselContainer.addEventListener("touchend", (event) => {
        if (isDragging) {
            const endX = event.changedTouches[0].clientX;
            if (endX < startX) {
                document.querySelector("#next").click();
            } else if (endX > startX) {
                document.querySelector("#prev").click();
            }
        }
        isDragging = false;
    });
});
