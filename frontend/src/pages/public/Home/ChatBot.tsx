import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MessageCircle } from "lucide-react";
import ChatInput from "@/components/Aishop";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-[50%] right-6 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-20 right-6 z-50 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <div>
                  <h3 className="font-semibold">AI Shopping Assistant</h3>
                  <p className="text-xs text-white/80">Ask me anything!</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Content */}
              <div className="h-96">
                <ChatInput />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
