/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // redirects: async ()=>{
  //   return [
  //     {
  //       source: '/404',
  //       destination: '/not-found',
  //       permanent: false
  //     },
  //   ]
  // }
}

module.exports = nextConfig
