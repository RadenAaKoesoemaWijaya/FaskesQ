/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // Izinkan permintaan cross-origin dari lingkungan pengembangan Cloud Workstations.
        // Ini diperlukan agar Genkit UI dan fitur Next.js lainnya berfungsi dengan baik.
        allowedDevOrigins: ["*.cloudworkstations.dev"],
    }
};

export default nextConfig;
