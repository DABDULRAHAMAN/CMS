'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

interface QuickAddEventProps {
    onParse: (text: string) => void;
}

export function QuickAddEvent({ onParse }: QuickAddEventProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onParse(input);
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl relative">
            <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Quick add: 'Lunch tomorrow at 2pm'..."
                    className="pl-9 pr-12 bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-sm"
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-purple-600"
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}
