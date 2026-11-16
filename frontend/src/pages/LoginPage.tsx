import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiRequestError, postData } from '../services/api-services';
import { saveSession } from '../services/auth';
import { API_URL_LOGIN } from '../services/config';
import type { LoginResponse } from '../types/models';
import './LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in both fields');
            return;
        }

        try {
            const data = await postData<LoginResponse>(API_URL_LOGIN, { email, password });
            saveSession({ token: data.token, user: data.user });
            navigate('/home');
        } catch (err) {
            console.error('Login error:', err);
            if (err instanceof ApiRequestError && err.status === 401) {
                setError('Wrong email or password.');
            } else {
                setError((err as Error).message || 'Could not sign in. Please try again.');
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-form">
                <Link to="/" className="login-back">← Back to homepage</Link><br />
                <h2>🛠️ TIQNest</h2>
                <p className="login-subtitle">Sign in to report a problem or check your tickets</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Work email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={!email || !password}>Sign In</button>
                </form>
            </div>
        </div>
    );
}
