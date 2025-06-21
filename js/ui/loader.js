// src/ui/loader.js

class LoaderManager {
    constructor() {
        this.loaderElement = document.getElementById('flight-loader');
        this.isVisible = false;
    }

    show() {
        if (this.loaderElement && !this.isVisible) {
            this.loaderElement.classList.remove('hidden');
            this.isVisible = true;
            console.log('Loader показан');
        }
    }

    hide() {
        if (this.loaderElement && this.isVisible) {
            this.loaderElement.classList.add('hidden');
            this.isVisible = false;
            console.log('Loader скрыт');
        }
    }

    setText(text) {
        if (this.loaderElement) {
            const textElement = this.loaderElement.querySelector('.loader-text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
    }
}

const loaderManager = new LoaderManager();
export { loaderManager }; 