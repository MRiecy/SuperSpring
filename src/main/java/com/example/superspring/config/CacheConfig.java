package com.example.superspring.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * 定义一个 CacheManager Bean，用于管理缓存。
     * CacheManager 是 Spring 缓存抽象的核心接口，负责创建、管理和获取缓存实例。
     * 这里使用 ConcurrentMapCacheManager，它基于 ConcurrentHashMap 实现，适用于开发和测试环境。
     * 
     * @return CacheManager 实例，用于管理指定名称的缓存。
     */
    @Bean
    public CacheManager cacheManager() {
        // 创建一个 ConcurrentMapCacheManager 实例，用于管理基于内存的缓存
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        // 设置缓存管理器管理的缓存名称列表，这里只管理一个名为 "rankingCache" 的缓存
        cacheManager.setCacheNames(java.util.Arrays.asList("rankingCache"));
        return cacheManager;
    }
} 