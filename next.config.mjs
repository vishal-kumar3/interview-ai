/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		reactCompiler: {
			compilationMode: 'annotation',
    },
    serverActions: {
      bodySizeLimit: '10mb',
    }
	},
};

export default nextConfig;
