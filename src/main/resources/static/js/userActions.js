import AuthManager from './authManager.js';

/**
 * 用户操作管理模块
 * 处理用户交互事件
 */
class UserActions {
    constructor() {
        this.initialized = false;
        this.errorTimeout = null;
    }

    /**
     * 初始化用户操作
     */
    async init() {
        if (this.initialized) {
            console.log('UserActions已经初始化，跳过');
            return;
        }
        console.log('UserActions开始初始化...');
        
        // 绑定事件处理器
        this.bindEvents();
        
        // 绑定历史记录模态框显示事件
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
            historyModal.addEventListener('show.bs.modal', () => this.updateHistory());
        }
        
        this.initialized = true;
        console.log('UserActions初始化完成');
    }

    bindEvents() {
        // 注册表单事件
        const registerForm = document.getElementById('registerForm');
        const registerBtn = document.getElementById('registerBtn');
        const registerNickname = document.getElementById('registerNickname');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        // 登录表单事件
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const loginNickname = document.getElementById('loginNickname');
        const loginPassword = document.getElementById('loginPassword');

        // 修改昵称表单事件
        const changeNicknameForm = document.getElementById('changeNicknameForm');
        const changeNicknameBtn = document.getElementById('changeNicknameBtn');
        const newNickname = document.getElementById('newNickname');

        // 开始测评按钮事件
        const startAssessmentBtn = document.getElementById('startAssessmentBtn');
        const startAdvancedChallengeBtn = document.getElementById('startAdvancedChallengeBtn');

        // 绑定输入事件
        if (registerNickname) {
            registerNickname.addEventListener('input', () => this.clearError(registerNickname));
        }
        if (registerPassword) {
            registerPassword.addEventListener('input', () => this.clearError(registerPassword));
        }
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.clearError(confirmPassword));
        }
        if (loginNickname) {
            loginNickname.addEventListener('input', () => this.clearError(loginNickname));
        }
        if (loginPassword) {
            loginPassword.addEventListener('input', () => this.clearError(loginPassword));
        }
        if (newNickname) {
            newNickname.addEventListener('input', () => this.clearError(newNickname));
        }

        // 绑定表单提交事件
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.handleRegister());
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }

        if (changeNicknameForm) {
            changeNicknameForm.addEventListener('submit', (e) => this.handleChangeNickname(e));
        }
        if (changeNicknameBtn) {
            changeNicknameBtn.addEventListener('click', () => this.handleChangeNickname());
        }

        if (startAssessmentBtn) {
            startAssessmentBtn.addEventListener('click', () => this.handleStartAssessment());
        }

        if (startAdvancedChallengeBtn) {
            startAdvancedChallengeBtn.addEventListener('click', () => {
                window.location.href = '/challenge/advanced';
            });
        }
    }

    // 清除错误状态
    clearError(element) {
        if (!element) return;
        element.classList.remove('is-invalid');
        const feedback = element.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    }

    // 显示错误信息
    showError(element, message) {
        if (!element) return;
        element.classList.add('is-invalid');
        let feedback = element.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            element.parentNode.insertBefore(feedback, element.nextSibling);
        }
        feedback.textContent = message;
    }

    /**
     * 验证密码强度
     * @private
     * @param {string} password - 待验证的密码
     * @returns {boolean} 密码是否有效
     */
    validatePassword(password) {
        // 实现密码验证逻辑
        return true; // 临时返回，需要根据实际需求实现
    }

    // 处理注册
    async handleRegister(event) {
        if (event) {
            event.preventDefault();
        }

        const nickname = document.getElementById('registerNickname').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 验证密码
        if (password !== confirmPassword) {
            this.showError(document.getElementById('confirmPassword'), '两次输入的密码不一致');
            return;
        }

        try {
            const user = await AuthManager.register(nickname, password);
            // 注册成功后自动登录
            try {
                await AuthManager.performLogin(nickname, password);
                // 登录成功后关闭注册模态框
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                if (registerModal) {
                    registerModal.hide();
                }
            } catch (loginError) {
                console.error('自动登录失败:', loginError);
                // 如果自动登录失败，显示登录模态框
                const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                if (registerModal) {
                    registerModal.hide();
                }
                loginModal.show();
            }
        } catch (error) {
            console.error('注册失败:', error);
            // 根据错误类型显示在对应的输入框
            if (error.message === '昵称已存在') {
                this.showError(document.getElementById('registerNickname'), error.message);
            } else if (error.message === '两次输入的密码不一致') {
                this.showError(document.getElementById('confirmPassword'), error.message);
            } else {
                // 其他错误显示在昵称输入框
                this.showError(document.getElementById('registerNickname'), error.message);
            }
        }
    }

    // 处理登录
    async handleLogin(event) {
        if (event) {
            event.preventDefault();
        }

        const nickname = document.getElementById('loginNickname').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await AuthManager.performLogin(nickname, password);
            // 登录成功后关闭模态框
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.hide();
            }
        } catch (error) {
            console.error('登录失败:', error);
            // 根据错误信息判断显示位置
            if (error.message === '用户不存在') {
                this.showError(document.getElementById('loginNickname'), error.message);
            } else if (error.message === '密码错误') {
                this.showError(document.getElementById('loginPassword'), error.message);
            } else {
                // 其他错误显示在昵称输入框
                this.showError(document.getElementById('loginNickname'), error.message);
            }
        }
    }

    // 处理修改昵称
    async handleChangeNickname(event) {
        if (event) {
            event.preventDefault();
        }

        const newNickname = document.getElementById('newNickname').value;

        try {
            await AuthManager.changeNickname(newNickname);
            // 修改成功后关闭模态框
            const changeNicknameModal = bootstrap.Modal.getInstance(document.getElementById('changeNicknameModal'));
            if (changeNicknameModal) {
                changeNicknameModal.hide();
            }
        } catch (error) {
            console.error('修改昵称失败:', error);
            this.showError(document.getElementById('newNickname'), error.message);
        }
    }

    /**
     * 处理开始测评的操作
     * 首先检查用户的登录状态，如果未登录则提示用户登录并显示登录模态框
     * 若已登录则关闭开始测评模态框并跳转到测评页面
     */
    async handleStartAssessment() {
        try {
            // 检查登录状态
            if (!AuthManager.isLoggedIn) {
                // 如果未登录，显示提示信息
                alert('请先登录');
                // 获取开始测评模态框实例
                const startModal = bootstrap.Modal.getInstance(document.getElementById('startModal'));
                // 若开始测评模态框存在，则隐藏该模态框
                if (startModal) startModal.hide();
                
                // 创建登录模态框实例
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                return;
            }

            // 关闭开始测评模态框
            const startModal = bootstrap.Modal.getInstance(document.getElementById('startModal'));
            if (startModal) {
                startModal.hide();
            }

            // TODO: 跳转到测评页面
            window.location.href = '/challenge';
        } catch (error) {
            console.error('开始测评失败:', error);
            alert('开始测评失败，请稍后重试');
        }
    }

    /**
     * 更新历史记录表格
     */
    async updateHistory() {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        if (!AuthManager.isUserLoggedIn()) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">请先登录</td></tr>';
            return;
        }

        try {
            const response = await fetch('/api/user/history');
            if (!response.ok) {
                throw new Error('获取历史记录失败');
            }

            const result = await response.json();
            if (result.code === 0 && result.data) {
                if (result.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" class="text-center">暂无历史记录</td></tr>';
                    return;
                }

                tbody.innerHTML = result.data.map(record => `
                    <tr>
                        <td>${new Date(record.createTime).toLocaleString()}</td>
                        <td>${record.score}分</td>
                        <td>${record.timeUsed}秒</td>
                    </tr>
                `).join('');
            } else {
                throw new Error(result.message || '获取历史记录失败');
            }
        } catch (error) {
            console.error('[历史记录] 获取历史记录失败:', error);
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">获取历史记录失败</td></tr>';
        }
    }
}

// 导出单例
export default new UserActions(); 