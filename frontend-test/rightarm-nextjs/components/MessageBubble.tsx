'use client';

import { motion } from 'framer-motion';
import { Clock, Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    message_text: string;
    message_type: 'text' | 'system' | 'meeting_request';
    created_at: string;
    sender: {
      display_name: string;
      user_type: 'company' | 'cfo';
    };
  };
  isOwn: boolean;
  isRead?: boolean;
  showTime?: boolean;
  showAvatar?: boolean;
}

export default function MessageBubble({
  message,
  isOwn,
  isRead = false,
  showTime = true,
  showAvatar = false
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageTypeDisplay = () => {
    switch (message.message_type) {
      case 'system':
        return (
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-full">
              {message.message_text}
            </div>
          </div>
        );
      case 'meeting_request':
        return (
          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
            <div className={`rounded-lg p-4 border-2 ${
              isOwn 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  面談のご提案
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {message.message_text}
              </p>
              <div className="flex space-x-2 mt-3">
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  承諾
                </button>
                <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors">
                  日程調整
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // システムメッセージや面談リクエストの場合は特別な表示
  if (message.message_type !== 'text') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {getMessageTypeDisplay()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* アバター */}
        {showAvatar && !isOwn && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              {message.sender.display_name.charAt(0)}
            </span>
          </div>
        )}

        {/* メッセージコンテンツ */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* 送信者名 */}
          {showAvatar && !isOwn && (
            <span className="text-xs text-gray-500 mb-1 px-2">
              {message.sender.display_name}
            </span>
          )}

          {/* メッセージバブル */}
          <div
            className={`rounded-2xl px-4 py-3 max-w-full break-words ${
              isOwn
                ? 'bg-black text-white rounded-br-md'
                : 'bg-white text-black border border-gray-200 rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.message_text}
            </p>
          </div>

          {/* 時間と既読状態 */}
          {showTime && (
            <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatTime(message.created_at)}
              </span>
              {isOwn && (
                <div className="ml-1">
                  {isRead ? (
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Check className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}