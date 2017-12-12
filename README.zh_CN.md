#   ceph-agent
__简易 CEPH 浏览器__

其他语言 / [English](./README.md)

##  快速开始

请执行全局安装：

```bash
npm install -g ceph-agent
```

在任意位置创建一个 JSON 文件并向其中写入 Ceph 存储服务的连接参数：

```javascript
{
    "endPoint"   : "http://storage.example.com/",
    "subuser"    : "userName:subUserName",
    "key"        : "380289ba59473a368c593c1f1de6efb0380289ba5",
    "container"  : "containerName"
}
```

执行 `ceph-agent` 命令，将保存有连接参数的文件路径作为参数：

```bash
ceph-agent swift.json
```

该命令将在本地 7000 端口启动一个 HTTP 服务作为访问 Ceph 存储内容的媒介。默认端口不可用时，将自动搜索更高端口。

![ceph-agent homepage](./docs/homepage.png)

##  帮助

```bash
# 显示帮助信息。
ceph-agent -h | --help

# 在指定端口启动代理服务。
ceph-agent -p | --port <port>

# 指定 CEPH 服务连接配置文件。
# 缺省时，ceph-agent 将在当前工作目录下尝试寻找名为 ceph.json 或 swift.json 文件。
ceph-agent -C | --connection <path/to/connection-config.json>
```

##  推荐

*   [ceph](https://www.npmjs.com/package/ceph)
*   [osapi](https://www.npmjs.com/package/osapi)