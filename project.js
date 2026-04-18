const vantage = supabase.createClient('https://dchnxnigtppossnudpmg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjaG54bmlndHBwb3NzbnVkcG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDA0MTEsImV4cCI6MjA5MTkxNjQxMX0.1tHWEM-lj-I8AfE9BlZHEcKuZeM55k_2hF6nJ4eE1xQ');
let currentRole = '';

// --- 1. ROLE HANDLING ---
window.setRole = (role) => {
    currentRole = role;
    document.getElementById('roleLabel').innerText = role.toUpperCase();
    document.getElementById('roleSection').classList.add('hidden-section');
    document.getElementById('authSection').classList.remove('hidden-section');
    document.getElementById('tradeWrapper').classList.toggle('hidden-section', role !== 'artisan');
};

window.toggleAuth = (mode) => {
    document.getElementById('signupBox').classList.toggle('hidden-section', mode === 'login');
    document.getElementById('loginBox').classList.toggle('hidden-section', mode === 'signup');
};

// --- 2. THE PORTAL LOGIC (Conditional Rendering) ---
async function launchPortal(profile) {
    document.getElementById('roleSection').classList.add('hidden-section');
    document.getElementById('authSection').classList.add('hidden-section');
    document.getElementById('portalSection').classList.remove('hidden-section');

    const content = document.getElementById('dashboardContent');
    content.innerHTML = ""; // Clear loader

    if (profile.role === 'client') {
        // HIRER VIEW: FETCH ARTISANS
        const { data: artisans } = await vantage.from('profiles').select('*').eq('role', 'artisan');
        
        content.innerHTML = `<h2 style="grid-column: 1/-1">Marketplace</h2>`;
        
        artisans.forEach(art => {
            const cleanPhone = (art.phone || "").replace(/\s/g, ''); // DEFINED BEFORE USE
            const waPhone = cleanPhone.startsWith('0') ? '234' + cleanPhone.substring(1) : cleanPhone;

            content.innerHTML += `
                <div class="bento-card">
                    <p class="accent-text" style="font-size: 10px; font-weight: 800;">${art.profession}</p>
                    <h3 style="margin: 5px 0 20px 0;">${art.full_name}</h3>
                    <div class="action-row">
                        <a href="tel:${cleanPhone}" class="btn-contact btn-call">Call</a>
                        <a href="https://wa.me/${waPhone}" target="_blank" class="btn-contact btn-whatsapp">WhatsApp</a>
                    </div>
                </div>`;
        });
    } else {
        // ARTISAN VIEW
        content.innerHTML = `
            <div class="bento-card" style="grid-column: 1/-1">
                <h2>Welcome, ${profile.full_name}</h2>
                <p>Your profile is live as a <span class="accent-text">${profile.profession}</span></p>
            </div>
            <div class="bento-card"><h3>Profile Visits</h3><p>0</p></div>
        `;
    }
}

// --- 3. AUTH ACTIONS ---
window.handleSignup = async () => {
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const trade = document.getElementById('regTrade').value;

    const { data, error } = await vantage.auth.signUp({
        email: `${phone}@vantage.app`, password
    });

    if (error) return alert(error.message);

    const profile = { id: data.user.id, full_name: name, phone, role: currentRole, profession: trade || 'Client' };
    await vantage.from('profiles').insert([profile]);
    launchPortal(profile);
};

window.handleLogin = async () => {
    const phone = document.getElementById('loginPhone').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await vantage.auth.signInWithPassword({
        email: `${phone}@vantage.app`, password
    });

    if (error) return alert(error.message);

    const { data: profile } = await vantage.from('profiles').select('*').eq('id', data.user.id).single();
    launchPortal(profile);
};

window.logout = async () => {
    await vantage.auth.signOut();
    location.reload();
};

// AUTO-LOGIN CHECK
window.onload = async () => {
    const { data: { session } } = await vantage.auth.getSession();
    if (session) {
        const { data: profile } = await vantage.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) launchPortal(profile);
    }
};

window.toggleAuth = (mode) => {
    const signup = document.getElementById('signupBox');
    const login = document.getElementById('loginBox');
    
    // Smooth transition
    signup.style.opacity = "0";
    login.style.opacity = "0";
    
    setTimeout(() => {
        if (mode === 'login') {
            signup.classList.add('hidden-section');
            login.classList.remove('hidden-section');
            login.style.opacity = "1";
        } else {
            login.classList.add('hidden-section');
            signup.classList.remove('hidden-section');
            signup.style.opacity = "1";
        }
    }, 200);
};

window.setRole = (role) => {
    currentRole = role;
    
    // Smooth transition between screens
    const roleSec = document.getElementById('roleSection');
    const authSec = document.getElementById('authSection');
    
    roleSec.style.opacity = "0";
    roleSec.style.transform = "scale(0.95)";
    
    setTimeout(() => {
        roleSec.classList.add('hidden-section');
        authSec.classList.remove('hidden-section');
        
        document.getElementById('roleLabel').innerText = role === 'client' ? 'AS HIRER' : 'AS ARTISAN';
        
        // Only show trade selection if they are an artisan
        const tradeWrap = document.getElementById('tradeWrapper');
        if (role === 'artisan') {
            tradeWrap.classList.remove('hidden-section');
        } else {
            tradeWrap.classList.add('hidden-section');
        }
    }, 400);
};