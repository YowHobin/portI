"use client";

import { useEffect, useState } from "react";

interface PortInfo {
  protocol: string;
  localAddress: string;
  port: number;
  foreignAddress: string;
  foreignPort: number;
  state: string;
  pid: number;
}

declare global {
  interface Window {
    electronAPI: {
      platform: string;
      send: (channel: string, ...args: unknown[]) => void;
      on: (channel: string, func: (...args: unknown[]) => void) => void;
      getUsedPorts: () => Promise<PortInfo[]>;
    };
  }
}

export default function Home() {
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPorts() {
      try {
        const result = await window.electronAPI.getUsedPorts();
        setPorts(result);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ports");
        setLoading(false);
      }
    }

    fetchPorts();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading ports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black p-8">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-6">
        Used Ports ({ports.length})
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-900 rounded-lg shadow">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800 text-left text-sm text-zinc-600 dark:text-zinc-400">
              <th className="px-4 py-3">Protocol</th>
              <th className="px-4 py-3">Local Address</th>
              <th className="px-4 py-3">Port</th>
              <th className="px-4 py-3">Foreign Address</th>
              <th className="px-4 py-3">Foreign Port</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">PID</th>
            </tr>
          </thead>
          <tbody className="text-sm text-zinc-700 dark:text-zinc-300">
            {ports.map((port, index) => (
              <tr
                key={index}
                className="border-t border-zinc-200 dark:border-zinc-700"
              >
                <td className="px-4 py-2">{port.protocol}</td>
                <td className="px-4 py-2">{port.localAddress}</td>
                <td className="px-4 py-2 font-mono">{port.port}</td>
                <td className="px-4 py-2">{port.foreignAddress}</td>
                <td className="px-4 py-2 font-mono">{port.foreignPort}</td>
                <td className="px-4 py-2">{port.state}</td>
                <td className="px-4 py-2 font-mono">{port.pid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
