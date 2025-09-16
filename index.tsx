/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = (userData) => {
        setUser(userData);
        window.location.hash = ''; // Navigate to dashboard after login
    };

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
        window.location.hash = '#login';
    };
    
    const value = { user, setUser, login, logout, loading, refreshUser: fetchUser };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
const useAuth = () => useContext(AuthContext);


// --- Helper: SVG Icons ---
const LogoIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.8821 7.32475C15.5457 6.58628 14.0046 6.57019 12.6517 7.32475L6.05957 11.232C4.71311 11.9705 4 13.3444 4 14.8073V14.8073C4 16.2702 4.71311 17.6441 6.05957 18.3826L12.6517 22.2899C14.0046 23.0444 15.5457 23.0283 16.8821 22.2899L20.1782 20.4357" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7.11792 16.6752C8.45432 17.4137 9.99539 17.4298 11.3483 16.6752L17.9404 12.768C19.2869 12.0295 20 10.6556 20 9.19272V9.19272C20 7.72981 19.2869 6.35588 17.9404 5.61741L11.3483 1.71015C9.99539 0.955601 8.45432 0.971691 7.11792 1.71015L3.82184 3.56429" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);
const BananaIcon = () => <LogoIcon />; // Use the new logo as the default
const MagicWandIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 18v-2m5-13h2M2 9h2m12.586 6.414L18 14m-5-5L8 4m-2 8l-1.414-1.414M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path></svg>;
const DownloadIcon = ({ className = "w-5 h-5" }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// --- Helper function ---
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject(new Error("No file provided"));
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                const [header, base64Data] = result.split(',');
                resolve({
                    base64: base64Data,
                    mimeType: file.type,
                });
            } else {
                reject(new Error("Failed to read file as string"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


// --- Pages ---
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }
            login(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="max-w-sm w-full bg-white shadow-xl rounded-2xl p-8 space-y-8">
                 <div className="flex flex-col items-center space-y-4">
                    <LogoIcon />
                    <h2 className="text-3xl font-bold text-center text-slate-800">Welcome Back</h2>
                 </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-semibold text-slate-600">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                    </div>
                    <div>
                        <label htmlFor="password"  className="text-sm font-semibold text-slate-600">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                    </div>
                     {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-bold text-slate-800 transition-colors ${loading ? 'bg-yellow-200 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                    <p className="text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <a href="#signup" onClick={(e) => { e.preventDefault(); window.location.hash = '#signup'; }} className="font-medium text-yellow-600 hover:text-yellow-500">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="max-w-sm w-full bg-white shadow-xl rounded-2xl p-8 space-y-8">
                 <div className="flex flex-col items-center space-y-4">
                    <LogoIcon />
                    <h2 className="text-3xl font-bold text-center text-slate-800">Create an Account</h2>
                 </div>
                 {message ? (
                    <div className="text-center">
                        <p className="text-green-600 font-medium">{message}</p>
                        <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = '#login'; }} className="mt-4 inline-block font-medium text-yellow-600 hover:text-yellow-500">Back to Login</a>
                    </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email"  className="text-sm font-semibold text-slate-600">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </div>
                        <div>
                            <label htmlFor="password"  className="text-sm font-semibold text-slate-600">Password</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <div>
                           <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-bold text-slate-800 transition-colors ${loading ? 'bg-yellow-200 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}>
                                {loading ? 'Submitting...' : 'Sign Up'}
                            </button>
                        </div>
                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = '#login'; }} className="font-medium text-yellow-600 hover:text-yellow-500">Log in</a>
                        </p>
                    </form>
                 )}
            </div>
        </div>
    );
};

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to fetch users');
            }
            const data = await res.json();
            setUsers(data.users);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleUpdateUser = async (userId, updates) => {
        try {
            const res = await fetch('/api/admin/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...updates }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update user');
            }
            fetchUsers(); // Refresh the list after update
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleCreditsChange = (userId, newCreditsStr) => {
        const newCredits = parseInt(newCreditsStr, 10);
        if (isNaN(newCredits)) return;
        const updatedUsers = users.map(u => u.id === userId ? { ...u, credits: newCredits } : u);
        setUsers(updatedUsers);
    };
    
    const handleCreditsBlur = (user) => {
        const originalUser = users.find(u => u.id === user.id);
        if (originalUser && originalUser.credits !== user.credits) {
             handleUpdateUser(user.id, { credits: user.credits });
        }
    };


    if (loading) return <div className="text-center p-10">Loading users...</div>
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>

    return (
        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-slate-900">Admin Dashboard</h1>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Credits</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-5 py-5 border-b border-slate-200 text-sm text-slate-900">{u.email}</td>
                                <td className="px-5 py-5 border-b border-slate-200 text-sm">
                                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
                                        u.status === 'approved' ? 'bg-green-200 text-green-900' :
                                        u.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                                        'bg-red-200 text-red-900'
                                    }`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 text-sm">
                                    <input 
                                      type="number" 
                                      value={u.credits} 
                                      onChange={(e) => handleCreditsChange(u.id, e.target.value)}
                                      onBlur={() => handleCreditsBlur(u)}
                                      className="w-24 p-1 rounded bg-slate-200 text-center"
                                    />
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 text-sm space-x-3">
                                    {u.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleUpdateUser(u.id, { status: 'approved' })} className="font-semibold text-green-600 hover:text-green-800">Approve</button>
                                            <button onClick={() => handleUpdateUser(u.id, { status: 'rejected' })} className="font-semibold text-red-600 hover:text-red-800">Reject</button>
                                        </>
                                    )}
                                     {u.status !== 'pending' && <span className="text-slate-400">-</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const DashboardPage = () => {
    const { refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('pro');

    const handleGenerationComplete = () => {
        refreshUser(); // Refresh user data to show updated credits
    };
    
    // --- UI Components defined within Dashboard's scope ---
    const ImageBox = ({ imageData, onFileChange = null, title, children = null, isResultBox = false }) => {
        const fileInputRef = useRef(null);
        const onButtonClick = () => fileInputRef.current?.click();

        const handleDragOver = (e) => e.preventDefault();
        const handleDrop = (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0] && onFileChange) {
                onFileChange(e.dataTransfer.files[0]);
            }
        };

        const handleDownload = () => {
            if (!imageData) return;
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `nano-banana-result-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="w-full">
                {title && <h3 className="text-lg font-semibold mb-2 text-slate-800">{title}</h3>}
                <div 
                    onDragOver={onFileChange ? handleDragOver : undefined}
                    onDrop={onFileChange ? handleDrop : undefined}
                    className={`relative aspect-square w-full rounded-xl flex flex-col justify-center items-center p-4 text-center border-2 border-dashed ${imageData ? 'border-transparent' : 'border-slate-300'} bg-slate-100 transition-all`}>
                    
                    {imageData ? (
                        <>
                            <img src={imageData} alt="Generated or uploaded content" className="w-full h-full object-contain rounded-lg"/>
                            {isResultBox && (
                                <button onClick={handleDownload} className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-900/80 transition-colors">
                                    <DownloadIcon />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2 text-slate-500">
                             {!isResultBox && onFileChange ? (
                                <>
                                    <div className="mx-auto w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                                    </div>
                                    <p className="font-semibold">Click to upload or drag & drop</p>
                                    <p className="text-xs">PNG, JPG, or WEBP</p>
                                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileChange(e.target.files[0])} className="hidden" accept="image/png, image/jpeg, image/webp"/>
                                    <button onClick={onButtonClick} className="absolute inset-0 cursor-pointer"></button>
                                </>
                            ) : (
                                <p>{children || "Result will appear here"}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const SimpleImageEditor = () => {
        const [image, setImage] = useState(null);
        const [prompt, setPrompt] = useState('');
        const [generatedImage, setGeneratedImage] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState('');
    
        const handleFileChange = async (file) => {
            try {
                const imageData = await readFileAsBase64(file);
                // FIX: Guard against non-object results before spreading to prevent type errors.
                if (imageData && typeof imageData === 'object') {
                    setImage({ ...imageData, dataUrl: URL.createObjectURL(file) });
                    setGeneratedImage(null);
                }
            } catch (err) { setError("Failed to read image."); console.error(err); }
        };
    
        const optimizePrompt = async () => {
            if (!prompt) return;
            try {
                const res = await fetch('/api/optimize-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setPrompt(data.optimizedPrompt);
            } catch (err) { console.error("Optimization failed:", err); }
        };
    
        const generateImage = async () => {
            if (!image || !prompt) {
                setError('Please upload an image and provide a description.');
                return;
            }
            setIsLoading(true);
            setError('');
            setGeneratedImage(null);
            try {
                const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: { base64: image.base64, mimeType: image.mimeType }, prompt }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setGeneratedImage(`data:${data.mimeType};base64,${data.data}`);
                handleGenerationComplete();
            } catch (err) { setError(err.message); } finally { setIsLoading(false); }
        };
    
        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <ImageBox title="1. Upload Image" imageData={image?.dataUrl} onFileChange={handleFileChange} />
                    <ImageBox title="3. AI Result" imageData={generatedImage} isResultBox={true}>Your edited image will appear here</ImageBox>
                </div>
                <div className="mt-6">
                    <label htmlFor="edit-prompt" className="block text-lg font-semibold mb-2 text-slate-800">2. Describe Your Edit</label>
                    <div className="relative">
                        <textarea id="edit-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'Add a futuristic flying car and neon lights along the road'" className="w-full p-3 pr-10 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"></textarea>
                        <button onClick={optimizePrompt} title="Optimize Prompt" className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-yellow-500 rounded-full hover:bg-slate-200 transition">
                            <MagicWandIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <div className="mt-6">
                    <button onClick={generateImage} disabled={isLoading || !image || !prompt} className="w-full py-3 px-6 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center">
                        {isLoading ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>
            </div>
        );
    };

    const ProfessionalAdGenerator = () => {
        const [productImage, setProductImage] = useState(null);
        const [modelImage, setModelImage] = useState(null);
        const [generatedImage, setGeneratedImage] = useState(null);
        const [customPrompt, setCustomPrompt] = useState("");
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState("");
        const [options, setOptions] = useState({ industry: 'Auto', pose: 'Auto', ratio: 'Auto', background: 'Auto', props: 'Auto', lighting: 'Auto' });
        const handleOptionChange = (key, value) => setOptions(prev => ({ ...prev, [key]: value }));

        const handleFileChange = async (file, type) => {
            try {
                const imageData = await readFileAsBase64(file);
                // FIX: Guard against non-object results before spreading to prevent type errors.
                if (imageData && typeof imageData === 'object') {
                    const dataUrl = URL.createObjectURL(file);
                    const newImage = { ...imageData, dataUrl };
                    if (type === 'product') setProductImage(newImage);
                    else setModelImage(newImage);
                }
            } catch (err) { setError("Failed to read image."); console.error(err); }
        };
        
        const optimizeAdPrompt = async () => {
            if (!customPrompt) return;
             try {
                const res = await fetch('/api/optimize-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: customPrompt }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setCustomPrompt(data.optimizedPrompt);
            } catch (err) { console.error("Optimization failed:", err); }
        };

        const generateAdImage = async () => {
            if (!productImage) {
                setError('Please upload a product image.');
                return;
            }
            setIsLoading(true);
            setError('');
            setGeneratedImage(null);
            try {
                const res = await fetch('/api/generate-ad', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 
                    productImage: { base64: productImage.base64, mimeType: productImage.mimeType }, 
                    modelImage: modelImage ? { base64: modelImage.base64, mimeType: modelImage.mimeType } : null,
                    options, 
                    customPrompt 
                }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setGeneratedImage(`data:${data.mimeType};base64,${data.data}`);
                handleGenerationComplete();
            } catch (err) { setError(err.message); } finally { setIsLoading(false); }
        };
        
        const OptionSelect = ({ label, value, onChange, children }) => (
            <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>
                <select value={value} onChange={onChange} className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition">
                    {children}
                </select>
            </div>
        );

        return (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-4 sm:p-6 bg-white rounded-2xl shadow-lg space-y-8">
                    <div>
                        <h2 className="text-xl font-bold mb-4">1. Input Images</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ImageBox title="Product Image" imageData={productImage?.dataUrl} onFileChange={(f) => handleFileChange(f, 'product')} />
                            <ImageBox title="Model Image (Optional)" imageData={modelImage?.dataUrl} onFileChange={(f) => handleFileChange(f, 'model')} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4">2. Professional Options</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <OptionSelect label="Industry" value={options.industry} onChange={(e) => handleOptionChange('industry', e.target.value)}>
                                <option value="Auto">Auto</option><option value="Cosmetics">Cosmetics</option><option value="Beverage">Beverage</option><option value="Food">Food</option><option value="Technology">Technology</option><option value="Accessory">Accessory</option><option value="Other">Other</option>
                            </OptionSelect>
                            <OptionSelect label="Pose" value={options.pose} onChange={(e) => handleOptionChange('pose', e.target.value)}>
                                <option value="Auto">Auto</option><option value="Right hand near cheek">Right hand near cheek</option><option value="Left hand across chest">Left hand across chest</option><option value="Two hands gently raised">Two hands gently raised</option><option value="On palm">On palm</option><option value="Next to cheek">Next to cheek</option><option value="Before lips (lipstick)">Before lips (lipstick)</option>
                            </OptionSelect>
                            <OptionSelect label="Ratio" value={options.ratio} onChange={(e) => handleOptionChange('ratio', e.target.value)}>
                               <option value="Auto">Auto</option><option value="Small">Small</option><option value="Medium">Medium</option><option value="Emphasized">Emphasized</option><option value="Close-up">Close-up</option><option value="In front of chest">In front of chest</option><option value="On table next to model">On table next to model</option>
                            </OptionSelect>
                             <OptionSelect label="Background" value={options.background} onChange={(e) => handleOptionChange('background', e.target.value)}>
                                <option value="Auto">Auto</option><option value="White marble vanity + towel">White marble vanity + towel</option><option value="Bright spa bathroom">Bright spa bathroom</option><option value="Pastel beige/pink studio">Pastel beige/pink studio</option><option value="Soft light window">Soft light window</option>
                            </OptionSelect>
                            <OptionSelect label="Props" value={options.props} onChange={(e) => handleOptionChange('props', e.target.value)}>
                               <option value="Auto">Auto</option><option value="Green leaves & pebbles">Green leaves & pebbles</option><option value="Linen cloth">Linen cloth</option><option value="White ceramic dish">White ceramic dish</option><option value="No props">No props</option><option value="Auto by industry">Auto by industry</option><option value="Off">Off</option><option value="Minimal">Minimal</option><option value="Abundant">Abundant</option>
                            </OptionSelect>
                            <OptionSelect label="Lighting" value={options.lighting} onChange={(e) => handleOptionChange('lighting', e.target.value)}>
                                <option value="Auto">Auto</option><option value="Beauty soft warm">Beauty soft warm</option><option value="Balanced softbox">Balanced softbox</option><option value="Natural window light">Natural window light</option><option value="Cinematic">Cinematic</option>
                            </OptionSelect>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="custom-prompt" className="block text-lg font-semibold mb-2">Your Creative Request</label>
                         <div className="relative">
                            <textarea id="custom-prompt" rows={2} value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g., 'with water splashes and a sense of freshness'" className="w-full p-3 pr-10 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"></textarea>
                            <button onClick={optimizeAdPrompt} title="Optimize Prompt" className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-yellow-500 rounded-full hover:bg-slate-200 transition">
                                <MagicWandIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg flex flex-col">
                     <ImageBox title="Result" imageData={generatedImage} isResultBox={true} />
                     {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                     <div className="mt-6 flex-grow flex flex-col justify-end">
                        <button onClick={generateAdImage} disabled={isLoading || !productImage} className="w-full py-3 px-6 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-lg">
                            {isLoading ? 'Generating...' : 'Generate Photo'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const VideoGenerator = () => {
        const [image, setImage] = useState(null);
        const [prompt, setPrompt] = useState('');
        const [videoUrl, setVideoUrl] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [statusMessage, setStatusMessage] = useState('');
        const [error, setError] = useState('');
        const pollingInterval = useRef(null);

        const stopPolling = () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
                pollingInterval.current = null;
            }
        };

        useEffect(() => {
            return () => stopPolling(); // Cleanup on component unmount
        }, []);

        const handleFileChange = async (file) => {
            try {
                const imageData = await readFileAsBase64(file);
                // FIX: Guard against non-object results before spreading to prevent type errors.
                if (imageData && typeof imageData === 'object') {
                    setImage({ ...imageData, dataUrl: URL.createObjectURL(file) });
                }
            } catch (err) { setError("Failed to read image."); console.error(err); }
        };

        const optimizePrompt = async () => {
            if (!prompt) return;
            try {
                const res = await fetch('/api/optimize-video-prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setPrompt(data.optimizedPrompt);
            } catch (err) { console.error("Optimization failed:", err); }
        };

        const pollVideoStatus = (operationName) => {
            pollingInterval.current = setInterval(async () => {
                try {
                    const res = await fetch(`/api/video-status?operationName=${operationName}`);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Failed to get status');
                    
                    if (data.done) {
                        stopPolling();
                        if (data.response?.generatedVideos?.[0]?.video?.uri) {
                            const videoUri = data.response.generatedVideos[0].video.uri;
                            setVideoUrl(`/api/download-video?uri=${encodeURIComponent(videoUri)}`);
                            setStatusMessage('Video generated successfully!');
                            handleGenerationComplete();
                        } else {
                            // Check for error details if 'done' is true but no video
                            const errorDetails = data.error?.message || 'Video generation finished but no video URI was found.';
                            throw new Error(errorDetails);
                        }
                        setIsLoading(false);
                    } else {
                        setStatusMessage("Processing video... This can take several minutes. Please wait.");
                    }
                } catch (err) {
                    setError(`Polling error: ${err.message}`);
                    setIsLoading(false);
                    stopPolling();
                }
            }, 10000); // Poll every 10 seconds
        };

        const generateVideo = async () => {
            if (!prompt) {
                setError('Please provide a description to generate a video.');
                return;
            }
            setIsLoading(true);
            setError('');
            setVideoUrl(null);
            setStatusMessage('Starting video generation...');
            try {
                const res = await fetch('/api/generate-video', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 
                    image: image ? { base64: image.base64, mimeType: image.mimeType } : null, 
                    prompt 
                }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setStatusMessage('Video job started. Now polling for results...');
                pollVideoStatus(data.operationName);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        return (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg space-y-6">
                    <ImageBox title="Input Image (Optional)" imageData={image?.dataUrl} onFileChange={handleFileChange} />
                    <div>
                        <label htmlFor="video-prompt" className="block text-lg font-semibold mb-2">Describe Your Video</label>
                        <div className="relative">
                            <textarea id="video-prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'A neon hologram of a cat driving at top speed'" className="w-full p-3 pr-10 rounded-lg border border-slate-300 bg-slate-50 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"></textarea>
                            <button onClick={optimizePrompt} title="Optimize Prompt to English" className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-yellow-500 rounded-full hover:bg-slate-200 transition">
                                <MagicWandIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                     <button onClick={generateVideo} disabled={isLoading || !prompt} className="w-full py-3 px-6 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-lg">
                        {isLoading ? 'Processing...' : 'Generate Video'}
                    </button>
                </div>
                 <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg flex flex-col justify-center items-center">
                    <div className="w-full">
                         <h3 className="text-lg font-semibold mb-2 text-center">Video Result</h3>
                         <div className="relative aspect-video w-full rounded-xl flex flex-col justify-center items-center text-center border-2 border-dashed border-slate-300 bg-slate-100">
                             {videoUrl ? (
                                <video src={videoUrl} controls autoPlay className="w-full h-full rounded-lg" />
                             ) : (
                                <p className="text-slate-500 p-4">{statusMessage || "Video will appear here"}</p>
                             )}
                         </div>
                         {videoUrl && (
                             <a href={videoUrl} download={`nano-banana-video-${Date.now()}.mp4`} className="mt-4 w-full block text-center py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                                 Download Video
                             </a>
                         )}
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="p-2 sm:p-4 md:p-8 bg-slate-100 min-h-screen">
            <div className="flex justify-center mb-6 space-x-1 md:space-x-2 bg-slate-200 p-1 rounded-xl max-w-md mx-auto">
                <button onClick={() => setActiveTab('simple')} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm ${activeTab === 'simple' ? 'bg-white text-slate-900 shadow' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}>
                    Quick Edit
                </button>
                <button onClick={() => setActiveTab('pro')} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm ${activeTab === 'pro' ? 'bg-white text-slate-900 shadow' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}>
                    Creative Ad
                </button>
                <button onClick={() => setActiveTab('video')} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm ${activeTab === 'video' ? 'bg-white text-slate-900 shadow' : 'bg-transparent text-slate-500 hover:text-slate-700'}`}>
                    Create Video
                </button>
            </div>
            <div>
                {activeTab === 'simple' && <SimpleImageEditor />}
                {activeTab === 'pro' && <ProfessionalAdGenerator />}
                {activeTab === 'video' && <VideoGenerator />}
            </div>
        </div>
    );
}

const AppHeader = () => {
    const { user, logout } = useAuth();
    
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <LogoIcon />
                        <span className="font-bold text-xl text-slate-900">Nano Banana</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-slate-600">Credits: <span className="font-bold text-yellow-500">{user?.credits ?? 0}</span></span>
                        {user?.role === 'admin' && (
                            <a href="#admin" onClick={(e) => { e.preventDefault(); window.location.hash = '#admin';}} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Admin Panel</a>
                        )}
                        <span className="hidden sm:inline text-sm text-slate-500">{user?.email}</span>
                        <button onClick={logout} className="text-sm font-medium text-slate-600 hover:text-slate-900">Logout</button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Main App Router
const App = () => {
    const { user, logout } = useAuth();
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (!user) {
        if (hash === '#signup') {
            return <SignupPage />;
        }
        return <LoginPage />;
    }
    
    if (user.status === 'pending') {
        return <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-100 p-4">
            <h1 className="text-2xl font-bold text-slate-900">Account Pending Approval</h1>
            <p className="mt-2 text-slate-600">Your account has been created and is waiting for an administrator to approve it.</p>
             <button onClick={logout} className="mt-6 px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 font-semibold">Logout</button>
        </div>
    }

     if (user.status === 'rejected') {
        return <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-100 p-4">
            <h1 className="text-2xl font-bold text-red-500">Account Rejected</h1>
            <p className="mt-2 text-slate-600">Unfortunately, your account registration was not approved.</p>
            <button onClick={logout} className="mt-6 px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 font-semibold">Logout</button>
        </div>
    }

    if (user.role === 'admin' && hash === '#admin') {
         return (
             <div className="bg-slate-100">
                <AppHeader />
                <main>
                    <AdminPage />
                </main>
             </div>
         );
    }
    
    // Default view for approved users
    return (
        <div className="bg-slate-100">
             <AppHeader />
             <main>
                <DashboardPage />
             </main>
        </div>
    );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);