# chu 

#####  已完成使用功能（后续添加中）:  ☑️ ✅

+ 显示指定位置项目文件 ✅
+ 显示当前项目中scripts ✅
+ 切换 npm registry url ✅（更多相关请使用 nrm)
+ 当前项目创建 iconfont 资源文件 ✅

### 安装
```shell
$ pnpm install @chu/cli -g
```

### 显示指定位置项目文件
```shell
# 使用前需要先设置 .churc 文件中 baseProjectsDirPaths 参数
$ chu config -s baseProjectsDirPaths ['xxx/xxx/xxx']

# 显示设置的默认工作项目文件夹项目下带有package.json 相关项目选项
$ chu project 

# 显示相关的项目带有筛选
$ chu project -f | --filter [name]

# 显示树状选折项目
$ chu project -c | --choose
```

### 显示当前项目中scripts 选折并执行
```shell
# 可选选折package.json 中设置的scripts 并执行
$ chu scripts

# 展示package.json 中设置的scripts
$ chu scripts -s | --show
```

### 切换 npm registry url 
```shell
# 可添加额外的注册切换地址
$ chu config -s otherNpmSource.xxxx 'https://xxx.xxxx.xxxx'

# 选择需要跟换的npm registry url
$ chu setting 

# 直接指定
$ chu setting -c | --choose <registry-name>
```

#### 当前项目创建 iconfont 资源文件
```shell
# 创建指定 iconfont id 的资源文件 默认保存文件夹为当前项目 src/assets/static/iconfont 类型为 Symbol 
$ chu iconfont -p | path xx/xx/xx -t | --type iconfontType -n | --name iconfont

# 如果当前文件夹下有chu.iconfont.config.json 文件则会根据该文件来生成
$ chu iconfont
```

[json schema](./packages/chu/config/chu.iconfont.schema.json)

```json
{
  "type": "Symbol",
  "path": "src/assets/static/iconfont",
  "name": "IconFontConfig",
  "unicode": {
    "iconfontClassName": "iconfont",
    "cdn": false,
    "suffixes": ["eot", "woff2", "woff", "ttf", "svg"]
  },
  "fontClass": {
    "cdn": false
  },
  "clear": true
}
```
