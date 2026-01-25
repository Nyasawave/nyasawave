'use client';

import { useEffect, useState } from 'react';

interface Report {
    id: string;
    type: 'content' | 'user' | 'transaction' | 'dispute';
    description: string;
    status: 'pending' | 'investigating' | 'resolved';
    createdAt: string;
    resolvedAt?: string;
}

export default function AdminReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setReports([
                {
                    id: '1',
                    type: 'content',
                    description: 'Inappropriate content reported',
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    type: 'user',
                    description: 'Suspicious user activity',
                    status: 'investigating',
                    createdAt: new Date().toISOString(),
                },
            ]);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = filter === 'all'
        ? reports
        : reports.filter(r => r.status === filter);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">System Reports</h2>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
                <div className="flex space-x-4">
                    {(['all', 'pending', 'investigating', 'resolved'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded capitalize font-medium ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'All Reports' : status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading reports...</div>
                ) : filteredReports.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No reports found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="border-t border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                                        {report.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{report.description}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold capitalize ${report.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : report.status === 'investigating'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button className="text-blue-600 hover:text-blue-900 font-medium">
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
