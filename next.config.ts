import type { NextConfig } from "next";
import os from "os";

// Gather all local IPv4 addresses so any phone on the Wi-Fi or hotspot is permitted by Next.js
const localIps: string[] = [];
try {
  const nets = os.networkInterfaces();
  for (const n of Object.keys(nets)) {
    for (const net of nets[n] || []) {
      if (net.family === "IPv4") {
        localIps.push(net.address);
      }
    }
  }
} catch {
  /* fallback */
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ...localIps,
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "*.local",
    "*.lhr.life",
    "*.loca.lt",
  ],
};

export default nextConfig;
