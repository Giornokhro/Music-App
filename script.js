document.addEventListener("DOMContentLoaded", function () {
    const jsmediatags = window.jsmediatags;
    let files = [];
    let currentIndex = 0;
    let isShuffle = false;
    const carousel = document.getElementById("carousel");

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
                    document.querySelectorAll(".carousel-item")[1].style.backgroundImage = `url(data:${format};base64,${window.btoa(base64String)})`;
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

    function playSong(index) {
        if (index >= 0 && index < files.length) {
            const audio = document.querySelector("#audio");
            audio.src = URL.createObjectURL(files[index]);
            audio.load();
            audio.play();
            currentIndex = index;
            loadTags(files[index]);

            // Update carousel
            const carouselItems = document.querySelectorAll(".carousel-item");
            carouselItems[0].style.backgroundImage = carouselItems[1].style.backgroundImage;
            carouselItems[1].style.backgroundImage = carouselItems[2].style.backgroundImage;
            if (index + 1 < files.length) {
                loadNextCover(files[index + 1]);
            } else {
                carouselItems[2].style.backgroundImage = '';
            }

            // Update playlist selection
            const playlistItems = document.querySelectorAll("#playlist li");
            playlistItems.forEach((item, i) => {
                item.classList.toggle("selected", i === index);
            });
        }
    }

    function loadNextCover(file) {
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                const data = tag.tags.picture?.data;
                const format = tag.tags.picture?.format;
                let base64String = "";

                if (data) {
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    document.querySelectorAll(".carousel-item")[2].style.backgroundImage = `url(data:${format};base64,${window.btoa(base64String)})`;
                } else {
                    document.querySelectorAll(".carousel-item")[2].style.backgroundImage = '';
                }
            },
            onError: function (error) {
                console.log(error);
            }
        });
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
            if (files.length > 1) {
                loadNextCover(files[1]);
            }
        }
    });

    document.querySelector("#playPause").addEventListener("click", () => {
        const audio = document.querySelector("#audio");
        if (audio.paused) {
            audio.play();
            document.querySelector("#playPause").innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            document.querySelector("#playPause").innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    document.querySelector("#stop").addEventListener("click", () => {
        const audio = document.querySelector("#audio");
        audio.pause();
        audio.currentTime = 0;
        document.querySelector("#playPause").innerHTML = '<i class="fas fa-play"></i>';
    });

    document.querySelector("#prev").addEventListener("click", () => {
        if (isShuffle) {
            playSong(Math.floor(Math.random() * files.length));
        } else {
            playSong(currentIndex > 0 ? currentIndex - 1 : files.length - 1);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        if (isShuffle) {
            playSong(Math.floor(Math.random() * files.length));
        } else {
            playSong(currentIndex < files.length - 1 ? currentIndex + 1 : 0);
        }
    });

    document.querySelector("#shuffle").addEventListener("click", () => {
        isShuffle = !isShuffle;
        document.querySelector("#shuffle").classList.toggle("bg-blue-500", isShuffle);
    });

    let startX;
    let isDragging = false;

    document.querySelector(".carousel-container").addEventListener("mousedown", (event) => {
        startX = event.clientX;
        isDragging = true;
        event.preventDefault();
        document.querySelector(".carousel-container").classList.add("carousel-dragging");
    });

    document.querySelector(".carousel-container").addEventListener("mouseup", (event) => {
        if (isDragging) {
            const endX = event.clientX;
            if (endX < startX) {
                document.querySelector("#next").click();
            } else if (endX > startX) {
                document.querySelector("#prev").click();
            }
            document.querySelector(".carousel-container").classList.remove("carousel-dragging");
        }
        isDragging = false;
        event.preventDefault();
    });

    document.querySelector(".carousel-container").addEventListener("mouseleave", () => {
        if (isDragging) {
            document.querySelector(".carousel-container").classList.remove("carousel-dragging");
        }
        isDragging = false;
    });

    // Touch events for mobile
    document.querySelector(".carousel-container").addEventListener("touchstart", (event) => {
        startX = event.touches[0].clientX;
        isDragging = true;
    });

    document.querySelector(".carousel-container").addEventListener("touchend", (event) => {
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
