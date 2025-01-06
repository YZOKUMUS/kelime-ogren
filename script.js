new Vue({
    el: '#app',
    data: {
        isTestStarted: false,
        wordCards: [],
        currentCardIndex: 0,
        currentOptions: [],
        correctAnswer: '',
        correctCount: 0,
        incorrectCount: 0,
        sureler: [],
        selectedSure: '',
        allWords: [],
        testCompleted: false
    },
    computed: {
        currentWord() {
            return this.wordCards[this.currentCardIndex] || {};
        },
        progressPercentage() {
            return this.totalQuestions > 0 
                ? ((this.correctCount + this.incorrectCount) / this.totalQuestions) * 100 
                : 0;
        },
        totalQuestions() {
            return this.wordCards.length;
        }
    },
    mounted() {
        this.loadJson();
    },
    methods: {
        loadJson() {
            const jsonUrl = 'https://raw.githubusercontent.com/YZOKUMUS/kelime-ogren/refs/heads/main/output.json';
            fetch(jsonUrl)
                .then(response => response.json())
                .then(data => {
                    const surelerSet = new Set(data.map(row => row.sure_adi));
                    this.sureler = Array.from(surelerSet);

                    this.allWords = data.map(row => ({
                        arabic: row['arabic_word'] || 'Bilinmiyor',
                        turkish: row['turkish_meaning'] || 'Bilinmiyor',
                        soundUrl: row['sound_url'] || '',
                        sureAdi: row['sure_adi'] || 'Bilinmiyor'
                    }));
                })
                .catch(err => {
                    console.error('Hata:', err);
                    alert('Kelime listesi yüklenirken bir hata oluştu.');
                });
        },

        selectSure(sure) {
            this.selectedSure = sure;
            this.wordCards = this.allWords.filter(word => word.sureAdi === sure);
            this.resetCounters();

            if (this.wordCards.length > 0) {
                this.shuffleArray(this.wordCards);
                this.isTestStarted = true;
                this.showOptions();
            } else {
                alert('Bu surede kelime bulunamadı.');
            }
        },

        resetCounters() {
            this.correctCount = 0;
            this.incorrectCount = 0;
            this.currentCardIndex = 0;
            this.testCompleted = false;
        },

        showOptions() {
            const correctOption = this.currentWord.turkish;
            const otherOptions = this.wordCards
                .filter((_, index) => index !== this.currentCardIndex)
                .map(card => card.turkish);

            const randomIncorrectOptions = this.shuffleArray(otherOptions).slice(0, 3);
            this.currentOptions = this.shuffleArray([correctOption, ...randomIncorrectOptions]);
            this.correctAnswer = correctOption;
        },

        checkAnswer(option) {
            if (option === this.correctAnswer) {
                this.correctCount++;
            } else {
                this.incorrectCount++;
            }
            this.nextWord();
        },

        nextWord() {
            if (this.currentCardIndex < this.wordCards.length - 1) {
                this.currentCardIndex++;
                this.showOptions();
            } else {
                this.testCompleted = true;
                this.isTestStarted = false;
                alert('Test tamamlandı!');
            }
        },

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    }
});
