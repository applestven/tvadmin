import { defineNuxtPlugin } from '#app'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 按需导入特定组件，如果全局导入有问题的话
import { Button, Table, Tag, Modal, Input, Form, Card, Row, Col, Layout, Menu, Dropdown, Space } from 'ant-design-vue'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Antd)

    // 如果需要按需导入，可以使用以下方式代替
    nuxtApp.vueApp.use(Button)
    // nuxtApp.vueApp.use(Table)
    // nuxtApp.vueApp.use(Tag)
    // ...
})