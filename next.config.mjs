/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
        ],
    },
    allowedDevOrigins: [
        'https://3000-firebase-faskesq-1757518626084.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev',
        'http://3000-firebase-faskesq-1757518626084.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev'
    ],
};

export default nextConfig;
