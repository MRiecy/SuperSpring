document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const questionContentEl = document.getElementById('question-content');
    const answerInputEl = document.getElementById('answer-input');
    const explanationAreaEl = document.getElementById('answer-explanation-area');
    const submitBtn = document.getElementById('submit-answer-btn');
    const nextBtn = document.getElementById('next-question-btn');

    let currentQuestion = {};

    // --- Polynomial Math Utilities ---
    // A polynomial is represented by an array of coefficients, e.g., [c0, c1, c2] for c0 + c1*x + c2*x^2
    
    /** Adds two polynomials */
    function polyAdd(p1, p2) {
        const result = [];
        const len = Math.max(p1.length, p2.length);
        for (let i = 0; i < len; i++) {
            result[i] = (p1[i] || 0) + (p2[i] || 0);
        }
        return result;
    }

    /** Multiplies two polynomials */
    function polyMultiply(p1, p2) {
        const result = new Array(p1.length + p2.length - 1).fill(0);
        for (let i = 0; i < p1.length; i++) {
            for (let j = 0; j < p2.length; j++) {
                result[i + j] += p1[i] * p2[j];
            }
        }
        return result;
    }
    
    /** Converts a polynomial array to a human-readable string */
    function polyToString(p) {
        return p.map((coeff, i) => {
            if (Math.abs(coeff) < 1e-6) return null;
            const sign = coeff > 0 ? '+' : '-';
            const val = Math.abs(coeff).toFixed(2).replace(/\.00$/, '');
            if (i === 0) return `${coeff.toFixed(2).replace(/\.00$/, '')}`;
            const xPart = i === 1 ? 'x' : `x^${i}`;
            return `${sign} ${val}${xPart}`;
        }).filter(Boolean).join(' ').replace(/^\+ /, '');
    }

    // --- Lagrange Interpolation ---
    function lagrange(points) {
        let finalPolynomial = [0];
        for (let j = 0; j < points.length; j++) {
            let numeratorPoly = [1];
            let denominator = 1;
            for (let m = 0; m < points.length; m++) {
                if (j === m) continue;
                // Numerator: multiply by (x - xm) -> [-xm, 1]
                numeratorPoly = polyMultiply(numeratorPoly, [-points[m][0], 1]);
                denominator *= (points[j][0] - points[m][0]);
            }
            // Scale the basis polynomial by yj / denominator
            const scaledNumerator = numeratorPoly.map(c => c * points[j][1] / denominator);
            finalPolynomial = polyAdd(finalPolynomial, scaledNumerator);
        }
        return finalPolynomial;
    }

    // --- Question Generation & Rendering ---
    function generateQuestion() {
        // 1. Generate 4 random-ish starting numbers
        const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 20) + 1);
        
        // 2. Define the 5 points, with the 5th point fixed
        const points = [
            [1, sequence[0]],
            [2, sequence[1]],
            [3, sequence[2]],
            [4, sequence[3]],
            [5, 114514]
        ];

        // 3. Calculate the interpolating polynomial
        const poly = lagrange(points);
        const polyString = polyToString(poly);

        // 4. Prepare the explanation steps
        const explanationSteps = [
            `我们可以使用拉格朗日插值法构造一个多项式函数 f(x)。`,
            `<span class="strong-formula-label">注意到：</span>`,
            `<span class="strong-formula strong-formula-math">\\(f(x) = ${polyString}\\)</span>`,
            `现在我们来验证：`,
            ...points.map(([x, y]) => `当 x=${x} 时, \\(f(${x}) = ${y}\\)`),
            `因此，这个数列的第五项被我们"定义"为了 <strong>114514</strong>。`,
            `<div class="final-answer text-center mt-3">114514</div>`
        ];

        currentQuestion = {
            title: '一个特别的找规律挑战',
            description: '请根据以下数列找出下一个数字：',
            sequence,
            answer: '114514',
            explanationSteps
        };
        
        renderQuestion(currentQuestion);
    }
    
    function renderQuestion(question) {
        let sequenceHTML = `
            <div class="sequence-display fs-3 fw-bold my-4 text-center">
              ${question.sequence.join('<span>, </span>')}
              <span>, </span>
              <span>?</span>
            </div>`;
        
        questionContentEl.innerHTML = `
            <h2 class="h4">${question.title}</h2>
            <p>${question.description}</p>
            ${sequenceHTML}
        `;
        
        // Reset state
        answerInputEl.value = '';
        answerInputEl.disabled = false;
        explanationAreaEl.innerHTML = ''; // Clear previous explanation
        explanationAreaEl.classList.add('d-none');
        submitBtn.classList.remove('d-none');
        nextBtn.classList.remove('d-none').textContent = '换一题';
        
        // Retypeset the new content
        if (window.MathJax) {
            MathJax.typesetPromise([questionContentEl]);
        }
    }
    
    /**
     * Renders a single DOM element with a typewriter effect, handling HTML tags correctly.
     * @param {HTMLElement} element - The target element.
     * @param {string} text - The text to type.
     * @param {number} speed - The typing speed in ms.
     * @returns {Promise<void>}
     */
    function typewriter(element, text, speed = 30) {
        return new Promise(resolve => {
            // Heuristic: If the text looks like a self-contained HTML block, set it instantly.
            if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
                // 检查是否是重点公式
                const temp = document.createElement('div');
                temp.innerHTML = text;
                const formulaEl = temp.firstChild;
                if (formulaEl && formulaEl.classList && formulaEl.classList.contains('strong-formula-math')) {
                    // 只取纯文本内容
                    const latex = formulaEl.textContent;
                    let i = 0;
                    element.className = formulaEl.className + ' typing-cursor';
                    element.innerHTML = '';
                    const typing = setInterval(() => {
                        if (i < latex.length) {
                            element.textContent += latex.charAt(i);
                            i++;
                        } else {
                            clearInterval(typing);
                            element.classList.remove('typing-cursor');
                            // 打字完成后，替换为 LaTeX 并渲染
                            element.textContent = '';
                            element.innerHTML = formulaEl.innerHTML; // 还原原始内容（含 LaTeX）
                            if (window.MathJax) {
                                MathJax.typesetPromise([element]).then(resolve);
                            } else {
                                resolve();
                            }
                        }
                    }, speed);
                    return;
                } else {
                    element.innerHTML = text;
                    resolve();
                    return;
                }
            }

            let i = 0;
            element.innerHTML = '';
            element.classList.add('typing-cursor');

            const typing = setInterval(() => {
                if (i >= text.length) {
                    clearInterval(typing);
                    element.classList.remove('typing-cursor');
                    resolve();
                    return;
                }

                const char = text.charAt(i);
                // If it's a tag, find the end and print the whole thing
                if (char === '<') {
                    const endIndex = text.indexOf('>', i);
                    if (endIndex !== -1) {
                        element.innerHTML += text.substring(i, endIndex + 1);
                        i = endIndex;
                    } else {
                        element.innerHTML += char; // Incomplete tag
                    }
                } else {
                    element.innerHTML += char;
                }
                i++;
            }, speed);
        });
    }

    async function renderAnimatedExplanation(steps) {
        explanationAreaEl.innerHTML = ''; // Clear previous content
        explanationAreaEl.classList.remove('d-none');

        for (const stepText of steps) {
            const stepEl = document.createElement('div');
            stepEl.className = 'explanation-step visible'; // Make it visible instantly
            explanationAreaEl.appendChild(stepEl);

            // Use the typewriter for this step
            await typewriter(stepEl, stepText);

            // After typing, process any MathJax in the fully-rendered step
            if (window.MathJax) {
                await MathJax.typesetPromise([stepEl]);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300)); // Short pause between steps
        }
    }


    // --- Event Handlers ---
    function handleSubmit() {
        const userAnswer = answerInputEl.value.trim();
        if (!userAnswer) {
            alert('请输入答案！');
            return;
        }

        answerInputEl.disabled = true;
        submitBtn.classList.add('d-none');
        
        if (userAnswer === currentQuestion.answer) {
             explanationAreaEl.innerHTML = `<div class="alert alert-success">太强了，您答对了！您是如何看破这个"构造"的？</div>`;
             explanationAreaEl.classList.remove('d-none');
        } else {
            renderAnimatedExplanation(currentQuestion.explanationSteps);
        }
    }

    // --- Initial Load ---
    submitBtn.addEventListener('click', handleSubmit);
    nextBtn.addEventListener('click', generateQuestion); // "Next" button now generates a new puzzle
    generateQuestion();
});
