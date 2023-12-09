var onlineTestApp = {
    quiz: {
        data: [], 
        quizServerUrl: 'http://localhost:3000/data',
        hWrap: null,
        hUserInput: null,
        hQn: null,
        hAns: null,
        now: 0,
        score: 0,
        username: '',

        init: function () {
            onlineTestApp.quiz.hWrap = document.getElementById("quizWrap");
            onlineTestApp.quiz.hUserInput = document.createElement("div");
            onlineTestApp.quiz.hUserInput.id = "quizUserInput";
            onlineTestApp.quiz.hWrap.appendChild(onlineTestApp.quiz.hUserInput);

            onlineTestApp.quiz.hUserInput.innerHTML = `
                <br><input type="text" class="form-control shadow-none" placeholder="Enter your name..." id="username" /><br>
                <button class="btn btn-outline-primary" onclick="onlineTestApp.quiz.fetchQuizData()">Start Quiz</button>
            `;

            let userHistoryTable = document.createElement("table");
            userHistoryTable.id = "userHistoryTable";
            userHistoryTable.classList.add("table");
            userHistoryTable.innerHTML = `
                <thead>
                    <tr>
                        <th scope="col">Username</th>
                        <th scope="col">Score</th>
                        <th scope="col">Total Questions</th>
                        <th scope="col">Emoji</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            onlineTestApp.quiz.hWrap.appendChild(userHistoryTable);

            let viewHistoryBtnContainer = document.createElement("div");
            viewHistoryBtnContainer.id = "viewHistoryBtn";
            onlineTestApp.quiz.hWrap.appendChild(viewHistoryBtnContainer);
        },

        fetchQuizData: function () {
            fetch(onlineTestApp.quiz.quizServerUrl)
                .then(response => response.json())
                .then(data => {
                    onlineTestApp.quiz.data = data;
                    onlineTestApp.quiz.start();
                })
                .catch(error => {
                    console.error('Error fetching quiz data:', error);
                    alert('Error fetching quiz data. Please try again later.');
                });
        },

        start: function () {
            onlineTestApp.quiz.username = document.getElementById("username").value;
            if (!onlineTestApp.quiz.username) {
                alert("Please enter your name to start the quiz");
                return;
            }

            document.getElementById("userHistoryTable").style.display = "none";
            onlineTestApp.quiz.hUserInput.innerHTML = "";
            onlineTestApp.quiz.hQn = document.createElement("div");
            onlineTestApp.quiz.hQn.id = "quizQn";
            onlineTestApp.quiz.hWrap.appendChild(onlineTestApp.quiz.hQn);
            onlineTestApp.quiz.hAns = document.createElement("div");
            onlineTestApp.quiz.hAns.id = "quizAns";
            onlineTestApp.quiz.hWrap.appendChild(onlineTestApp.quiz.hAns);

            onlineTestApp.quiz.draw();
        },

        draw: function () {
            onlineTestApp.quiz.hQn.innerHTML = onlineTestApp.quiz.data[onlineTestApp.quiz.now].question;
            onlineTestApp.quiz.hAns.innerHTML = "";
            onlineTestApp.quiz.data[onlineTestApp.quiz.now].options.forEach(function (option, i) {
                var radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "quiz";
                radio.id = "quizo" + i;
                onlineTestApp.quiz.hAns.appendChild(radio);
                var label = document.createElement("label");
                label.innerHTML = option;
                label.setAttribute("for", "quizo" + i);
                label.dataset.idx = i;
                label.addEventListener("click", function () {
                    onlineTestApp.quiz.select(label);
                });
                onlineTestApp.quiz.hAns.appendChild(label);
            });
        },

        select: function (option) {
            var all = onlineTestApp.quiz.hAns.getElementsByTagName("label");
            for (var i = 0; i < all.length; i++) {
                all[i].removeEventListener("click", onlineTestApp.quiz.select);
            }

            var correct = option.dataset.idx == onlineTestApp.quiz.data[onlineTestApp.quiz.now].answer;
            if (correct) {
                onlineTestApp.quiz.score++;
                option.classList.add("correct");
            } else {
                option.classList.add("wrong");
            }

            onlineTestApp.quiz.now++;
            setTimeout(function () {
                if (onlineTestApp.quiz.now < onlineTestApp.quiz.data.length) {
                    onlineTestApp.quiz.draw();
                } else {
                    onlineTestApp.quiz.showResult();
                }
            }, 1000);
        },

        showResult: function () {
            onlineTestApp.quiz.hQn.innerHTML = `${onlineTestApp.quiz.username}, you have answered ${onlineTestApp.quiz.score} of ${onlineTestApp.quiz.data.length} questions correctly.`;
            onlineTestApp.quiz.hAns.innerHTML = "";

            let isHighScore = onlineTestApp.quiz.score > onlineTestApp.quiz.data.length / 2;
            let emoji = isHighScore ? "😊" : "😢";
            onlineTestApp.quiz.hQn.innerHTML += `<br>${emoji}`;

            let userHistory = JSON.parse(localStorage.getItem('userHistory')) || [];
            const userResult = {
                username: onlineTestApp.quiz.username,
                score: onlineTestApp.quiz.score,
                totalQuestions: onlineTestApp.quiz.data.length
            };
            userHistory.push(userResult);
            localStorage.setItem('userHistory', JSON.stringify(userHistory));

            let viewHistoryBtn = document.createElement("button");
            viewHistoryBtn.innerHTML = "View Result History";
            viewHistoryBtn.classList.add("btn", "btn-outline-secondary");
            viewHistoryBtn.addEventListener("click", onlineTestApp.review.viewHistory);
            document.getElementById("viewHistoryBtn").appendChild(viewHistoryBtn);
        },

        quit: function () {
            alert("Thank you for taking the general quiz");
            location.reload();
        },
    },

    review: {
        init: function () {
            
        },

        viewHistory: function () {
            let userHistory = JSON.parse(localStorage.getItem('userHistory')) || [];
            let tableBody = document.getElementById("userHistoryTable").getElementsByTagName('tbody')[0];
            tableBody.innerHTML = "";

            userHistory.forEach(function (userResult) {
                let row = tableBody.insertRow(tableBody.rows.length);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let cell4 = row.insertCell(3);

                cell1.innerHTML = userResult.username;
                cell2.innerHTML = userResult.score;
                cell3.innerHTML = userResult.totalQuestions;

                let emoji = userResult.score > userResult.totalQuestions / 2 ? "😊" : "😢";
                cell4.innerHTML = emoji;
            });

            document.getElementById("userHistoryTable").style.display = "table";
            let viewHistoryBtn = document.getElementById("viewHistoryBtn").getElementsByTagName("button")[0];
            viewHistoryBtn.disabled = true;

            if (!document.getElementById("quitBtn")) {
                let quitBtnContainer = document.createElement("div");
                quitBtnContainer.id = "quitBtn";
                onlineTestApp.quiz.hWrap.appendChild(quitBtnContainer);
                let quitBtn = document.createElement("button");
                quitBtn.innerHTML = "Quit";
                quitBtn.classList.add("btn", "btn-outline-danger");
                quitBtn.addEventListener("click", onlineTestApp.quiz.quit);
                quitBtnContainer.appendChild(quitBtn);
            }
        },
    },

    result: {
        init: function () {

            onlineTestApp.result.declareResult();
        },

        declareResult: function () {

            fetch('http://localhost:3000/user_answers')
                .then(response => response.json())
                .then(userAnswers => {

                    let correctAnswers = onlineTestApp.quiz.data.map(question => question.answer);
                    let userScore = onlineTestApp.result.calculateScore(userAnswers, correctAnswers);

                    let resultContainer = document.createElement("div");
                    resultContainer.id = "resultContainer";
                    onlineTestApp.quiz.hWrap.appendChild(resultContainer);

                    resultContainer.innerHTML = `
                        <h2>Your Quiz Result</h2>
                        <p>You answered ${userScore} out of ${correctAnswers.length} questions correctly.</p>
                    `;
                })
                .catch(error => {
                    console.error('Error fetching user answers:', error);
                    alert('Error fetching user answers. Please try again later.');
                });
        },

        calculateScore: function (userAnswers, correctAnswers) {
            let score = 0;
            for (let i = 0; i < userAnswers.length; i++) {
                if (userAnswers[i] === correctAnswers[i]) {
                    score++;
                }
            }
            return score;
        },
    },

};

window.addEventListener("load", onlineTestApp.quiz.init);
