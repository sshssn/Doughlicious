/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: '138688801.cdn6.editmysite.com',
            },
            {
                protocol: 'https',
                hostname: '**.editmysite.com',
            },
        ],
    },
};

export default nextConfig;
