import React, { useState } from 'react';
import { useAdminData } from '../context/AdminDataContext';
import {
  Mail,
  Search,
  Star,
  Trash2,
  CheckCircle,
  MessageSquare,
  Phone,
  Clock,
  ArrowRight,
  ExternalLink,
  Send
} from 'lucide-react';
import { ContactMessage } from '../types';
import { formatWhatsAppLink } from '../../utils/phoneUtils';

interface MessagesPageProps {
  lang: 'en' | 'ur';
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ lang }) => {
  const { messages, markMessageRead, toggleMessageImportant, deleteMessage, showToast } = useAdminData();
  const isUrdu = lang === 'ur';

  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(messages[0] || null);

  const filteredMessages = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      markMessageRead(msg.id, true);
    }
  };

  const getWhatsAppReplyLink = (msg: ContactMessage) => {
    if (!msg.phone) return '#';
    const text = `Hello ${msg.name}, thank you for contacting Dar al Dawa Medical Center Lahore regarding "${msg.subject}". In response to your inquiry: `;
    return formatWhatsAppLink(msg.phone, text);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
          {isUrdu ? 'عوامی پیغامات اور مریضوں کی انکوائریز' : 'Public Messages & Patient Inquiries Inbox'}
        </h1>
        <p className="text-xs text-slate-500">
          {isUrdu ? 'ویب سائٹ کے فارم سے موصول ہونے والے تمام سوالات اور مشوروں کا جائزہ لیں اور واٹس ایپ پر جواب دیں۔' : 'Review inquiries submitted through website contact form. Reply instantly via email or WhatsApp.'}
        </p>
      </div>

      {/* Main Mailbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden min-h-[580px]">
        
        {/* Left: Message List (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-200/90 flex flex-col">
          {/* Search bar inside inbox */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages by sender or subject..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#1E5AA8]"
              />
            </div>
          </div>

          {/* List of items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No inquiries in inbox
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-l-[#1E5AA8]'
                        : msg.read
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-emerald-50/30 hover:bg-emerald-50/50 font-semibold'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMessageImportant(msg.id);
                      }}
                      className="mt-0.5 text-slate-300 hover:text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${msg.important ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-xs truncate">{msg.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.createdAt.split('T')[0]}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 truncate mb-1">{msg.subject}</div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{msg.message}</p>
                    </div>

                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-[#1E5AA8] mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Detail Pane (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 sm:p-8">
          {selectedMessage ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{selectedMessage.subject}</h2>
                    <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{selectedMessage.name}</span>
                      {selectedMessage.email && <span>• {selectedMessage.email}</span>}
                      {selectedMessage.phone && <span>• {selectedMessage.phone}</span>}
                      <span>• {selectedMessage.createdAt.replace('T', ' ').slice(0, 16)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        deleteMessage(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="py-6 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Action Buttons for fast response */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                {selectedMessage.phone && (
                  <a
                    href={getWhatsAppReplyLink(selectedMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Reply via WhatsApp ({selectedMessage.phone})</span>
                  </a>
                )}

                {selectedMessage.email && (
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="px-4 py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    markMessageRead(selectedMessage.id, !selectedMessage.read);
                    setSelectedMessage((prev) => (prev ? { ...prev, read: !prev.read } : null));
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Mark as {selectedMessage.read ? 'Unread' : 'Read'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Mail className="w-12 h-12 mb-2 text-slate-300" />
              <span>Select an inquiry from the inbox to read details</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
