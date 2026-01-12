/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 允许从后端服务获取图片等资源
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '43.139.236.50',
            },
            {
                protocol: 'http',
                hostname: '192.168.191.168',
            },
        ],
    },
}

export default nextConfig
