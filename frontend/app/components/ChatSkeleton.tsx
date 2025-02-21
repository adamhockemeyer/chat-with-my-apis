import React from 'react'

export default function ChatSkeleton() {
    return (
        <div className="animate-pulse flex flex-col h-full p-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex-1 overflow-hidden mb-4">
                <div className="h-full overflow-y-auto p-4 space-y-4">
                    <div className="flex justify-end">
                        <div className="inline-block p-2 rounded-lg bg-blue-500 text-white w-1/2"></div>
                    </div>
                    <div className="flex justify-start">
                        <div className="inline-block p-2 rounded-lg bg-gray-200 text-black w-2/3"></div>
                    </div>
                    <div className="flex justify-end">
                        <div className="inline-block p-2 rounded-lg bg-blue-500 text-white w-1/3"></div>
                    </div>
                    <div className="flex justify-start">
                        <div className="inline-block p-2 rounded-lg bg-gray-200 text-black w-1/2"></div>
                    </div>
                </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                    <div className="flex-grow h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}