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
  processName: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [protocolFilter, setProtocolFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const filteredPorts = ports.filter((port) => {
    const matchesSearch =
      searchQuery === "" ||
      port.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.localAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.port.toString().includes(searchQuery) ||
      port.foreignAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.foreignPort.toString().includes(searchQuery) ||
      port.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.pid.toString().includes(searchQuery) ||
      port.processName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProtocol = protocolFilter === "" || port.protocol === protocolFilter;
    const matchesState = stateFilter === "" || port.state === stateFilter;

    return matchesSearch && matchesProtocol && matchesState;
  });

  const uniqueProtocols = [...new Set(ports.map((p) => p.protocol))];
  const uniqueStates = [...new Set(ports.map((p) => p.state))];

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
        Used Ports ({filteredPorts.length}{ports.length !== filteredPorts.length ? ` of ${ports.length}` : ""})
      </h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search ports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <select
          value={protocolFilter}
          onChange={(e) => setProtocolFilter(e.target.value)}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Protocols</option>
          {uniqueProtocols.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All States</option>
          {uniqueStates.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(searchQuery || protocolFilter || stateFilter) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setProtocolFilter("");
              setStateFilter("");
            }}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Clear filters
          </button>
        )}
      </div>
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
              <th className="px-4 py-3">Process</th>
            </tr>
          </thead>
          <tbody className="text-sm text-zinc-700 dark:text-zinc-300">
            {filteredPorts.map((port, index) => (
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
                <td className="px-4 py-2">{port.processName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
