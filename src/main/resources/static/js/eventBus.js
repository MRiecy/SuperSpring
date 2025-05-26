/**
 * 事件总线模块
 * 用于模块间通信
 */
const EventBus = {
    /**
     * 事件订阅者列表
     * @private
     */
    subscribers: {},

    /**
     * 初始化事件总线
     */
    init() {
        this.subscribers = {};
        console.log('EventBus初始化完成');
    },

    /**
     * 发布事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    publish(event, data) {
        if (!this.subscribers[event]) return;
        
        this.subscribers[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`事件处理错误 [${event}]:`, error);
            }
        });
    },

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消订阅的函数
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        
        this.subscribers[event].push(callback);
        
        // 返回取消订阅的函数
        return () => {
            this.subscribers[event] = this.subscribers[event]
                .filter(cb => cb !== callback);
        };
    },

    /**
     * 清理所有订阅
     */
    cleanup() {
        this.subscribers = {};
    }
};

export default EventBus; 