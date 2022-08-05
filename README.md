# Turborepo starter with pnpm

This is an official starter turborepo.

## What's inside?

This turborepo uses [pnpm](https://pnpm.io) as a packages manager. It includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org) app
- `web`: another [Next.js](https://nextjs.org) app
- `ui`: a stub React component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

This repository is used in the `npx create-turbo@latest` command, and selected when choosing which package manager you wish to use with your monorepo (pnpm).

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm run build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm run dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
pnpx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your turborepo:

```
pnpx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Pipelines](https://turborepo.org/docs/core-concepts/pipelines)
- [Caching](https://turborepo.org/docs/core-concepts/caching)
- [Remote Caching](https://turborepo.org/docs/core-concepts/remote-caching)
- [Scoped Tasks](https://turborepo.org/docs/core-concepts/scopes)
- [Configuration Options](https://turborepo.org/docs/reference/configuration)
- [CLI Usage](https://turborepo.org/docs/reference/command-line-reference)



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


####### 
需要移除本地不需要的的 npm link xxxx 在无效的情况下  linux系统下可以尝试直接去 /usr/local/bin  下查找是否需要删除对应的文件


####
目标实现：
+ 快速切换配置本地npm源地址 ✅
+ 快速进入指定的前端项目
+ 本地快速创建基于资源的的函数文件
+ git tag 创建
