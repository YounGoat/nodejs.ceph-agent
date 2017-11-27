#   ceph-agent
__简易 CEPH 浏览器__

其他语言 / [English](./README.md)

##  快速开始

首先，创建一个 JSON 文件并向其中写入 Ceph 存储服务的连接参数：

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

该命令将在本地 7000 端口启动一个 HTTP 服务作为访问 Ceph 存储内容的媒介。

##  推荐

*   [ceph](https://www.npmjs.com/package/ceph)
*   [osapi](https://www.npmjs.com/package/osapi)