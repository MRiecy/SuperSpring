import EventBus from './eventBus.js';

/**
 * 认证管理模块
 * 处理用户认证状态和API调用
 */
const AuthManager = {
    isLoggedIn: false,
    userInfo: null,
    retryCount: 3,
    retryDelay: 1000,
    initialized: false,
    
    /**
     * 初始化认证管理器
     */
    async init() {
        if (this.initialized) {
            console.warn('AuthManager已经初始化');
            return;
        }

        try {
            // 先设置初始状态
            this.initialized = true;
            console.log('AuthManager开始初始化...');

            // 检查登录状态
            await this.checkLoginStatus();
            
            // 设置定时检查登录状态
            setInterval(() => this.checkLoginStatus(), 5 * 60 * 1000);
            
            console.log('AuthManager初始化完成');
        } catch (error) {
            console.error('认证管理器初始化失败:', error);
            // 确保发布未登录状态
            this.setLoginState(false, null);
            throw error;
        }
    },
    
    /**
     * 检查登录状态
     */
    async checkLoginStatus(retryCount = this.retryCount) {
        if (!this.initialized) {
            console.warn('AuthManager尚未初始化');
            return;
        }

        for (let i = 0; i < retryCount; i++) {
            try {
                const response = await fetch('/api/user/status');
                console.log(`[登录状态检测] HTTP状态:`, response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log(`[登录状态检测] 响应内容:`, result);
                // 检查响应格式
                if (result.code === 0 && result.data) {
                    console.log('[登录状态检测] 已登录，更新用户信息');
                    this.setLoginState(true, result.data);
                } else {
                    console.log('[登录状态检测] 未登录或数据无效，切换为游客');
                    this.setLoginState(false, null);
                }
                return;
            } catch (error) {
                console.error(`检查登录状态失败(第${i + 1}次):`, error);
                if (i === retryCount - 1) {
                    this.setLoginState(false, null);
                    throw error;
                } else {
                    await new Promise(resolve => 
                        setTimeout(resolve, this.retryDelay * Math.pow(2, i))
                    );
                }
            }
        }
    },
    
    /**
     * 执行登录请求
     * @param {string} nickname - 用户昵称
     * @param {string} password - 密码
     * @returns {Promise<boolean>} 登录是否成功
     */
    async performLogin(nickname, password) {
        try {
            console.log('[登录请求] 开始登录请求:', { nickname });
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, password })
            });
            
            const result = await response.json();
            console.log('[登录请求] 登录响应:', result);
            
            if (result.code === 0 && result.data) {
                this.setLoginState(true, result.data);
                return true;
            } else {
                throw new Error(result.message || '登录失败');
            }
        } catch (error) {
            console.error('[登录请求] 登录失败:', error);
            throw error;
        }
    },

    /**
     * 注册新用户
     * @param {string} nickname - 用户昵称
     * @param {string} password - 用户密码
     * @returns {Promise<User>} 注册成功的用户信息
     */
    async register(nickname, password) {
        try {
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    nickname, 
                    password,
                    confirmPassword: password // 确保两次密码一致
                })
            });

            const result = await response.json();
            if (result.code === 0) {
                console.log('[注册新用户] 注册成功:', result.data);
                return result.data;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('[注册新用户] 注册失败:', error);
            throw error;
        }
    },

    /**
     * 修改用户昵称
     * @param {string} newNickname - 新昵称
     * @returns {Promise<boolean>} 修改是否成功
     */
    async changeNickname(newNickname) {
        if (!this.isLoggedIn) {
            throw new Error('请先登录');
        }

        try {
            const response = await fetch('/api/user/nickname', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: this.userInfo.id,
                    newNickname 
                })
            });

            const result = await response.json();
            if (result.code === 0 && result.data) {
                this.userInfo = { ...this.userInfo, nickname: newNickname };
                EventBus.publish('userInfoChanged', this.userInfo);
                onsole.log('[修改昵称] 修改昵称成功:', result.data);
                return true;
            } else {
                throw new Error(result.message || '修改昵称失败');
            }
        } catch (error) {
            console.error('[修改昵称] 修改昵称失败:', error);
            throw error;
        }
    },
    
    /**
     * 执行登出请求
     */
    async performLogout() {
        try {
            const response = await fetch('/api/user/logout', { 
                method: 'POST' 
            });
            
            const result = await response.json();
            if (result.code === 0) {
                this.setLoginState(false, null);
            } else {
                throw new Error(result.message || '登出失败');
            }
        } catch (error) {
            console.error('登出请求失败:', error);
            // 即使请求失败，也清除本地状态
            this.setLoginState(false, null);
        }
    },

    /**
     * 设置登录状态
     * @private
     */
    setLoginState(isLoggedIn, userInfo) {
        if (!this.initialized) {
            console.warn('AuthManager尚未初始化');
            return;
        }

        // 检查状态是否真的发生变化
        const stateChanged = this.isLoggedIn !== isLoggedIn || 
            JSON.stringify(this.userInfo) !== JSON.stringify(userInfo);

        if (!stateChanged) {
            console.log('[登录状态] 登录状态未发生变化，跳过更新');
            return;
        }

        console.log('[登录状态] 设置登录状态:', { isLoggedIn, userInfo });
        this.isLoggedIn = isLoggedIn;
        this.userInfo = userInfo;

        // 只在状态真正变化时发布事件
        EventBus.publish('loginStateChanged', isLoggedIn);
        if (userInfo) {
            EventBus.publish('userInfoChanged', userInfo);
        }
        console.log('[登录状态] 登录状态已更新，当前状态:', this.isLoggedIn);
    },

    /**
     * 获取当前用户信息
     * @returns {Object|null} 用户信息
     */
    getUserInfo() {
        return this.userInfo;
    },

    /**
     * 检查是否已登录
     * @returns {boolean} 是否已登录
     */
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
};

export default AuthManager; 