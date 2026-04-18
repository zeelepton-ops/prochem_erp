import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@services/api';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

interface DeliveryNote {
  id: string;
  dnNumber: string;
  deliveryDate: string;
  status: string;
  carrier: string;
  trackingNumber: string;
}

export const DeliveryNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await apiClient.get('/delivery-notes');
      setNotes(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch delivery notes', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (confirm('Delete this delivery note?')) {
      try {
        await apiClient.delete(`/delivery-notes/${id}`);
        setNotes(notes.filter(n => n.id !== id));
      } catch (err) {
        alert('Failed to delete note');
      }
    }
  };

  const filtered = notes.filter(n =>
    n.dnNumber?.toLowerCase().includes(search.toLowerCase()) ||
    n.trackingNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Delivery Notes</h1>
        <Link
          to="/delivery-notes/new"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <FaPlus /> New Delivery
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by DN or tracking number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50 flex-1 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No delivery notes found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">DN Number</th>
                <th className="px-6 py-4 text-left font-semibold">Delivery Date</th>
                <th className="px-6 py-4 text-left font-semibold">Carrier</th>
                <th className="px-6 py-4 text-left font-semibold">Tracking</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((note) => (
                <tr key={note.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{note.dnNumber}</td>
                  <td className="px-6 py-4">{new Date(note.deliveryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{note.carrier}</td>
                  <td className="px-6 py-4 text-sm">{note.trackingNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      note.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      note.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {note.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-2">
                    <Link to={`/delivery-notes/${note.id}`} className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
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
};
