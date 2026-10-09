const STORAGE = {
  users: "users", currentUser: "currentUser", transactions: "transactions",
  budgets: "budgets", accounts: "accounts", categories: "categories",
  recurring: "recurringExpenses"
};

const DEFAULT_CATEGORIES = ["Food","Travel","Shopping","Bills","Education","Entertainment","Healthcare","Other"];

function readData(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveData(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getCurrentUser() { return readData(STORAGE.currentUser, null); }
function setCurrentUser(user) { saveData(STORAGE.currentUser, user); }
function makeId(prefix="id") { return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2,7); }
function formatMoney(value) { return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(value)||0); }
function formatDate(value) { if (!value) return "-"; return new Date(value + "T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
function todayISO() { return new Date().toISOString().slice(0,10); }
function currentMonth() { return todayISO().slice(0,7); }
function showMessage(text,type="error") { const el=document.getElementById("message"); if(el) el.innerHTML=`<div class="message ${type}">${text}</div>`; }
function toast(text,type="success") { const holder=document.getElementById("toast"); if(!holder) return; const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=text; holder.appendChild(el); setTimeout(()=>el.remove(),3000); }

function ensureDefaults() {
  let users = readData(STORAGE.users);
  if (!users.some(u => u.email.toLowerCase() === "admin@gmail.com")) {
    users.push({id:"admin_001",name:"Administrator",email:"admin@gmail.com",password:"admin123",role:"Admin"});
    saveData(STORAGE.users, users);
  }
  if (!localStorage.getItem(STORAGE.categories)) saveData(STORAGE.categories, DEFAULT_CATEGORIES);
  if (!localStorage.getItem(STORAGE.transactions)) saveData(STORAGE.transactions, []);
  if (!localStorage.getItem(STORAGE.budgets)) saveData(STORAGE.budgets, []);
  if (!localStorage.getItem(STORAGE.accounts)) saveData(STORAGE.accounts, []);
  if (!localStorage.getItem(STORAGE.recurring)) saveData(STORAGE.recurring, []);
}
ensureDefaults();

function isPage(name) { return location.pathname.toLowerCase().endsWith(name.toLowerCase()); }

function protectPage(requiredRole="User") {
  const user = getCurrentUser();
  if (!user) { location.href="login.html"; return null; }
  if (requiredRole && user.role !== requiredRole) {
    location.href = user.role === "Admin" ? "admin.html" : "dashboard.html";
    return null;
  }
  return user;
}

function setupCommonUI() {
  const user=getCurrentUser();
  const nameEls=["sideUserName","welcomeName"];
  nameEls.forEach(id=>{const el=document.getElementById(id); if(el&&user) el.textContent=user.name;});
  const email=document.getElementById("sideUserEmail"); if(email&&user) email.textContent=user.email;
  ["userAvatar","topAvatar"].forEach(id=>{const el=document.getElementById(id); if(el&&user) el.textContent=(user.name||"U").charAt(0).toUpperCase();});
  const date=document.getElementById("todayDate"); if(date) date.textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
  const logout=document.getElementById("logoutBtn"); if(logout) logout.addEventListener("click",()=>{localStorage.removeItem(STORAGE.currentUser);location.href="index.html";});
  const menu=document.getElementById("mobileMenu"), side=document.getElementById("sidebar");
  if(menu&&side) menu.addEventListener("click",()=>side.classList.toggle("open"));
  document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>document.getElementById(btn.dataset.close)?.classList.remove("show")));
}
document.addEventListener("DOMContentLoaded",()=>{
  if (isPage("login.html")) initLogin();
  if (isPage("signup.html")) initSignup();
  if (!isPage("index.html") && !isPage("login.html") && !isPage("signup.html")) setupCommonUI();
});

function initLogin() {
  if(getCurrentUser()){ location.href=getCurrentUser().role==="Admin"?"admin.html":"dashboard.html"; return; }
  document.getElementById("loginForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    const email=document.getElementById("email").value.trim().toLowerCase();
    const password=document.getElementById("password").value;
    if(!email||!password) return showMessage("Please enter email and password.");
    const users=readData(STORAGE.users);
    const user=users.find(u=>u.email.toLowerCase()===email && u.password===password);
    if(!user) return showMessage("Invalid email or password.");
    setCurrentUser({id:user.id,name:user.name,email:user.email,role:user.role});
    location.href=user.role==="Admin"?"admin.html":"dashboard.html";
  });
}
function initSignup() {
  if(getCurrentUser()){ location.href=getCurrentUser().role==="Admin"?"admin.html":"dashboard.html"; return; }
  document.getElementById("signupForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("name").value.trim(), email=document.getElementById("email").value.trim().toLowerCase();
    const password=document.getElementById("password").value, confirm=document.getElementById("confirmPassword").value;
    if(!name||!email||!password||!confirm) return showMessage("Please fill all fields.");
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMessage("Please enter a valid email address.");
    if(password.length<6) return showMessage("Password must contain at least 6 characters.");
    if(password!==confirm) return showMessage("Passwords do not match.");
    const users=readData(STORAGE.users);
    if(users.some(u=>u.email.toLowerCase()===email)) return showMessage("An account with this email already exists.");
    const user={id:makeId("user"),name,email,password,role:"User"};
    users.push(user); saveData(STORAGE.users,users);
    saveData(STORAGE.accounts,[...readData(STORAGE.accounts),{id:makeId("acc"),userId:user.id,name:"Cash",type:"Cash",openingBalance:0}]);
    setCurrentUser({id:user.id,name:user.name,email:user.email,role:user.role});
    location.href="dashboard.html";
  });
}
function userTransactions(userId) { return readData(STORAGE.transactions).filter(t=>t.userId===userId); }
function userBudgets(userId) { return readData(STORAGE.budgets).filter(b=>b.userId===userId); }
function userAccounts(userId) { return readData(STORAGE.accounts).filter(a=>a.userId===userId); }
function getCategories() { return readData(STORAGE.categories,DEFAULT_CATEGORIES); }
function saveCategories(cats) { saveData(STORAGE.categories,cats); }
function closeModal(id){document.getElementById(id)?.classList.remove("show");}
