import AuthManager from './authManager.js';
import EventBus from './eventBus.js';

/**
 * UI管理模块
 * 处理界面显示和更新
 */
const UIManager = {
    initialized: false,
    lastState: null,

    /**
     * 初始化UI管理器
     */
    async init() {
        if (this.initialized) {
            console.warn('UIManager已经初始化');
            return;
        }

        // 订阅登录状态变化事件
        EventBus.subscribe('loginStateChanged', async (isLoggedIn) => {
            console.log('登录状态变化:', isLoggedIn);
            await this.updateUI();
        });

        // 订阅用户信息变化事件
        EventBus.subscribe('userInfoChanged', async (userInfo) => {
            console.log('用户信息变化:', userInfo);
            await this.updateUI();
        });

        this.initialized = true;
        console.log('UIManager初始化完成');
    },

    /**
     * 更新UI状态
     */
    async updateUI() {
        // 获取当前状态
        const currentState = {
            isLoggedIn: AuthManager.isUserLoggedIn(),
            userInfo: AuthManager.getUserInfo()
        };

        // 检查状态是否发生变化
        const stateChanged = this.lastState?.isLoggedIn !== currentState.isLoggedIn ||
            JSON.stringify(this.lastState?.userInfo) !== JSON.stringify(currentState.userInfo);

        if (!stateChanged) {
            console.log('UI状态未发生变化，跳过更新');
            return;
        }

        console.log('开始更新UI');
        console.log('当前状态:', currentState);

        // 更新游客元素显示状态
        const guestContainer = document.querySelector('.guest-only');
        if (guestContainer) {
            console.log('更新游客容器显示状态');
            guestContainer.style.display = currentState.isLoggedIn ? 'none' : 'flex';
        }

        // 更新用户元素显示状态
        const userContainer = document.querySelector('.user-only');
        if (userContainer) {
            console.log('更新用户容器显示状态');
            userContainer.style.display = currentState.isLoggedIn ? 'inline-block' : 'none';
        }

        // 更新用户昵称显示
        const nicknameElement = document.querySelector('.user-dropdown .navbar-text');
        if (nicknameElement) {
            const displayName = currentState.isLoggedIn ? 
                currentState.userInfo.nickname : '游客';
            console.log('更新用户昵称显示:', displayName);
            nicknameElement.textContent = displayName;
        } else {
            console.warn('未找到用户昵称元素');
        }

        // 保存当前状态
        this.lastState = currentState;
        console.log('UI更新完成');
    }
};

export default UIManager; 