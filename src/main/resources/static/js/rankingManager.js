import EventBus from './eventBus.js';

/**
 * 排行榜管理模块
 * 处理排行榜数据的获取和显示
 */
const RankingManager = {
    cache: null,
    lastUpdate: 0,
    updateInterval: 60000, // 1分钟更新一次
    autoRefreshTimer: null,
    initialized: false,

    /**
     * 初始化排行榜管理器
     */
    async init() {
        if (this.initialized) {
            console.warn('RankingManager已经初始化');
            return;
        }

        try {
            console.log('RankingManager开始初始化...');
            // 先设置初始化状态
            this.initialized = true;
            
            // 获取初始数据
            await this.refreshRanking();
            
            // 启动自动刷新
            this.startAutoRefresh();
            
            console.log('RankingManager初始化完成');
        } catch (error) {
            console.error('排行榜管理器初始化失败:', error);
            this.initialized = false;
            throw error;
        }
    },

    /**
     * 刷新排行榜数据
     */
    async refreshRanking() {
        if (!this.initialized) {
            console.warn('RankingManager尚未初始化');
            return;
        }

        const now = Date.now();
        // 如果缓存未过期，直接使用缓存
        if (this.cache && now - this.lastUpdate < this.updateInterval) {
            this.updateTable(this.cache);
            return;
        }

        try {
            const response = await fetch('/api/user/ranking');
            if (!response.ok) {
                throw new Error(`获取排行榜失败: ${response.statusText}`);
            }
            
            const result = await response.json();
            // 确保数据是数组
            const data = Array.isArray(result) ? result : 
                        (result.data && Array.isArray(result.data) ? result.data : []);
            
            // 更新缓存
            this.cache = data;
            this.lastUpdate = now;
            this.updateTable(data);
        } catch (error) {
            console.error('获取排行榜失败:', error);
            // 如果获取失败但有缓存，继续使用缓存
            if (this.cache) {
                this.updateTable(this.cache);
            }
        }
    },

    /**
     * 更新排行榜表格
     * @private
     * @param {Array} data - 排行榜数据
     */
    updateTable(data) {
        const tbody = document.getElementById('rankingTableBody');
        if (!tbody) return;

        // 确保数据是数组
        if (!Array.isArray(data)) {
            console.error('排行榜数据格式错误:', data);
            return;
        }

        // 如果没有数据，显示空状态
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">暂无排行数据</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.nickname || '未知用户'}</td>
                <td>${item.maxScore || item.score || 0}</td>
                <td>${item.minTime || item.duration || 0}秒</td>
            </tr>
        `).join('');
    },

    /**
     * 开始自动刷新
     * @private
     */
    startAutoRefresh() {
        if (!this.initialized) {
            console.warn('RankingManager尚未初始化');
            return;
        }

        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }
        this.autoRefreshTimer = setInterval(() => this.refreshRanking(), this.updateInterval);
        console.log('排行榜自动刷新已启动');
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
        if (!this.initialized) {
            console.warn('RankingManager尚未初始化');
            return;
        }

        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
            console.log('排行榜自动刷新已停止');
        }
    }
};

export default RankingManager; 