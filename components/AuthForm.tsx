'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticate } from '@/app/actions/auth'; // We'll create this next
import Link from 'next/link';

interface AuthFormProps {
    mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        if (mode === 'login') {
            try {
                const result = await authenticate(undefined, formData);
                if (result) {
                    setError(result);
                }
            } catch (err) {

                setError('Something went wrong.');
            }
        } else {
            // Register API call
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (res.ok) {
                    router.push('/login?registered=true');
                } else {
                    const data = await res.json();
                    setError(data.error || 'Registration failed');
                }
            } catch (err) {
                setError('Something went wrong.');
            }
        }

        setLoading(false);
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold text-center">{mode === 'login' ? 'Login' : 'Create Account'}</h2>
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required placeholder="John Doe" />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="m@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                </Button>
            </form>
            <div className="text-center text-sm">
                {mode === 'login' ? (
                    <p>Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link></p>
                ) : (
                    <p>Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link></p>
                )}
            </div>
        </div>
    );
}
