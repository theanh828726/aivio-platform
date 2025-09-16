/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useCallback, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// --- i18n and Theming ---
const translations = {
    en: {
        welcomeBack: "Welcome Back",
        emailLabel: "Email",
        passwordLabel: "Password",
        loginButton: "Log In",
        loggingIn: "Logging in...",
        noAccount: "Don't have an account?",
        signUpLink: "Sign up",
        createAccount: "Create an Account",
        backToLogin: "Back to Login",
        signUpButton: "Sign Up",
        submitting: "Submitting...",
        haveAccount: "Already have an account?",
        loginLink: "Log in",
        accountPending: "Account Pending Approval",
        pendingMessage: "Your account has been created and is waiting for an administrator to approve it.",
        logoutButton: "Logout",
        accountRejected: "Account Rejected",
        rejectedMessage: "Unfortunately, your account registration was not approved.",
        adminDashboard: "Admin Dashboard",
        backToDashboard: "Back to Dashboard",
        userHeader: "User",
        statusHeader: "Status",
        creditsHeader: "Credits",
        actionsHeader: "Actions",
        approveButton: "Approve",
        rejectButton: "Reject",
        credits: "Credits",
        adminPanel: "Admin Panel",
        quickEditTab: "Quick Edit",
        creativeAdTab: "Creative Ad",
        createVideoTab: "Create Video",
        uploadImagesTitle: "1. Upload Image(s)",
        aiResultTitle: "3. AI Result",
        describeEditTitle: "2. Describe Your Edit",
        generateImageButton: "Generate Image",
        generating: "Generating...",
        inputImagesTitle: "1. Input Images",
        productImage: "Product Image",
        modelImage: "Model Image (Optional)",
        proOptionsTitle: "2. Professional Options",
        industry: "Industry",
        pose: "Pose",
        ratio: "Ratio",
        background: "Background",
        props: "Props",
        lighting: "Lighting",
        creativeRequest: "Your Creative Request",
        result: "Result",
        generatePhotoButton: "Generate Photo",
        inputImageOptional: "Input Image (Optional)",
        describeVideo: "Describe Your Video",
        generateVideoButton: "Generate Video",
        processing: "Processing...",
        videoResult: "Video Result",
        downloadVideo: "Download Video",
    },
    vi: {
        welcomeBack: "Chào mừng trở lại",
        emailLabel: "Email",
        passwordLabel: "Mật khẩu",
        loginButton: "Đăng nhập",
        loggingIn: "Đang đăng nhập...",
        noAccount: "Chưa có tài khoản?",
        signUpLink: "Đăng ký",
        createAccount: "Tạo tài khoản",
        backToLogin: "Quay lại Đăng nhập",
        signUpButton: "Đăng ký",
        submitting: "Đang gửi...",
        haveAccount: "Đã có tài khoản?",
        loginLink: "Đăng nhập",
        accountPending: "Tài khoản chờ duyệt",
        pendingMessage: "Tài khoản của bạn đã được tạo và đang chờ quản trị viên phê duyệt.",
        logoutButton: "Đăng xuất",
        accountRejected: "Tài khoản bị từ chối",
        rejectedMessage: "Rất tiếc, đăng ký tài khoản của bạn không được chấp thuận.",
        adminDashboard: "Trang quản trị",
        backToDashboard: "Quay về trang chính",
        userHeader: "Người dùng",
        statusHeader: "Trạng thái",
        creditsHeader: "Tín dụng",
        actionsHeader: "Hành động",
        approveButton: "Duyệt",
        rejectButton: "Từ chối",
        credits: "Tín dụng",
        adminPanel: "Trang Admin",
        quickEditTab: "Sửa ảnh nhanh",
        creativeAdTab: "Tạo ảnh quảng cáo",
        createVideoTab: "Tạo Video",
        uploadImagesTitle: "1. Tải ảnh lên",
        aiResultTitle: "3. Kết quả AI",
        describeEditTitle: "2. Mô tả chỉnh sửa",
        generateImageButton: "Tạo ảnh",
        generating: "Đang tạo...",
        inputImagesTitle: "1. Ảnh đầu vào",
        productImage: "Ảnh sản phẩm",
        modelImage: "Ảnh người mẫu (Tùy chọn)",
        proOptionsTitle: "2. Tùy chọn chuyên nghiệp",
        industry: "Ngành hàng",
        pose: "Tư thế",
        ratio: "Tỉ lệ",
        background: "Phông nền",
        props: "Đạo cụ",
        lighting: "Ánh sáng",
        creativeRequest: "Yêu cầu sáng tạo của bạn",
        result: "Kết quả",
        generatePhotoButton: "Tạo ảnh",
        inputImageOptional: "Ảnh đầu vào (Tùy chọn)",
        describeVideo: "Mô tả Video của bạn",
        generateVideoButton: "Tạo Video",
        processing: "Đang xử lý...",
        videoResult: "Kết quả Video",
        downloadVideo: "Tải Video về",
    }
};

const LanguageContext = createContext({
    t: (key) => key,
    language: 'vi',
    toggleLanguage: () => {},
});
const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'vi');

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => translations[language][key] || key;
    const toggleLanguage = () => setLanguage(lang => lang === 'vi' ? 'en' : 'vi');

    return (
        <LanguageContext.Provider value={{ t, language, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => {},
});
const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => setTheme(th => th === 'light' ? 'dark' : 'light');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth');
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
        window.location.hash = ''; 
    };

    const logout = async () => {
        await fetch('/api/auth', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'logout' }) 
        });
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
        <path d="M16.8821 7.32475C15.5457 6.58628 14.0046 6.57019 12.6517 7.32475L6.05957 11.232C4.71311 11.9705 4 13.3444 4 14.8073V14.8073C4 16.2702 4.71311 17.6441 6.05957 18.3826L12.6517 22.2899C14.0046 23.0444 15.5457 23.0283 16.8821 22.2899L20.1782 20.4357" stroke="currentColor" className="text-yellow-500 dark:text-yellow-400" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7.11792 16.6752C8.45432 17.4137 9.99539 17.4298 11.3483 16.6752L17.9404 12.768C19.2869 12.0295 20 10.6556 20 9.19272V9.19272C20 7.72981 19.2869 6.35588 17.9404 5.61741L11.3483 1.71015C9.99539 0.955601 8.45432 0.971691 7.11792 1.71015L3.82184 3.56429" stroke="currentColor" className="text-yellow-500 dark:text-yellow-400" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);
const MagicWandIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2m0 18v-2m5-13h2M2 9h2m12.586 6.414L18 14m-5-5L8 4m-2 8l-1.414-1.414M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path></svg>;
const DownloadIcon = ({ className = "w-5 h-5" }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const SunIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

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
                const [, base64Data] = result.split(',');
                resolve({ base64: base64Data, mimeType: file.type });
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
    const { t } = useLanguage();
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
            const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', email, password }) });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.message || 'Login failed'); }
            login(data.user);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="max-w-sm w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 space-y-8">
                 <div className="flex flex-col items-center space-y-4">
                    <LogoIcon />
                    <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200">{t('welcomeBack')}</h2>
                 </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('emailLabel')}</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                    </div>
                    <div>
                        <label htmlFor="password"  className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('passwordLabel')}</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                    </div>
                     {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-bold text-slate-800 transition-colors ${loading ? 'bg-yellow-300 dark:bg-yellow-800 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}>
                            {loading ? t('loggingIn') : t('loginButton')}
                        </button>
                    </div>
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('noAccount')}{' '}
                        <a href="#signup" onClick={(e) => { e.preventDefault(); window.location.hash = '#signup'; }} className="font-medium text-yellow-600 hover:text-yellow-500">{t('signUpLink')}</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

const SignupPage = () => {
    const { t } = useLanguage();
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
            const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signup', email, password }) });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.message || 'Signup failed'); }
            setMessage(data.message);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="max-w-sm w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 space-y-8">
                 <div className="flex flex-col items-center space-y-4">
                    <LogoIcon />
                    <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200">{t('createAccount')}</h2>
                 </div>
                 {message ? (
                    <div className="text-center">
                        <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
                        <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = '#login'; }} className="mt-4 inline-block font-medium text-yellow-600 hover:text-yellow-500">{t('backToLogin')}</a>
                    </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email"  className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('emailLabel')}</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </div>
                        <div>
                            <label htmlFor="password"  className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('passwordLabel')}</label>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"/>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <div>
                           <button type="submit" disabled={loading} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-bold text-slate-800 transition-colors ${loading ? 'bg-yellow-300 dark:bg-yellow-800 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}>
                                {loading ? t('submitting') : t('signUpButton')}
                            </button>
                        </div>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            {t('haveAccount')}{' '}
                            <a href="#login" onClick={(e) => { e.preventDefault(); window.location.hash = '#login'; }} className="font-medium text-yellow-600 hover:text-yellow-500">{t('loginLink')}</a>
                        </p>
                    </form>
                 )}
            </div>
        </div>
    );
};

const AdminPage = () => {
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin');
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
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...updates }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update user');
            }
            fetchUsers();
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
    
    const handleCreditsBlur = (userId, currentCredits) => {
        const originalUser = users.find(u => u.id === userId);
         if (originalUser && originalUser.credits !== currentCredits) {
             handleUpdateUser(userId, { credits: currentCredits });
        }
    };


    if (loading) return <div className="text-center p-10">Loading users...</div>
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>

    return (
        <div className="p-4 sm:p-8 bg-slate-50 dark:bg-slate-800 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('adminDashboard')}</h1>
                 <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = '';}} className="px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 font-semibold transition-colors">
                    {t('backToDashboard')}
                </a>
            </div>
            <div className="bg-white dark:bg-slate-900 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('userHeader')}</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('statusHeader')}</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('creditsHeader')}</th>
                            <th className="px-5 py-3 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('actionsHeader')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-5 py-5 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-200">{u.email}</td>
                                <td className="px-5 py-5 border-b border-slate-200 dark:border-slate-700 text-sm">
                                    <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
                                        u.status === 'approved' ? 'bg-green-200 text-green-900' :
                                        u.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                                        'bg-red-200 text-red-900'
                                    }`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 dark:border-slate-700 text-sm">
                                    <input 
                                      type="number" 
                                      defaultValue={u.credits}
                                      onBlur={(e) => handleCreditsBlur(u.id, parseInt(e.target.value, 10))}
                                      className="w-24 p-1 rounded bg-slate-200 dark:bg-slate-700 text-center"
                                    />
                                </td>
                                <td className="px-5 py-5 border-b border-slate-200 dark:border-slate-700 text-sm space-x-3">
                                    {u.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleUpdateUser(u.id, { status: 'approved' })} className="font-semibold text-green-600 hover:text-green-800">{t('approveButton')}</button>
                                            <button onClick={() => handleUpdateUser(u.id, { status: 'rejected' })} className="font-semibold text-red-600 hover:text-red-800">{t('rejectButton')}</button>
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
    const { t } = useLanguage();
    const { refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('pro');

    const handleGenerationComplete = () => {
        refreshUser();
    };
    
    // FIX: Make title prop optional by adding a default value.
    const ImageBox = ({ imageData, onFileChange = null, title = null, children = null, isResultBox = false, onClear = null, index = 0 }) => {
        const fileInputRef = useRef(null);
        const onButtonClick = () => fileInputRef.current?.click();

        const handleDragOver = (e) => e.preventDefault();
        const handleDrop = (e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0] && onFileChange) {
                onFileChange(e.dataTransfer.files[0], index);
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
                {title && <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">{title}</h3>}
                <div 
                    onDragOver={onFileChange ? handleDragOver : undefined}
                    onDrop={onFileChange ? handleDrop : undefined}
                    className={`relative aspect-square w-full rounded-xl flex flex-col justify-center items-center p-4 text-center border-2 border-dashed ${imageData ? 'border-transparent' : 'border-slate-300 dark:border-slate-600'} bg-slate-100 dark:bg-slate-800/50 transition-all group`}>
                    
                    {imageData ? (
                        <>
                            <img src={imageData} alt="Content" className="w-full h-full object-contain rounded-lg"/>
                            {isResultBox && (
                                <button onClick={handleDownload} title="Download Image" className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/50 text-white hover:bg-slate-900/80 transition-colors">
                                    <DownloadIcon />
                                </button>
                            )}
                            {onClear && (
                                <button onClick={() => onClear(index)} title="Remove Image" className="absolute top-3 right-3 p-2 rounded-full bg-red-600/70 text-white hover:bg-red-600/90 transition-colors opacity-0 group-hover:opacity-100">
                                   <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2 text-slate-500 dark:text-slate-400">
                             {!isResultBox && onFileChange ? (
                                <>
                                    <div className="mx-auto w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                                    </div>
                                    <p className="font-semibold">Click to upload or drag & drop</p>
                                    <p className="text-xs">PNG, JPG, or WEBP</p>
                                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileChange(e.target.files[0], index)} className="hidden" accept="image/png, image/jpeg, image/webp"/>
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
        const [images, setImages] = useState([null, null, null]);
        const [prompt, setPrompt] = useState('');
        const [generatedImage, setGeneratedImage] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState('');
    
        const handleFileChange = async (file, index) => {
            try {
                const imageData = await readFileAsBase64(file);
                // FIX: Add a check to ensure imageData is an object before spreading.
                if (imageData && typeof imageData === 'object') {
                    const newImages = [...images];
                    newImages[index] = { ...imageData, dataUrl: URL.createObjectURL(file) };
                    setImages(newImages);
                    setGeneratedImage(null);
                }
            } catch (err) { setError("Failed to read image."); console.error(err); }
        };

        const handleClearImage = (index) => {
            const newImages = [...images];
            newImages[index] = null;
            setImages(newImages);
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
            const uploadedImages = images.filter(img => img !== null).map(img => ({ base64: img.base64, mimeType: img.mimeType }));
            if (uploadedImages.length === 0 || !prompt) {
                setError('Please upload at least one image and provide a description.');
                return;
            }
            setIsLoading(true);
            setError('');
            setGeneratedImage(null);
            try {
                const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ images: uploadedImages, prompt }) });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                setGeneratedImage(`data:${data.mimeType};base64,${data.data}`);
                handleGenerationComplete();
            } catch (err) { setError(err.message); } finally { setIsLoading(false); }
        };
    
        return (
            <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('uploadImagesTitle')}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <ImageBox key={index} index={index} imageData={image?.dataUrl} onFileChange={handleFileChange} onClear={handleClearImage} />
                            ))}
                        </div>
                    </div>
                    <ImageBox title={t('aiResultTitle')} imageData={generatedImage} isResultBox={true}>Your edited image will appear here</ImageBox>
                </div>
                <div className="mt-6">
                    <label htmlFor="edit-prompt" className="block text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('describeEditTitle')}</label>
                    <div className="relative">
                        <textarea id="edit-prompt" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'Combine the two people into one photo, on a beach background'" className="w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"></textarea>
                        <button onClick={optimizePrompt} title="Optimize Prompt" className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-yellow-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <MagicWandIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <div className="mt-6">
                    <button onClick={generateImage} disabled={isLoading || images.every(i => i === null) || !prompt} className="w-full py-3 px-6 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors text-lg flex items-center justify-center">
                        {isLoading ? t('generating') : t('generateImageButton')}
                    </button>
                </div>
            </div>
        );
    };

    const ProfessionalAdGenerator = () => {
        // ... (this component remains largely the same, just adding translations and dark mode classes)
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
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
                <select value={value} onChange={onChange} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition">
                    {children}
                </select>
            </div>
        );

        return (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg space-y-8">
                    <div>
                        <h2 className="text-xl font-bold mb-4">{t('inputImagesTitle')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ImageBox title={t('productImage')} imageData={productImage?.dataUrl} onFileChange={(f) => handleFileChange(f, 'product')} />
                            <ImageBox title={t('modelImage')} imageData={modelImage?.dataUrl} onFileChange={(f) => handleFileChange(f, 'model')} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold mb-4">{t('proOptionsTitle')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <OptionSelect label={t('industry')} value={options.industry} onChange={(e) => handleOptionChange('industry', e.target.value)}>
                                <option value="Auto">Auto</option><option value="Cosmetics">Cosmetics</option><option value="Beverage">Beverage</option><option value="Food">Food</option><option value="Technology">Technology</option><option value="Accessory">Accessory</option><option value="Other">Other</option>
                            </OptionSelect>
                            <OptionSelect label={t('pose')} value={options.pose} onChange={(e) => handleOptionChange('pose', e.target.value)}>
                                <option value="Auto">Auto</option><option value="Right hand near cheek">Right hand near cheek</option><option value="Left hand across chest">Left hand across chest</option><option value="Two hands gently raised">Two hands gently raised</option><option value="On palm">On palm</option><option value="Next to cheek">Next to cheek</option><option value="Before lips (lipstick)">Before lips (lipstick)</option>
                            </OptionSelect>
                            <OptionSelect label={t('ratio')} value={options.ratio} onChange={(e) => handleOptionChange('ratio', e.target.value)}>
                               <option value="Auto">Auto</option><option value="Small">Small</option><option value="Medium">Medium</option><option value="Emphasized">Emphasized</option><option value="Close-up">Close-up</option><option value="In front of chest">In front of chest</option><option value="On table next to model">On table next to model</option>
                            </OptionSelect>
                             <OptionSelect label={t('background')} value={options.background} onChange={(e) => handleOptionChange('background', e.target.value)}>
                                <option value="Auto">Auto</option><option value="White marble vanity + towel">White marble vanity + towel</option><option value="Bright spa bathroom">Bright spa bathroom</option><option value="Pastel beige/pink studio">Pastel beige/pink studio</option><option value="Soft light window">Soft light window</option>
                            </OptionSelect>
                            <OptionSelect label={t('props')} value={options.props} onChange={(e) => handleOptionChange('props', e.target.value)}>
                               <option value="Auto">Auto</option><option value="Green leaves & pebbles">Green leaves & pebbles</option><option value="Linen cloth">Linen cloth</option><option value="White ceramic dish">White ceramic dish</option><option value="No props">No props</option><option value="Auto by industry">Auto by industry</option><option value="Off">Off</option><option value="Minimal">Minimal</option><option value="Abundant">Abundant</option>
                            </OptionSelect>
                            <OptionSelect label={t('lighting')} value={options.lighting} onChange={(e) => handleOptionChange('lighting', e.target.value)}>
                                <option value="Auto">Auto</option><option value="Beauty soft warm">Beauty soft warm</option><option value="Balanced softbox">Balanced softbox</option><option value="Natural window light">Natural window light</option><option value="Cinematic">Cinematic</option>
                            </OptionSelect>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="custom-prompt" className="block text-lg font-semibold mb-2">{t('creativeRequest')}</label>
                         <div className="relative">
                            <textarea id="custom-prompt" rows={2} value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g., 'with water splashes and a sense of freshness'" className="w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"></textarea>
                            <button onClick={optimizeAdPrompt} title="Optimize Prompt" className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-yellow-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                <MagicWandIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex flex-col">
                     <ImageBox title={t('result')} imageData={generatedImage} isResultBox={true} />
                     {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                     <div className="mt-6 flex-grow flex flex-col justify-end">
                        <button onClick={generateAdImage} disabled={isLoading || !productImage} className="w-full py-3 px-6 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors text-lg">
                            {isLoading ? t('generating') : t('generatePhotoButton')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const VideoGenerator = () => {
        // ... (this component remains largely the same, just adding translations and dark mode classes)
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
            return () => stopPolling();
        }, []);

        const handleFileChange = async (file) => {
            try {
                const imageData = await readFileAsBase64(file);
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
                    refreshUser(); // Refresh user to reflect potential credit refund
                }
            }, 10000);
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
                refreshUser(); // Refresh user to reflect potential credit refund
            }
        };

        return (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg space-y-6">
                    <ImageBox title={t('inputImageOptional')} imageData={image?.dataUrl} onFileChange={handleFileChange} />
                    <div>
                        <label htmlFor="video-prompt" className="block text-lg font-semibold mb-2">{t('describeVideo')}</label>
                        <div className="relative">
                            <textarea id="video-prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'A neon hologram of a cat driving at top speed'" className="w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition"></textarea>
                            <button onClick={optimizePrompt} title="Optimize Prompt to English" className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-yellow-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                <MagicWandIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                     <button onClick={generateVideo} disabled={isLoading || !prompt} className="w-full py-3 px-6 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors text-lg">
                        {isLoading ? t('processing') : t('generateVideoButton')}
                    </button>
                </div>
                 <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex flex-col justify-center items-center">
                    <div className="w-full">
                         <h3 className="text-lg font-semibold mb-2 text-center">{t('videoResult')}</h3>
                         <div className="relative aspect-video w-full rounded-xl flex flex-col justify-center items-center text-center border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/50">
                             {videoUrl ? (
                                <video src={videoUrl} controls autoPlay className="w-full h-full rounded-lg" />
                             ) : (
                                <p className="text-slate-500 dark:text-slate-400 p-4">{statusMessage || "Video will appear here"}</p>
                             )}
                         </div>
                         {videoUrl && (
                             <a href={videoUrl} download={`nano-banana-video-${Date.now()}.mp4`} className="mt-4 w-full block text-center py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
                                 {t('downloadVideo')}
                             </a>
                         )}
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="p-2 sm:p-4 md:p-8 bg-slate-100 dark:bg-slate-800 min-h-screen">
            <div className="flex justify-center mb-6 space-x-1 md:space-x-2 bg-slate-200 dark:bg-slate-700/50 p-1 rounded-xl max-w-md mx-auto">
                <button onClick={() => setActiveTab('simple')} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm ${activeTab === 'simple' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow' : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    {t('quickEditTab')}
                </button>
                <button onClick={() => setActiveTab('pro')} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm ${activeTab === 'pro' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow' : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    {t('creativeAdTab')}
                </button>
                <button onClick={() => setActiveTab('video')} className={`w-full px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 text-sm ${activeTab === 'video' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow' : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    {t('createVideoTab')}
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
    const { t, language, toggleLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    
    return (
        <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 transition-colors">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <LogoIcon />
                        <span className="font-bold text-xl text-slate-900 dark:text-slate-100">Nano Banana</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('credits')}: <span className="font-bold text-yellow-500">{user?.credits ?? 0}</span></span>
                        {user?.role === 'admin' && (
                            <a href="#admin" onClick={(e) => { e.preventDefault(); window.location.hash = '#admin';}} className="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-500">{t('adminPanel')}</a>
                        )}
                        <button onClick={toggleLanguage} className="p-2 rounded-md font-semibold text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {language === 'vi' ? 'EN' : 'VI'}
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-md text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {theme === 'light' ? <MoonIcon className="w-4 h-4"/> : <SunIcon className="w-4 h-4"/>}
                        </button>
                        <button onClick={logout} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">{t('logoutButton')}</button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// Main App Router
const App = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (!user) {
        return hash === '#signup' ? <SignupPage /> : <LoginPage />;
    }
    
    if (user.status === 'pending') {
        return <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-100 dark:bg-slate-900 p-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('accountPending')}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('pendingMessage')}</p>
             <button onClick={logout} className="mt-6 px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 font-semibold">{t('logoutButton')}</button>
        </div>
    }

     if (user.status === 'rejected') {
        return <div className="min-h-screen flex flex-col items-center justify-center text-center bg-slate-100 dark:bg-slate-900 p-4">
            <h1 className="text-2xl font-bold text-red-500">{t('accountRejected')}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('rejectedMessage')}</p>
            <button onClick={logout} className="mt-6 px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg hover:bg-yellow-500 font-semibold">{t('logoutButton')}</button>
        </div>
    }

    if (user.role === 'admin' && hash === '#admin') {
         return (
             <div className="bg-slate-100 dark:bg-slate-800">
                <AppHeader />
                <main><AdminPage /></main>
             </div>
         );
    }
    
    return (
        <div className="bg-slate-100 dark:bg-slate-800">
             <AppHeader />
             <main><DashboardPage /></main>
        </div>
    );
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <ThemeProvider>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </ThemeProvider>
    </AuthProvider>
);
