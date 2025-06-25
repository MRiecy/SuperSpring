# SuperSpring 项目说明

## 一、项目简介

SuperSpring 是一个基于 Spring Boot 3、MyBatis-Plus、Thymeleaf 的全栈 Web 项目，支持用户注册、登录、答题测评、排行榜等功能。前后端一体，前端无需单独构建。

---

## 二、环境要求

- **JDK 版本**：17（推荐 Oracle JDK 17.0.10）
- **Maven 版本**：3.9.9  
  ```
  Apache Maven 3.9.9 (8e8579a9e76f7d015ee5ec7bfcdc97d260186937)
  Maven home: D:\Apache Software Foundation\apache-maven-3.9.9
  Java version: 17.0.10, vendor: Oracle Corporation, runtime: C:\Program Files\Java\jdk-17
  Default locale: zh_CN, platform encoding: GBK
  OS name: "windows 11", version: "10.0", arch: "amd64", family: "windows"
  ```
- **数据库**：MySQL 8.x（需提前创建数据库 `math_attention`，并保证账号/密码与 `src/main/resources/application.yml` 配置一致，默认 root/101202）

---

## 三、快速启动

1. **数据库准备**
   - 创建数据库 `math_attention`，字符集推荐 `utf8mb4`。
   - 启动项目时会自动执行 `src/main/resources/db/migration` 下的 Flyway 脚本，自动建表和索引，无需手动导入 SQL。

2. **配置检查**
   - 如需修改数据库连接信息，请编辑 `src/main/resources/application.yml` 的 `spring.datasource` 部分。

3. **编译与运行**
   - 命令行进入项目根目录，执行：
     ```
     mvn clean package
     ```
   - 启动项目：
     ```
     mvn spring-boot:run
     ```
   - 默认访问地址：http://localhost:8080

4. **常见问题**
   - **构建反复失败**：如遇到测试相关报错或网络环境不佳导致依赖拉取失败，可尝试删除 `src/test` 目录后重新构建（本项目测试用例可选，不影响主功能）。
   - **端口占用**：如 8080 端口被占用，可在 `application.yml` 修改 `server.port`。

---

## 四、前端说明

- 前端资源已内嵌于 `src/main/resources/static`，无需单独构建。
- 依赖 Bootstrap、jQuery、MathJax 等均通过 WebJar 自动引入，无需额外配置。
- 推荐使用现代浏览器（Chrome/Edge/Firefox）访问。

---

## 五、其他补充

- **API 文档**：集成了 springdoc-openapi，访问 http://localhost:8080/swagger-ui.html 查看接口文档。
- **热部署**：已集成 Spring Boot Devtools，开发环境下支持热重载。
- **数据库自动迁移**：Flyway 自动管理数据库结构升级，脚本位于 `src/main/resources/db/migration`。
- **缓存**：内置简单缓存，排行榜等数据自动缓存 60 秒。

---

## 六、联系方式

如有问题请联系项目维护者，或在代码中查阅注释。

---

如需进一步定制 README 或补充其他内容，请告知！ 