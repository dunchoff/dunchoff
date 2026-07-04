/*
 * Copyright (c) 2020. shtrih
 */
class Video {
    /**
     * @type Array videoURLs
     */
    constructor(videoURLs) {
        this._current_index = null;
        this._urls = [...videoURLs];
        window.__wheelVideoCount = this._urls.length;
        /**@type HTMLVideoElement */
        this._video = document.querySelector('video');
        /**@type HTMLSourceElement*/
        this._source = this._video.firstElementChild;
        this._range = document.getElementById('volume-control');
        this._loadVolume();
        this._range.addEventListener('change', () => {
            this.setVolume(this._range.value);
            this._saveVolume();
        });
        if (this._urls.length) {
            this.changeVideo();
        }
    }

    async play() {
        if (!this._urls.length) {
            return;
        }

        this.changeVideo();
        this._resetCurrentTime();
        this._video.volume = this.volume;
        this._video.loop = true;
        this._video.style.display = 'unset';
        await this._video.play();
    }

    pause() {
        this._video.loop = false;
        this._video.pause();
        this._video.style.display = 'none';
    }

    setVolume(number) {
        this._video.volume = number;
    }

    get volume() {
        return Number(this._range.value);
    }

    changeVideo(forceIndex) {
        if (!this._urls.length) {
            this._source.removeAttribute('src');
            this._video.load();
            return;
        }

        if (Number.isInteger(forceIndex)) {
            this._current_index = forceIndex;
        }
        else {
            this._current_index = this._getRandomIndex();
            if (this._urls.length > 1 && this._current_index === this._previous_index) {
                this._current_index = (this._current_index + 1) % this._urls.length;
            }
        }

        if (this._current_index >= this._urls.length) {
            this._current_index = 0;
        }

        this._previous_index = this._current_index;
        this._source.src = this._urls[ this._current_index ];
        if (Array.isArray(this._urls[ this._current_index ])) {
            this._source.src = this._urls[ this._current_index ][0];
        }

        this._video.load();
    }

    _getRandomIndex() {
        return Math.floor(Math.random() * this._urls.length);
    }

    _saveVolume() {
        localStorage.setItem('volume', this._range.value);
    }

    _loadVolume() {
        const vol = localStorage.getItem('volume');
        if (vol) {
            this._range.value = vol;
        }
    }

    _resetCurrentTime() {
        this._video.currentTime = 0;
        if (Array.isArray(this._urls[ this._current_index ])) {
            this._video.currentTime = this._urls[ this._current_index ][1] || 0;
        }
    }

    static _shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
