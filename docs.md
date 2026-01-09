# 管理后台前端技术栈规范

Ant Design Pro + TailwindCSS + TypeScript （前后端分离）

---

Ant Design Pro 开箱即用

✅ 登录 / 注册

✅ 账号管理

✅ 菜单权限、按钮权限

✅ 多角色

✅ Layout / 菜单 / 面包屑全有

✅ 请求封装、Token 处理


## 目录

- [管理后台前端技术栈规范](#管理后台前端技术栈规范)
  - [目录](#目录)
  - [一、技术选型](#一技术选型)
  - [二、样式职责划分](#二样式职责划分)
    - [明确禁止](#明确禁止)
  - [三、项目初始化与 Tailwind 集成](#三项目初始化与-tailwind-集成)
  - [四、工程目录结构](#四工程目录结构)
  - [五、页面开发规范](#五页面开发规范)
  - [六、权限规范](#六权限规范)
    - [权限数据结构](#权限数据结构)
    - [access.ts 示例](#accessts-示例)
    - [权限组件封装（推荐）](#权限组件封装推荐)
  - [七、请求规范](#七请求规范)
  - [八、代码约束](#八代码约束)
  - [九、明确不做的事](#九明确不做的事)
  - [十、一句话总结](#十一句话总结)

---

## 一、技术选型

| 分类          | 技术               | 说明                 |
| ------------- | ------------------ | -------------------- |
| 框架          | React 18           | 函数组件             |
| 脚手架        | Ant Design Pro     | Layout / 权限 / 路由 |
| 路由          | Umi Max            | 约定式               |
| UI 组件       | Ant Design 5       | 表单 / 表格          |
| 布局&原子样式 | TailwindCSS        | 间距 / flex / grid   |
| 样式补充      | CSS Module（LESS） | 页面级复杂样式       |
| 状态管理      | useModel           | 轻量                 |
| 请求库        | umi-request        | 前后端分离           |
| 权限模型      | RBAC               | 内置 Access          |

> Tailwind 是必要组成部分，但不替代 AntD

---

## 二、样式职责划分

这是工程能长期维护的关键。

| 场景                | 方案       |
| ------------------- | ---------- |
| 表单 / 表格 / Modal | Ant Design |
| 布局 / 间距 / 排版  | Tailwind   |
| 复杂视觉样式        | CSS Module |
| 全局变量            | AntD Token |

### 明确禁止

- ❌ 用 Tailwind 重写 AntD 组件样式
- ❌ 在 AntD 组件里堆大量 className
- ❌ Tailwind + styled-components 混用

---

## 三、项目初始化与 Tailwind 集成

1. **创建 Ant Design Pro 项目**

   ```shell
   npx @ant-design/pro-cli create admin-web
   cd admin-web
   ```

2. **安装 Tailwind**

   ```shell
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init
   ```

3. **配置 `tailwind.config.js`**

   ```js
   module.exports = {
     content: ['./src/**/*.{js,ts,jsx,tsx}'],
     corePlugins: {
       preflight: false, // 关键：避免影响 AntD
     },
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

4. **引入 Tailwind**

   ```less
   /* src/global.less */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

> ⚠️ `preflight: false` 是必须项

---

## 四、工程目录结构

```text
src/
├── app.tsx                # 初始化
├── access.ts              # 权限控制
├── global.less            # Tailwind + 全局变量
│
├── services/              # API 层（前后端分离）
│   ├── request.ts
│   ├── auth.ts
│   └── user.ts
│
├── models/                # 全局状态
│   └── global.ts
│
├── pages/                 # 页面
│   ├── Login/
│   │   ├── index.tsx
│   │   └── index.module.less
│   ├── Dashboard/
│   └── System/
│       ├── User/
│       │   ├── index.tsx
│       │   └── index.module.less
│       └── Role/
│
├── components/            # 通用组件
│   ├── Permission/
│   ├── PageHeader/
│   └── Empty/
│
├── layouts/               # 自定义 Layout（可选）
│
├── utils/                 # 工具函数
│
├── constants/             # 常量
│
└── types/                 # 全局类型定义
```

---

## 五、页面开发规范

标准页面结构示例：

```tsx
import { PageContainer } from '@ant-design/pro-components';

const UserList: React.FC = () => {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">用户列表</h2>
          <Button type="primary">新增</Button>
        </div>
        <ProTable />
      </div>
    </PageContainer>
  );
};

export default UserList;
```

---

## 六、权限规范

### 权限数据结构

```js
{
  roles: ['admin'],
  permissions: [
    'user:view',
    'user:create'
  ]
}
```

### access.ts 示例

```js
export default (initialState) => ({
  canUserView: initialState.permissions.includes('user:view'),
  canUserCreate: initialState.permissions.includes('user:create'),
});
```

### 权限组件封装（推荐）

```tsx
const Permission: React.FC<{ code: string }> = ({ code, children }) => {
  const access = useAccess();
  return access[code] ? <>{children}</> : null;
};

// 使用示例
<Permission code="canUserCreate">
  <Button type="primary">新增</Button>
</Permission>
```

---

## 七、请求规范

统一请求封装：

```js
// services/request.ts
import { request } from '@umijs/max';

export const http = (url: string, options = {}) =>
  request(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
```

---

## 八、代码约束

- 页面只负责 UI
- API 只能在 services
- 权限判断统一走 Access / Permission 组件
- Tailwind 只做布局，不做主题

---

## 九、明确不做的事

- ❌ Tailwind 主题化 AntD
- ❌ 多套 UI 框架
- ❌ 微前端
- ❌ Redux / Zustand

---

## 十、一句话总结

> Ant Design Pro 负责“稳”，TailwindCSS 负责“快”，CSS Module 兜底复杂样式


