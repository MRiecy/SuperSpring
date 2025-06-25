// 闯关测评页面基础JS结构

let timer = 0;
let timerInterval = null;
let score = 0;
let currentQuestionIndex = 0;
let questions = [];
let challengeFinished = false;

// 初始化页面
window.onload = function() {
    console.log('[challenge] 页面加载，初始化测评模块');
    initChallenge();
};

/**
 * 初始化闯关测评
 * 该函数会获取题目数据，渲染第一题，重置分数和计时器，
 * 并为提交答案、下一题和关闭结束模态框按钮绑定点击事件。
 */
async function initChallenge() {
    console.log('[challenge] 开始获取题目...');
    questions = await fetchQuestions();
    console.log('[challenge] 题目获取完成:', questions);
    renderQuestion();
    // 调用 updateScore 函数将分数重置为 0
    updateScore(0);
    // 调用 startTimer 函数启动计时器
    startTimer();
    // 为提交答案按钮绑定点击事件，点击时调用 submitAnswer 函数
    document.getElementById('submit-answer-btn').onclick = submitAnswer;
    // 为下一题按钮绑定点击事件，点击时调用 nextQuestion 函数
    document.getElementById('next-question-btn').onclick = nextQuestion;
    // 为关闭结束模态框按钮绑定点击事件，点击时调用 returnToHome 函数返回首页
    document.getElementById('close-finish-modal-btn').onclick = returnToHome;
}

async function fetchQuestions() {
    try {
        const res = await fetch('/api/challenge/questions');
        const result = await res.json();
        console.log('[challenge] fetchQuestions result:', result);
        if (result.code === 0 && Array.isArray(result.data)) {
            return result.data;
        } else {
            alert('获取题目失败');
            return [];
        }
    } catch (e) {
        console.error('[challenge] 获取题目失败', e);
        alert('获取题目失败');
        return [];
    }
}

function startTimer() {
    timer = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timer++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function updateTimerDisplay() {
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    document.getElementById('challenge-timer').innerText = `用时：${min}:${sec}`;
}

function updateScore(newScore) {
    score = newScore;
    document.getElementById('challenge-score').innerText = `得分：${score}`;
}

function renderQuestion() {
    console.log('[challenge] 渲染题目', currentQuestionIndex, questions[currentQuestionIndex]);
    const area = document.getElementById('challenge-question-area');
    area.innerHTML = '';
    document.getElementById('answer-explanation-area').classList.add('d-none');
    document.getElementById('next-question-btn').classList.add('d-none');
    if (currentQuestionIndex >= questions.length) {
        console.log('[challenge] 所有题目已完成，进入测评结束流程');
        finishChallenge();
        return;
    }
    const q = questions[currentQuestionIndex];
    // 题干
    const qTitle = document.createElement('div');
    qTitle.className = 'question-title';
    qTitle.innerHTML = `${currentQuestionIndex + 1}. ${q.content.text || ''}`;
    area.appendChild(qTitle);
    // 答题控件
    if (q.type === 'multiple_choice' && Array.isArray(q.content.options)) {
        const isMulti = Array.isArray(q.answer.value) && q.answer.value.length > 1;
        q.content.options.forEach((opt, idx) => {
            const label = document.createElement('label');
            label.className = 'form-check-label me-3';
            const input = document.createElement('input');
            input.type = isMulti ? 'checkbox' : 'radio';
            input.name = 'answer';
            input.value = idx;
            input.className = 'form-check-input me-1';
            label.appendChild(input);
            // 加上 ABCD 标注
            label.appendChild(document.createTextNode(`${String.fromCharCode(65 + idx)}. ${opt}`));
            area.appendChild(label);
            area.appendChild(document.createElement('br'));
        });
    } else if (q.type === 'fill_blank') {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = 'answer';
        input.className = 'form-control w-auto d-inline-block';
        area.appendChild(input);
    }
    // 公式渲染
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([area]);
    }
}

function submitAnswer() {
    if (challengeFinished) return;
    const q = questions[currentQuestionIndex];
    let userAnswer;
    if (q.type === 'multiple_choice') {
        const checked = Array.from(document.querySelectorAll('input[name="answer"]:checked'));
        if (checked.length === 0) {
            alert('请选择一个答案');
            return;
        }
        userAnswer = checked.map(input => input.value);
    } else if (q.type === 'fill_blank') {
        const input = document.querySelector('input[name="answer"]');
        userAnswer = input.value.trim();
        if (!userAnswer) {
            alert('请填写答案');
            return;
        }
    }
    // 将索引转为字母
    const userAns = (Array.isArray(userAnswer) ? userAnswer : [userAnswer])
        .map(idx => String.fromCharCode(65 + Number(idx)));
    const correctAns = (Array.isArray(q.answer.value) ? q.answer.value : [q.answer.value]).map(String);
    // 判分：内容完全一致
    let correct = false;
    if (q.type === 'multiple_choice') {
        correct = correctAns.length === userAns.length && correctAns.every(a => userAns.includes(a));
    } else if (q.type === 'fill_blank') {
        if (Array.isArray(q.answer.value)) {
            correct = q.answer.value.some(ans => ans == userAnswer);
        } else {
            correct = userAnswer == q.answer.value;
        }
    }
    console.log('[challenge] 用户答案:', userAnswer, '正确答案:', q.answer.value, '判定:', correct);
    if (correct) {
        updateScore(score + (q.meta && q.meta.score ? q.meta.score : 10));
    }
    showExplanation(correct, q);
}

// 显示题目解析和反馈
function showExplanation(correct, q) {
    const area = document.getElementById('answer-explanation-area');
    // 显示解析区域并清空内容
    area.classList.remove('d-none');
    area.innerHTML = '';
    if (correct) {
        area.innerHTML = '<span style="color:green;">答对了！太棒了！</span>';
    } else {
        // 答错时构建解析内容
        let exp = '';
        // 检查是否有解析内容
        if (q.answer && q.answer.explanation) {
            // 添加文本解析（如果有）
            exp += q.answer.explanation.text ? q.answer.explanation.text + '<br>' : '';
            // 添加答案(LaTeX公式解析)（如果有）
            if (q.answer.explanation.latex) {
                exp += `<div>$$${q.answer.explanation.latex}$$</div>`;
                console.log('[challenge] 解析LaTeX公式:', q.answer.explanation.latex);
            }
        }
        // 显示错误信息、正确答案和解析
        area.innerHTML = `<span style="color:red;">答错了！</span><br>正确答案：${Array.isArray(q.answer.value) ? q.answer.value.join(',') : ''}<br>解析：${exp}`;
    }
    
    // 显示下一题按钮
    document.getElementById('next-question-btn').classList.remove('d-none');
    // 禁用提交答案按钮
    document.getElementById('submit-answer-btn').disabled = true;
    // 公式渲染
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([area]);
    }
    console.log('[challenge] 显示解析，判定结果:', correct);
}

function nextQuestion() {
    currentQuestionIndex++;
    document.getElementById('submit-answer-btn').disabled = false;
    if (currentQuestionIndex >= questions.length) {
        finishChallenge();
    } else {
        renderQuestion();
        console.log('[challenge] 跳转到下一题', currentQuestionIndex);
    }
}

async function finishChallenge() {
    if (challengeFinished && document.getElementById('challenge-finish-modal').classList.contains('show')) return;
    challengeFinished = true;
    stopTimer();
    
    // 保存测评记录
    try {
        const timeUsed = timer; // 直接使用timer变量，它已经记录了总秒数
        const response = await fetch('/api/user/assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                score: score,
                timeUsed: timeUsed
            })
        });
        
        if (!response.ok) {
            console.warn('[challenge] 保存测评记录失败');
        }
    } catch (error) {
        console.error('[challenge] 保存测评记录出错:', error);
    }

    // 更新排行榜
    try {
        const rankingResponse = await fetch('/api/user/ranking');
        if (rankingResponse.ok) {
            const result = await rankingResponse.json();
            if (result.code === 0 && result.data) {
                const rankingHtml = result.data.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.nickname || '未知用户'}</td>
                        <td>${item.maxScore || 0}</td>
                        <td>${item.minTime || 0}秒</td>
                    </tr>
                `).join('');
                document.getElementById('challenge-ranking').innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>排名</th>
                                <th>用户</th>
                                <th>最高分</th>
                                <th>用时</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rankingHtml}
                        </tbody>
                    </table>
                `;
            }
        }
    } catch (error) {
        console.error('[challenge] 获取排行榜失败:', error);
        document.getElementById('challenge-ranking').innerHTML = '<em>获取排行榜失败</em>';
    }

    // 显示结果
    const modal = document.getElementById('challenge-finish-modal');
    modal.classList.remove('d-none');
    modal.classList.add('show');
    modal.style.display = 'block';
    document.getElementById('final-time').innerText = document.getElementById('challenge-timer').innerText.replace('用时：','');
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-rating').innerText = getRating(score);
    console.log('[challenge] 测评结束，最终得分:', score);
}

function returnToHome() {
    const modal = document.getElementById('challenge-finish-modal');
    modal.classList.add('d-none');
    modal.classList.remove('show');
    modal.style.display = '';
    window.location.href = '/';
}

function getRating(score) {
    if (score >= 90) return 'S级';
    if (score >= 75) return 'A级';
    if (score >= 60) return 'B级';
    return 'C级';
} 