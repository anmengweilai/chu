## 新增 package

新增 package 有封装脚本，无需手动复制 `package.json` 等文件：

```bash
# 创建 package 目录
$ mkdir packages/foo
# 初始化 package 开发
$ pnpm bootstrap
```

```ts
   if (opts.pkgName === 'lodash') {
          // TODO  需要将 @types/lodash中 commons下申明复制
          const commonPath = path.join(
            opts.base,
            '/node_modules/@types/lodash/common',
          );
          await fs.mkdirp(opts.base + '/compiled/lodash/common');
          const commonFiles = fs.readdirSync(commonPath, { encoding: 'utf-8' });
          console.log({ commonFiles });
          commonFiles.forEach((name) => {
            const dtsPath = path.join(
              opts.base,
              `compiled/lodash/common/${name}`,
            );

            fs.copyFileSync(path.join(commonPath, name), dtsPath);
          });
        }
```


####### 开发
需要移除本地不需要的的 npm link xxxx 在无效的情况下  linux系统下可以尝试直接去 /usr/local/bin  下查找是否需要删除对应的文件


####
目标实现：
+ 快速切换配置本地npm源地址 ✅
+ 快速进入指定的前端项目
+ 本地快速创建基于资源的的函数文件
+ git tag 快速 指定
