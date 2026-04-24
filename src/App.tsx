import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';

const Icon = ({ name, className }: { name: string; className?: string }) => {
    const pascalName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const Comp = (LucideIcons as any)[pascalName];
    if (!Comp) return <span className={className}></span>;
    return <Comp className={className} />;
};

const dict: Record<string, any> = {
    BM: {
        adminMode: "MOD ADMIN",
        createdBy: "Create by MFR",
        transferMoney: "Transfer Duit",
        openVault: "Membuka Vault...",
        callCloud: "Panggil Firebase",
        clearCache: "Lekas keluar pentadbir?",
        saveCloud: "Simpan Firebase",
        processing: "Proses...",
        cloudSuccess: "Data Firebase Berjaya Dimuat!",
        cloudFail: "Firebase Gagal. Sila Cuba Lagi.",
        saveCloudSuccess: "Simpan Firebase Selesai!",
        saveCloudFail: "Gagal Simpan ke Firebase.",
        appTitle: "Sistem Simpanan Ahli",
        fundsCollected: "Dana Terkumpul",
        newTransaction: "Transaksi Baru",
        in: "MASUK",
        out: "KELUAR",
        selectName: "-- Pilih Nama --",
        confirmRecord: "Sahkan Rekod",
        bulkCut: "Potongan Pukal",
        totalCut: "Total RM Potongan",
        execCut: "Laksanakan Potongan",
        manageMembers: "Urus Ahli",
        manageMembersDesc: "Padam ahli daripada pangkalan data Vault.",
        name: "-- Nama --",
        delete: "Padam",
        systemSettings: "Tetapan Sistem",
        checkArrears: "Semak Tunggakan Hingga",
        feeRM: "Yuran RM",
        year: "Tahun",
        detailedStatement: "Penyata Terperinci",
        member: "Ahli",
        month: "Bulan",
        valueRM: "Nilai (RM)",
        action: "Aksi",
        noRecords: "Tiada transaksi direkodkan dalam Vault",
        deleteRecord: "Padam Rekod",
        memberSummary: "Ringkasan Ahli",
        numMembers: "Ahli",
        registerNewMember: "Daftar Ahli Baru",
        exampleName: "Contoh: Ali Bin Abu",
        add: "Tambah",
        emptyDB: "Pangkalan data ahli masih kosong",
        complete: "Lengkap",
        deleteMemberTitle: "Padam Ahli?", // Used as title and hover text
        deleteMemberHover: "Padam Ahli",
        adminAccess: "Akses Admin",
        passReq: "Kod 4-digit diperlukan.",
        confirmCode: "Sahkan Kod",
        cancel: "Batalkan",
        deleteMemberDesc1: "Rekod",
        deleteMemberDesc2: "akan dipadam secara kekal daripada pengkalan data Vault.",
        deleteNow: "Padam Segera",
        keep: "Kekalkan",
        understood: "Faham & Selesai",
        transferInfo: "Maklumat Transaksi",
        download: "Muat Turun",
        close: "Tutup",
        lowBalanceTitle: "Baki Kurang",
        lowBalanceDesc: "Baki tidak mencukupi untuk pengeluaran ini.",
        rejected: "Ditolak",
        bulkFailMsg1: "Potongan RM",
        bulkFailMsg2: "gagal. Ahli baki kurang:",
        getHtml: "Cara Publish Web",
        copyHtml: "Salin Panduan",
        copied: "Berjaya Disalin!",
        embedCode: "Panduan Publish Web",
        viewTransactions: "Rekod Transaksi",
        months: {
            'Januari': 'Januari', 'Februari': 'Februari', 'Mac': 'Mac', 'April': 'April',
            'Mei': 'Mei', 'Jun': 'Jun', 'Julai': 'Julai', 'Ogos': 'Ogos',
            'September': 'September', 'Oktober': 'Oktober', 'November': 'November', 'Disember': 'Disember'
        }
    },
    EN: {
        adminMode: "ADMIN MODE",
        createdBy: "Created by MFR",
        transferMoney: "Transfer Money",
        openVault: "Opening Vault...",
        callCloud: "Fetch from Firebase",
        clearCache: "Logout admin?",
        saveCloud: "Save to Firebase",
        processing: "Processing...",
        cloudSuccess: "Firebase Data Loaded Successfully!",
        cloudFail: "Firebase Failed. Please try again.",
        saveCloudSuccess: "Firebase Save Complete!",
        saveCloudFail: "Failed to Save to Firebase.",
        appTitle: "Member Savings System",
        fundsCollected: "Funds Collected",
        newTransaction: "New Transaction",
        in: "IN",
        out: "OUT",
        selectName: "-- Select Name --",
        confirmRecord: "Confirm Record",
        bulkCut: "Bulk Deduction",
        totalCut: "Total RM Deduction",
        execCut: "Execute Deduction",
        manageMembers: "Manage Members",
        manageMembersDesc: "Delete members from the Vault database.",
        name: "-- Name --",
        delete: "Delete",
        systemSettings: "System Settings",
        checkArrears: "Check Arrears Until",
        feeRM: "Fee RM",
        year: "Year",
        detailedStatement: "Detailed Statement",
        member: "Member",
        month: "Month",
        valueRM: "Value (RM)",
        action: "Action",
        noRecords: "No transactions recorded in Vault",
        deleteRecord: "Delete Record",
        memberSummary: "Member Summary",
        numMembers: "Members",
        registerNewMember: "Register New Member",
        exampleName: "Example: John Doe",
        add: "Add",
        emptyDB: "Member database is still empty",
        complete: "Complete",
        deleteMemberTitle: "Delete Member?",
        deleteMemberHover: "Delete Member",
        adminAccess: "Admin Access",
        passReq: "4-digit code required.",
        confirmCode: "Confirm Code",
        cancel: "Cancel",
        deleteMemberDesc1: "Record",
        deleteMemberDesc2: "will be permanently deleted from the Vault database.",
        deleteNow: "Delete Now",
        keep: "Keep",
        understood: "Understood & Done",
        transferInfo: "Transaction Info",
        download: "Download",
        close: "Close",
        lowBalanceTitle: "Insufficient Balance",
        lowBalanceDesc: "Insufficient balance for this withdrawal.",
        rejected: "Rejected",
        bulkFailMsg1: "Deduction of RM",
        bulkFailMsg2: "failed. Members with insufficient balance:",
        getHtml: "How to Publish",
        copyHtml: "Copy Guide",
        copied: "Copied successfully!",
        embedCode: "Web Publish Guide",
        viewTransactions: "Transaction Records",
        months: {
            'Januari': 'January', 'Februari': 'February', 'Mac': 'March', 'April': 'April',
            'Mei': 'May', 'Jun': 'June', 'Julai': 'July', 'Ogos': 'August',
            'September': 'September', 'Oktober': 'October', 'November': 'November', 'Disember': 'December'
        }
    }
};

export default function App() {
    const getStoredData = (key: string, defaultValue: any) => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : defaultValue;
        } catch (e) { return defaultValue; }
    };

    const [lang, setLang] = useState<'BM' | 'EN'>(() => getStoredData('soicassy_lang', 'BM'));
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [logoClicks, setLogoClicks] = useState(0);
    const [showPassModal, setShowPassModal] = useState(false);
    const [passError, setPassError] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<{ type: string, message: string } | null>(null);
    const [hasCloudError, setHasCloudError] = useState(false);

    const [senaraiAhli, setSenaraiAhli] = useState<string[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [minAmount, setMinAmount] = useState<number>(20);
    const [tahunSemasa, setTahunSemasa] = useState<string>(new Date().getFullYear().toString());

    const senaraiBulan = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
    const [bulanSemasa, setBulanSemasa] = useState(senaraiBulan[new Date().getMonth()]);
    const [alertMessage, setAlertMessage] = useState<{ title: string, desc: string } | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
    const [newAhli, setNewAhli] = useState('');
    const [ahliToDeleteDropdown, setAhliToDeleteDropdown] = useState('');
    const [formData, setFormData] = useState({ name: '', month: 'Januari', amount: '', type: 'masuk' });
    const [bulkFormData, setBulkFormData] = useState({ month: 'Januari', amount: '' });
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [showTransactionsModal, setShowTransactionsModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const senaraiTahun = useMemo(() => {
        const years = [];
        for (let i = 2024; i <= 2050; i++) years.push(i.toString());
        return years;
    }, []);

    const [passInput, setPassInput] = useState('');

    const fetchConfigFromCloud = () => {
        setIsLoading(true);
        setHasCloudError(false);
        const unsub = onSnapshot(doc(db, 'system', 'global'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSenaraiAhli(data.senaraiAhli || []);
                setMinAmount(data.minAmount || 20);
                setTahunSemasa(data.tahunSemasa || new Date().getFullYear().toString());
            } else {
                // Not found.
            }
            setIsLoading(false);
        }, (error) => {
            console.error(error);
            setHasCloudError(true);
            setIsLoading(false);
            setSyncStatus({ type: 'error', message: dict[lang].cloudFail });
        });
        return unsub;
    };

    const fetchRecordsFromCloud = () => {
        const q = query(collection(db, 'records'), orderBy('timestamp', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach(doc => data.push(doc.data()));
            setRecords(data);
        });
        return unsub;
    };

    useEffect(() => { 
        const unsubConfig = fetchConfigFromCloud();
        const unsubRecords = fetchRecordsFromCloud();
        return () => { unsubConfig(); unsubRecords(); };
    }, []);

    useEffect(() => {
        // Auth state is now managed by PIN logic
    }, []);

    useEffect(() => {
        localStorage.setItem('soicassy_lang', JSON.stringify(lang));
    }, [lang]);

    const syncConfigToDB = async (newList: string[], minAmt: number, year: string) => {
        if (!isAdmin) return;
        setIsSyncing(true);
        setSyncStatus(null);
        try {
            await setDoc(doc(db, 'system', 'global'), {
                senaraiAhli: newList,
                minAmount: Number(minAmt),
                tahunSemasa: year
            });
            setSyncStatus({ type: 'success', message: dict[lang].saveCloudSuccess });
            setTimeout(() => setSyncStatus(null), 3000);
        } catch (error) {
            setSyncStatus({ type: 'error', message: dict[lang].saveCloudFail });
        } finally { setIsSyncing(false); }
    };

    const handleLogoClick = () => {
        if (isAdmin) { 
            if(window.confirm(dict[lang].clearCache)) {
                setIsAdmin(false);
            }
            setLogoClicks(0); 
            return; 
        }
        const newCount = logoClicks + 1;
        if (newCount >= 3) { setShowPassModal(true); setLogoClicks(0); }
        else { setLogoClicks(newCount); setTimeout(() => setLogoClicks(0), 2000); }
    };

    const handlePassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passInput === '1234') { 
            setIsAdmin(true); 
            setShowPassModal(false); 
            setPassInput(''); 
            setPassError(false); 
        } else { 
            setPassError(true); 
            setPassInput(''); 
            setTimeout(() => setPassError(false), 2000); 
        }
    };

    const summary = useMemo(() => {
        let grandTotal = 0;
        const individu: any = {};
        const currentMonthIdx = senaraiBulan.indexOf(bulanSemasa);
        senaraiAhli.forEach(ahli => {
            individu[ahli.toLowerCase()] = { namaPaparan: ahli, jumlah: 0, bayaranBulanan: {}, tunggakanBulan: [] };
            senaraiBulan.forEach(b => individu[ahli.toLowerCase()].bayaranBulanan[b] = 0);
        });
        records.forEach(rekod => {
            const nilai = rekod.type === 'masuk' ? rekod.amount : -rekod.amount;
            grandTotal += nilai;
            const namaKey = rekod.name.toLowerCase();
            if (individu[namaKey]) {
                individu[namaKey].jumlah += nilai;
                individu[namaKey].bayaranBulanan[rekod.month] += nilai;
            }
        });
        Object.values(individu).forEach((ahli: any) => {
            for (let i = 0; i <= currentMonthIdx; i++) {
                if (ahli.bayaranBulanan[senaraiBulan[i]] < minAmount) {
                    ahli.tunggakanBulan.push(senaraiBulan[i].substring(0, 3));
                }
            }
        });
        return { grandTotal, individu };
    }, [records, senaraiAhli, bulanSemasa, minAmount]);

    const formatRM = (amount: number) => new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.amount || !isAdmin) return;
        const amountNum = parseFloat(formData.amount);
        if (formData.type === 'keluar' && amountNum > (summary.individu[formData.name.toLowerCase()]?.jumlah || 0)) {
            setAlertMessage({ title: dict[lang].lowBalanceTitle, desc: dict[lang].lowBalanceDesc });
            return;
        }
        
        const newId = Date.now();
        try {
            await setDoc(doc(db, 'records', newId.toString()), {
                id: newId,
                name: formData.name,
                month: formData.month,
                amount: amountNum,
                type: formData.type,
                timestamp: newId
            });
            setFormData({ ...formData, name: '', amount: '' });
        } catch (e) {
            console.error(e);
            alert("Failed to save to Firebase.");
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!isAdmin) return;
        const total = parseFloat(bulkFormData.amount);
        if (!total || senaraiAhli.length === 0) return;
        const perPerson = total / senaraiAhli.length;
        const lowBaki = senaraiAhli.filter(a => (summary.individu[a.toLowerCase()]?.jumlah || 0) < perPerson);
        if (lowBaki.length > 0) {
            setAlertMessage({ title: dict[lang].rejected, desc: `${dict[lang].bulkFailMsg1}${perPerson.toFixed(2)} ${dict[lang].bulkFailMsg2} ${lowBaki.join(', ')}` });
            return;
        }
        
        try {
            for (let i = 0; i < senaraiAhli.length; i++) {
                const newId = Date.now() + i;
                await setDoc(doc(db, 'records', newId.toString()), {
                    id: newId,
                    name: senaraiAhli[i],
                    month: bulkFormData.month,
                    amount: perPerson,
                    type: 'keluar',
                    timestamp: newId
                });
            }
            setBulkFormData({ ...bulkFormData, amount: '' });
        } catch (e) { console.error(e); }
    };

    const handleDeleteRecord = async (id: number) => {
        if(!isAdmin) return;
        try {
            await deleteDoc(doc(db, 'records', id.toString()));
        } catch (e) { console.error(e); }
    };

    const handleAddAhli = async () => {
        if(newAhli && isAdmin) {
            const updated = [...senaraiAhli, newAhli];
            setNewAhli('');
            await syncConfigToDB(updated, minAmount, tahunSemasa);
        }
    };

    const handleDeleteAhliDB = async () => {
        if(!memberToDelete || !isAdmin) return;
        const updated = senaraiAhli.filter(x => x.toLowerCase() !== memberToDelete.toLowerCase());
        await syncConfigToDB(updated, minAmount, tahunSemasa);
        try {
            // Very basic, delete associated records
            records.forEach(async (r) => {
                if(r.name.toLowerCase() === memberToDelete.toLowerCase()) {
                    await deleteDoc(doc(db, 'records', r.id.toString()));
                }
            });
        } catch (e) { console.error(e); }
        setMemberToDelete(null);
    };

    const handleGetHtml = () => {
        setShowEmbedModal(true);
    };

    const getEmbedHtml = () => {
        return `Makluman Penting:
Anda tidak boleh menggunakan kod <iframe> untuk memaparkan sistem ini di laman web lain (seperti GitHub Pages) kerana wujud sekatan keselamatan pelayan (X-Frame-Options) untuk mengelakkan godaman.

Untuk publish di GitHub Pages:
1. Tekan menu tetapan (Settings / gear icon) pada panel AI Studio.
2. Pilih "Export to GitHub" atau muat turun kod dalam bentuk ZIP.
3. Anda perlu jalankan perintah pembinaan (npm run build) pada komputer anda.
4. Muat naik (upload) fail dari folder 'dist' ke repositori GitHub anda.`;
    };

    const handleCopyHtml = () => {
        navigator.clipboard.writeText(getEmbedHtml());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Loading Screen
    if (isLoading && !hasCloudError) {
        return (
            <div className="min-h-screen bg-[#111314] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-600/30 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '5s' }}></div>
                
                <div className="relative mb-8 z-10">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse"></div>
                    <img src="https://i.postimg.cc/prf5nQYN/Chat-GPT-Image-Apr-23-2026-09-52-51-AM-(1).png" className="h-28 rounded-[2rem] shadow-2xl relative z-10 border border-white/10" alt="Loader Logo" />
                </div>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-white/10 z-10 text-white">
                    <Icon name="loader-2" className="w-5 h-5 text-emerald-400 animate-spin" />
                    <span className="text-sm font-bold uppercase tracking-widest">{dict[lang].openVault}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-x-hidden pb-10 min-h-screen bg-[#111314] text-slate-200 font-sans p-4">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-600/30 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '5s' }}></div>
            </div>

            <header className="relative z-10 max-w-5xl mx-auto px-4 pt-6 md:pt-10 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4 md:gap-5 flex-col sm:flex-row">
                    <img src="https://i.postimg.cc/prf5nQYN/Chat-GPT-Image-Apr-23-2026-09-52-51-AM-(1).png" alt="SoicAssy Vault" onClick={handleLogoClick} className="h-16 md:h-20 drop-shadow-xl cursor-pointer hover:rotate-[-5deg] active:scale-95 transition-transform shrink-0 rounded-[1rem] border border-white/10" />
                    <div className="flex flex-col sm:items-start items-center">
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mt-0.5">{dict[lang].appTitle} {isAdmin && `• ${dict[lang].adminMode}`}</p>
                        <p className="text-[8px] md:text-[9px] text-slate-400 font-medium tracking-widest mt-0.5 uppercase">{dict[lang].createdBy}</p>
                        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                            <button 
                                onClick={() => setShowTransactionsModal(true)}
                                className="mt-3 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-emerald-400 shadow-sm active:scale-95 shadow-emerald-500/20"
                            >
                                <Icon name="list" className="w-3.5 h-3.5" />
                                {dict[lang].viewTransactions}
                            </button>
                            <button 
                                onClick={handleGetHtml}
                                className="mt-3 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-slate-600 shadow-sm active:scale-95"
                            >
                                <Icon name="code" className="w-3.5 h-3.5" />
                                {dict[lang].getHtml}
                            </button>
                            <button 
                                onClick={() => setShowTransferModal(true)}
                                className="mt-3 px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/10 shadow-sm active:scale-95 backdrop-blur-md"
                            >
                                <Icon name="send" className="w-3.5 h-3.5" />
                                {dict[lang].transferMoney}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    <div className="flex gap-2 w-full justify-center sm:justify-end items-center">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md shadow-sm">
                            <button 
                                onClick={() => setLang('BM')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${lang === 'BM' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                BM
                            </button>
                            <button 
                                onClick={() => setLang('EN')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${lang === 'EN' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                            >
                                EN
                            </button>
                        </div>
                        {isAdmin && (
                            <React.Fragment>
                                <button onClick={() => syncConfigToDB(senaraiAhli, minAmount, tahunSemasa)} disabled={isSyncing} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                    {isSyncing ? dict[lang].processing : dict[lang].saveCloud}
                                </button>
                            </React.Fragment>
                        )}
                    </div>
                    {syncStatus && <div className={`text-[9px] font-bold px-3 py-1.5 rounded-full animate-bounce ${syncStatus.type === 'error' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>{syncStatus.message}</div>}
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-4 space-y-6">
                {/* Summary Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 text-center sm:text-left">
                        <div className="text-xs text-slate-400 uppercase tracking-[0.4em] mb-3 flex items-center justify-center sm:justify-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            {dict[lang].fundsCollected} {tahunSemasa}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter tabular-nums">{formatRM(summary.grandTotal)}</h2>
                    </div>
                </div>

                <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : ''} gap-6 md:gap-8`}>
                    {isAdmin && (
                        <div className="space-y-6 order-1">
                            {/* Borang Transaksi */}
                            <section className="bg-[#1a1c1d]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-sm p-6 sm:p-7">
                                <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-white"><Icon name="plus-circle" className="text-emerald-400" /> {dict[lang].newTransaction}</h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                                        <button type="button" onClick={()=>setFormData({...formData, type:'masuk'})} className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all ${formData.type==='masuk'?'bg-emerald-500 text-white shadow-sm':'text-slate-400 hover:text-white'}`}>{dict[lang].in}</button>
                                        <button type="button" onClick={()=>setFormData({...formData, type:'keluar'})} className={`flex-1 py-2.5 text-[10px] font-bold rounded-lg transition-all ${formData.type==='keluar'?'bg-teal-400 text-white shadow-sm':'text-slate-400 hover:text-white'}`}>{dict[lang].out}</button>
                                    </div>
                                    <select required value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none text-white [&>option]:text-slate-900">
                                        <option value="">{dict[lang].selectName}</option>
                                        {senaraiAhli.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <select value={formData.month} onChange={(e)=>setFormData({...formData, month:e.target.value})} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold outline-none appearance-none text-white [&>option]:text-slate-900">
                                            {senaraiBulan.map(b => <option key={b} value={b}>{dict[lang].months[b]}</option>)}
                                        </select>
                                        <input type="number" step="0.01" value={formData.amount} onChange={(e)=>setFormData({...formData, amount:e.target.value})} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500" placeholder="RM 0.00" />
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all tracking-widest">{dict[lang].confirmRecord}</button>
                                </form>
                            </section>

                            <section className="bg-[#1a1c1d]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-sm p-6 sm:p-7 border-l-4 border-l-rose-500">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-white"><Icon name="pie-chart" className="text-rose-500" /> {dict[lang].bulkCut}</h3>
                                <form onSubmit={handleBulkSubmit} className="space-y-4 flex flex-col">
                                    <input type="number" step="0.01" value={bulkFormData.amount} onChange={(e)=>setBulkFormData({...bulkFormData, amount:e.target.value})} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 placeholder-slate-500" placeholder={dict[lang].totalCut} />
                                    <button type="submit" className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-[10px] transition-all active:scale-95 uppercase tracking-wider shadow-lg shadow-rose-500/10">{dict[lang].execCut}</button>
                                </form>
                            </section>

                            <section className="bg-[#1a1c1d]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-sm p-6 sm:p-7 border-l-4 border-l-amber-400">
                                <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-white"><Icon name="user-x" className="text-amber-500" /> {dict[lang].manageMembers}</h3>
                                <p className="text-[10px] text-slate-400 mb-4 italic font-medium">{dict[lang].manageMembersDesc}</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select 
                                        value={ahliToDeleteDropdown} 
                                        onChange={(e)=>setAhliToDeleteDropdown(e.target.value)} 
                                        className="w-full sm:flex-1 p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs outline-none appearance-none text-white [&>option]:text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="">{dict[lang].name}</option>
                                        {senaraiAhli.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                    <button onClick={() => {if(ahliToDeleteDropdown) { setMemberToDelete(ahliToDeleteDropdown); setAhliToDeleteDropdown(''); }}} className="w-full sm:w-auto bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 px-6 py-3.5 rounded-xl text-[10px] font-bold active:scale-95 transition-all">{dict[lang].delete}</button>
                                </div>
                            </section>

                            <section className="bg-[#1a1c1d]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-sm p-6 sm:p-7">
                                <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-white"><Icon name="settings" className="text-slate-400" /> {dict[lang].systemSettings}</h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">{dict[lang].checkArrears}</label>
                                        <select value={bulanSemasa} onChange={(e)=>setBulanSemasa(e.target.value)} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none appearance-none text-white [&>option]:text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500">
                                            {senaraiBulan.map(b => <option key={b} value={b}>{dict[lang].months[b]}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase text-center sm:text-left">{dict[lang].feeRM}</label>
                                                <input type="number" value={minAmount} onChange={(e)=>setMinAmount(Number(e.target.value))} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-center sm:text-left outline-none text-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase text-center sm:text-left">{dict[lang].year}</label>
                                                <select value={tahunSemasa} onChange={(e)=>setTahunSemasa(e.target.value)} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-center sm:text-left appearance-none outline-none text-white [&>option]:text-slate-900 focus:border-slate-500 focus:ring-1 focus:ring-slate-500">
                                                {senaraiTahun.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                        </div>
                                    </div>
                                    <button onClick={() => syncConfigToDB(senaraiAhli, minAmount, tahunSemasa)} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-[10px] uppercase shadow-lg active:scale-95 transition-all tracking-widest">{dict[lang].saveCloud}</button>
                                </div>
                            </section>
                        </div>
                    )}

                    <div className={`space-y-6 ${isAdmin ? 'lg:col-span-2' : ''} order-2 w-full`}>
                        {isAdmin && (
                            <section className="bg-[#1a1c1d]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-sm p-6 sm:p-7 overflow-hidden transition-all hover:shadow-md">
                                <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-white"><Icon name="coins" className="text-amber-500" /> {dict[lang].detailedStatement}</h3>
                                <div className="overflow-x-auto no-scrollbar -mx-6 sm:-mx-7 px-6 sm:px-7">
                                    <table className="w-full text-left min-w-[480px]">
                                        <thead>
                                            <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                <th className="pb-4 px-2">{dict[lang].member}</th>
                                                <th className="pb-4 px-2">{dict[lang].month}</th>
                                                <th className="pb-4 px-2 text-right">{dict[lang].valueRM}</th>
                                                <th className="pb-4 px-2 text-center">{dict[lang].action}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px]">
                                            {records.length === 0 ? (
                                                <tr><td colSpan={4} className="py-12 text-center text-slate-500 italic font-medium">{dict[lang].noRecords}</td></tr>
                                            ) : (
                                                records.map(r => (
                                                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-2 font-bold text-slate-200">{r.name}</td>
                                                        <td className="py-4 px-2 text-slate-400 font-medium">{dict[lang].months[r.month] || r.month}</td>
                                                        <td className={`py-4 px-2 text-right font-black whitespace-nowrap ${r.type==='masuk'?'text-emerald-400':'text-rose-400'}`}>
                                                            {r.type==='masuk'?'+':'-'} {r.amount && r.amount.toFixed(2)}
                                                        </td>
                                                        <td className="py-4 px-2 text-center">
                                                            <button onClick={()=>handleDeleteRecord(r.id)} className="text-rose-400 hover:text-rose-300 transition-all p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl flex items-center justify-center mx-auto" title={dict[lang].deleteRecord}><Icon name="trash-2" className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        <section className="bg-[#1a1c1d]/50 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-sm p-6 sm:p-7 transition-all hover:shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold flex items-center gap-2 text-white"><Icon name="users" className="text-teal-400" /> {dict[lang].memberSummary}</h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-4 py-1.5 rounded-full border border-white/10">{senaraiAhli.length} {dict[lang].numMembers}</span>
                            </div>
                            
                            {isAdmin && (
                                <div className="mb-8 p-5 sm:p-6 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-inner relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                                    <div className="flex items-center gap-2 mb-4 px-1 relative z-10">
                                        <Icon name="user-plus" className="w-4 h-4 text-emerald-400" />
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dict[lang].registerNewMember}</label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full">
                                        <div className="relative w-full">
                                            <Icon name="user" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                type="text" 
                                                placeholder={dict[lang].exampleName} 
                                                value={newAhli} 
                                                onChange={(e)=>setNewAhli(e.target.value)} 
                                                className="w-full pl-10 pr-4 py-4 bg-white/5 rounded-2xl text-xs border border-white/10 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-white placeholder-slate-500" 
                                            />
                                        </div>
                                        <button 
                                            onClick={handleAddAhli} 
                                            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl text-[10px] font-bold shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shrink-0"
                                        >
                                            <Icon name="plus" className="w-3.5 h-3.5" />
                                            {dict[lang].add}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {senaraiAhli.length === 0 ? (
                                <div className="text-center py-16 bg-white/5 rounded-[2rem] border-dashed border-2 border-white/10">
                                    <Icon name="users" className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-xs text-slate-500 italic">{dict[lang].emptyDB}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.values(summary.individu).sort((a: any,b: any)=>b.jumlah-a.jumlah).map((a: any, i) => (
                                        <div key={i} className="flex justify-between items-center p-4 sm:p-5 bg-white/5 hover:bg-white/10 rounded-[2rem] border border-white/10 shadow-sm transition-all relative">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1a1c1d] border border-white/10 text-white flex items-center justify-center text-xs font-bold shadow-md shrink-0 uppercase tracking-tighter">{a.namaPaparan.substring(0,2)}</div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-[13px] text-slate-200 leading-tight">{a.namaPaparan}</span>
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {a.tunggakanBulan.length > 0 ? (
                                                            a.tunggakanBulan.map((t: string) => (
                                                                <span key={t} className="text-[8px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">{dict[lang].months[senaraiBulan.find(b=>b.startsWith(t)) || t]?.substring(0,3) || t}</span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1"><Icon name="check-circle" className="w-3 h-3" /> {dict[lang].complete}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                                <div className="text-right">
                                                    <span className={`text-[12px] sm:text-[13px] font-black whitespace-nowrap tracking-tight ${a.jumlah>=0?'text-white':'text-rose-400'}`}>{formatRM(a.jumlah)}</span>
                                                </div>
                                                {isAdmin && (
                                                    <button onClick={()=>setMemberToDelete(a.namaPaparan)} className="text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all p-2 rounded-xl flex items-center justify-center shrink-0" title={dict[lang].deleteMemberHover}>
                                                        <Icon name="trash-2" className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            {/* Modal Kata Laluan */}
            {showPassModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111314]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className={`bg-[#1a1c1d]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 max-w-sm w-full shadow-2xl transform transition-all duration-300 ${passError ? 'animate-shake' : 'scale-100'}`}>
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center shadow-xl border border-emerald-500/30">
                                <Icon name="shield" className="w-8 h-8 text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-center text-white uppercase tracking-tighter">{dict[lang].adminAccess}</h3>
                        <p className="text-xs text-slate-400 mb-10 text-center px-4 leading-relaxed font-medium italic">{dict[lang].passReq}</p>
                        <form onSubmit={handlePassSubmit} className="space-y-6">
                            <input 
                                autoFocus 
                                type="password" 
                                maxLength={4}
                                inputMode="numeric"
                                placeholder="••••" 
                                value={passInput} 
                                onChange={(e)=>setPassInput(e.target.value)} 
                                className={`w-full text-center text-4xl tracking-[1.5rem] font-black py-7 rounded-[2rem] border transition-all outline-none ${passError ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/5 bg-black/20 text-white placeholder-slate-600'}`} 
                            />
                            <div className="flex flex-col gap-3">
                                <button type="submit" className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-[1.5rem] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all uppercase text-xs tracking-widest">
                                    <Icon name="unlock" className="w-4 h-4" />
                                    {dict[lang].confirmCode}
                                </button>
                                <button type="button" onClick={()=>setShowPassModal(false)} className="w-full text-[10px] font-bold text-slate-500 py-2 hover:text-white uppercase tracking-[0.3em] transition-colors">{dict[lang].cancel}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Padam Ahli */}
            {memberToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111314]/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#1a1c1d]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                            <Icon name="user-x" className="w-10 h-10 text-rose-400" />
                        </div>
                        <h3 className="font-bold text-white text-2xl mb-3 tracking-tighter">{dict[lang].deleteMemberTitle}</h3>
                        <p className="text-xs text-slate-400 mb-10 leading-relaxed font-medium">{dict[lang].deleteMemberDesc1} <b className="text-white">{memberToDelete}</b> {dict[lang].deleteMemberDesc2}</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleDeleteAhliDB} className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all uppercase tracking-widest">{dict[lang].deleteNow}</button>
                            <button onClick={()=>setMemberToDelete(null)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-xs active:scale-95 transition-all uppercase tracking-widest border border-white/10">{dict[lang].keep}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Amaran Sistem */}
            {alertMessage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111314]/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#1a1c1d]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 max-w-xs w-full text-center shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                            <Icon name="alert-triangle" className="w-10 h-10 text-amber-400" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-white uppercase tracking-tighter">{alertMessage.title}</h3>
                        <p className="text-xs text-slate-400 mb-8 leading-relaxed font-medium italic">{alertMessage.desc}</p>
                        <button onClick={()=>setAlertMessage(null)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs active:scale-95 transition-all uppercase tracking-widest shadow-xl">{dict[lang].understood}</button>
                    </div>
                </div>
            )}

            {/* Modal Transfer Duit */}
            {showTransferModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111314]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1a1c1d]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 sm:p-10 max-w-sm w-full text-center shadow-2xl relative">
                        <button onClick={() => setShowTransferModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 rounded-full hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 transition-colors">
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                        <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-6 border border-teal-500/30 shadow-inner">
                            <Icon name="send" className="w-8 h-8 text-teal-400 ml-1" />
                        </div>
                        <h3 className="font-bold text-white text-2xl mb-2 tracking-tighter uppercase">{dict[lang].transferInfo}</h3>
                        
                        <div className="mb-6 flex flex-col items-center justify-center gap-1.5">
                            <p className="text-sm font-black text-slate-300 tracking-widest uppercase">Ramlah Binti Mamat</p>
                            <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full tracking-widest uppercase border border-teal-500/30">Touch N Go</span>
                        </div>
                        
                        <div className="rounded-[2rem] overflow-hidden border border-white/10 mb-8 shadow-sm bg-white/5 flex items-center justify-center p-2">
                            <img src="https://i.postimg.cc/VkVM39Rv/21-(2).png" alt="Transfer QR" className="max-w-full h-auto rounded-2xl opacity-90" />
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <a 
                                href="https://i.postimg.cc/VkVM39Rv/21-(2).png" 
                                download="Transfer_SoicAssy.png"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                <Icon name="download" className="w-4 h-4" />
                                {dict[lang].download}
                            </a>
                            <button onClick={() => setShowTransferModal(false)} className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold text-xs active:scale-95 transition-all uppercase tracking-widest border border-white/10">
                                {dict[lang].close}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Kod Embed */}
            {showEmbedModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111314]/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1a1c1d]/90 backdrop-blur-xl border border-emerald-500/30 rounded-[3rem] p-8 sm:p-10 max-w-lg w-full shadow-2xl relative">
                        <button onClick={() => setShowEmbedModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 text-slate-400 rounded-full hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 transition-colors">
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-inner">
                            <Icon name="code" className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-white text-2xl mb-2 text-center tracking-tighter uppercase">{dict[lang].embedCode}</h3>
                        
                        <div className="mt-6 mb-8 relative group">
                            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>
                            <pre className="p-5 bg-black/40 rounded-2xl text-[10px] sm:text-xs text-emerald-300 border border-emerald-500/20 overflow-x-auto whitespace-pre-wrap break-all font-mono shadow-inner max-h-60">
{getEmbedHtml()}
                            </pre>
                        </div>
                        
                        <button 
                            onClick={handleCopyHtml} 
                            className={`w-full py-5 rounded-[1.5rem] font-bold text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${copied ? 'bg-teal-500 text-white shadow-teal-500/20' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'}`}
                        >
                            <Icon name={copied ? "check" : "copy"} className="w-5 h-5" />
                            {copied ? dict[lang].copied : dict[lang].copyHtml}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Senarai Transaksi (Untuk Ahli) */}
            {showTransactionsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#111314]/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1a1c1d]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
                        <button onClick={() => setShowTransactionsModal(false)} className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 bg-white/5 text-slate-400 rounded-full hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 transition-colors z-20">
                            <Icon name="x" className="w-4 h-4" />
                        </button>
                        <h3 className="font-bold text-white text-xl sm:text-2xl mb-6 flex items-center gap-3">
                            <Icon name="list" className="text-emerald-400" />
                            {dict[lang].viewTransactions}
                        </h3>
                        
                        <div className="overflow-y-auto no-scrollbar flex-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                            <table className="w-full text-left min-w-[480px]">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest sticky top-0 bg-[#1a1c1d]/90 backdrop-blur-md z-10">
                                        <th className="py-4 px-2">{dict[lang].member}</th>
                                        <th className="py-4 px-2">{dict[lang].month}</th>
                                        <th className="py-4 px-2 text-right">{dict[lang].valueRM}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px]">
                                    {records.length === 0 ? (
                                        <tr><td colSpan={3} className="py-12 text-center text-slate-500 italic font-medium">{dict[lang].noRecords}</td></tr>
                                    ) : (
                                        records.map(r => (
                                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-2 font-bold text-slate-200">{r.name}</td>
                                                <td className="py-4 px-2 text-slate-400 font-medium">{dict[lang].months[r.month] || r.month}</td>
                                                <td className={`py-4 px-2 text-right font-black whitespace-nowrap ${r.type==='masuk'?'text-emerald-400':'text-rose-400'}`}>
                                                    {r.type==='masuk'?'+':'-'} {r.amount && r.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
