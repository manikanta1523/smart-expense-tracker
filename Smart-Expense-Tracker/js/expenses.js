let expenseUser, expenseList=[];
document.addEventListener("DOMContentLoaded",()=>{expenseUser=protectPage("User");if(!expenseUser)return;initExpenses();});
function initExpenses(){
  fillExpenseSelects(); document.getElementById("expenseDate").value=todayISO();
  document.getElementById("addExpenseBtn").onclick=()=>openExpense();
  document.getElementById("expenseForm").onsubmit=saveExpense;
  ["expenseSearch","expenseCategoryFilter","expenseAccountFilter","expenseDateFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderExpenses));
  document.getElementById("clearExpenseFilters").onclick=()=>{["expenseSearch","expenseCategoryFilter","expenseAccountFilter","expenseDateFilter"].forEach(id=>document.getElementById(id).value="");renderExpenses()};
  document.getElementById("exportExpenseBtn").onclick=()=>exportCSV(userTransactions(expenseUser.id).filter(t=>t.type==="expense"),"expenses.csv");
  renderExpenses();
}
function fillExpenseSelects(){
  const cats=getCategories(), accounts=userAccounts(expenseUser.id); 
  document.getElementById("expenseCategory").innerHTML=cats.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
  document.getElementById("expenseCategoryFilter").innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
  document.getElementById("expenseAccount").innerHTML=accounts.length?accounts.map(a=>`<option value="${a.id}">${escapeHtml(a.name)}</option>`).join(""):'<option value="">Create an account first</option>';
  document.getElementById("expenseAccountFilter").innerHTML='<option value="">All accounts</option>'+accounts.map(a=>`<option value="${a.id}">${escapeHtml(a.name)}</option>`).join("");
}
function openExpense(id=null){
  const form=document.getElementById("expenseForm");form.reset();document.getElementById("expenseId").value="";
  document.getElementById("expenseDate").value=todayISO();fillExpenseSelects();
  if(id){const t=userTransactions(expenseUser.id).find(x=>x.id===id);if(!t)return;document.getElementById("expenseModalTitle").textContent="Edit Expense";document.getElementById("expenseId").value=t.id;document.getElementById("expenseAmount").value=t.amount;document.getElementById("expenseCategory").value=t.category;document.getElementById("expenseAccount").value=t.accountId;document.getElementById("expenseDate").value=t.date;document.getElementById("expenseDescription").value=t.description;document.getElementById("expenseRecurring").checked=!!t.recurringId}else document.getElementById("expenseModalTitle").textContent="Add Expense";
  document.getElementById("expenseModal").classList.add("show");
}
function saveExpense(e){
  e.preventDefault();const amount=Number(document.getElementById("expenseAmount").value), category=document.getElementById("expenseCategory").value, accountId=document.getElementById("expenseAccount").value,date=document.getElementById("expenseDate").value,description=document.getElementById("expenseDescription").value.trim();
  if(!amount||amount<=0)return toast("Enter a valid amount.","error");if(!category||!accountId||!date||!description)return toast("Please fill all expense fields.","error");
  let all=readData(STORAGE.transactions), id=document.getElementById("expenseId").value;
  const item={id:id||makeId("tx"),userId:expenseUser.id,type:"expense",amount,category,accountId,date,description};
  if(id){const i=all.findIndex(t=>t.id===id&&t.userId===expenseUser.id);all[i]=item}else all.push(item);saveData(STORAGE.transactions,all);
  if(document.getElementById("expenseRecurring").checked&&!id) addRecurring(item);
  closeModal("expenseModal");toast(id?"Expense updated":"Expense added");renderExpenses();
}
function renderExpenses(){
  const accounts=userAccounts(expenseUser.id), map=Object.fromEntries(accounts.map(a=>[a.id,a.name])),all=userTransactions(expenseUser.id).filter(t=>t.type==="expense"),q=document.getElementById("expenseSearch").value.toLowerCase(),cat=document.getElementById("expenseCategoryFilter").value,acc=document.getElementById("expenseAccountFilter").value,month=document.getElementById("expenseDateFilter").value;
  expenseList=all.filter(t=>(!q||`${t.description} ${t.category}`.toLowerCase().includes(q))&&(!cat||t.category===cat)&&(!acc||t.accountId===acc)&&(!month||t.date.startsWith(month))).sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById("expenseCount").textContent=`${expenseList.length} transaction${expenseList.length!==1?"s":""}`;
  document.getElementById("expenseTable").innerHTML=expenseList.length?expenseList.map(t=>`<tr><td>${formatDate(t.date)}</td><td><strong>${escapeHtml(t.description)}</strong></td><td>${escapeHtml(t.category)}</td><td>${escapeHtml(map[t.accountId]||"Unknown")}</td><td class="amount-expense">−${formatMoney(t.amount)}</td><td><div class="table-actions"><button class="icon-btn" onclick="openExpense('${t.id}')">Edit</button><button class="icon-btn danger" onclick="deleteExpense('${t.id}')">Delete</button></div></td></tr>`).join(""):`<tr><td colspan="6"><div class="empty-state">No expenses found.</div></td></tr>`;
}
function deleteExpense(id){if(!confirm("Delete this expense? This action cannot be undone."))return;saveData(STORAGE.transactions,readData(STORAGE.transactions).filter(t=>t.id!==id));toast("Expense deleted");renderExpenses();}
function addRecurring(item){const arr=readData(STORAGE.recurring);arr.push({id:makeId("rec"),userId:item.userId,title:item.description,category:item.category,amount:item.amount,accountId:item.accountId,nextDate:item.date,frequency:"Monthly"});saveData(STORAGE.recurring,arr);}
function exportCSV(rows,name){const header=["Date","Type","Description","Category/Source","Amount","Account"];const accounts=userAccounts(expenseUser.id),map=Object.fromEntries(accounts.map(a=>[a.id,a.name]));const data=rows.map(t=>[t.date,t.type,t.description,t.category||t.source,t.amount,map[t.accountId]||""]);const csv=[header,...data].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
