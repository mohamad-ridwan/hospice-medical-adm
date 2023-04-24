/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  // redirects: async ()=>{
  //   return [
  //     {
  //       source: '/upload-article',
  //       destination: '/',
  //       permanent: false
  //     },
  //   ]
  // }
}

module.exports = nextConfig
