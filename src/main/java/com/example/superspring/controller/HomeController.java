package com.example.superspring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    /**
     * 访问首页
     * 
     * 当用户访问应用的根路径（例如 http://localhost:8080 ）时，
     * 此方法会被调用，将返回名为 "index" 的视图。
     * 
     * @param model Spring MVC 的 Model 对象，可用于向视图传递数据。
     *              本方法暂未使用该对象传递数据，但保留参数以便后续扩展。
     * @return 返回字符串 "index"，Spring MVC 会根据 Thymeleaf 配置查找对应的 "index.html" 视图文件。
     */
    @GetMapping("/")
    public String index(Model model) {
        // 返回名为 "index" 的视图
        return "index";
    }
} 