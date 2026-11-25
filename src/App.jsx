import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLUMNS = ['To Do', 'In Progress', 'In Review', 'Done'];
const SEED = [
  {id:'t1', title:'Design Login Page', description:'Create a welcoming sign-in experience and responsive form.', status:'To Do', priority:'High', label:'Design', assignee:'Angel', due:'2026-10-29'},
  {id:'t2', title:'Create Dashboard', description:'Build summary cards and project progress overview.', status:'To Do', priority:'Medium', label:'Frontend', assignee:'Prisha', due:'2026-10-30'},
  {id:'t3', title:'Add HelpBot', description:'Add quick questions and a helpful chat panel.', status:'In Progress', priority:'Medium', label:'Feature', assignee:'Sahil', due:'2026-10-31'},
  {id:'t4', title:'Authentication', description:'Validate login details and provide sign-up flow.', status:'In Progress', priority:'High', label:'Frontend', assignee:'Angel', due:'2026-11-01'},
  {id:'t5', title:'Responsive Design', description:'Check board layout on tablets and mobile screens.', status:'In Review', priority:'Low', label:'Design', assignee:'Prisha', due:'2026-11-02'},
  {id:'t6', title:'Dashboard Testing', description:'Verify task counts update when task status changes.', status:'Done', priority:'Low', label:'Testing', assignee:'Sahil', due:'2026-10-24'},
];
const readTasks = () => { try { const saved = localStorage.getItem('kanban-tasks-v1'); return saved ? JSON.parse(saved) : SEED; } catch { return SEED; } };

function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [theme, setTheme] = useState(
  () => localStorage.getItem('kanban-theme') || 'light'
);

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('kanban-theme', theme);
}, [theme]);

  const [user, setUser] = useState(() => localStorage.getItem('kanban-user') || '');
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [profession, setProfession] = useState('Student');
  const [page, setPage] = useState('Board'); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('All priorities');
  const [modal, setModal] = useState(null); const [dragged, setDragged] = useState(null); const [toast, setToast] = useState('');
  const [helpOpen, setHelpOpen] = useState(false); const [chatInput, setChatInput] = useState(''); const [messages, setMessages] = useState([{from:'bot', text:'Hi! I’m HelpBot. How can I help you today?'}]);
  const [form, setForm] = useState({title:'', description:'', priority:'Medium', status:'To Do', label:'General', assignee:'', due:''});
  useEffect(() => { localStorage.setItem('kanban-tasks-v1', JSON.stringify(tasks)); }, [tasks]);
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
  const counts = useMemo(() => COLUMNS.reduce((obj, c) => ({...obj, [c]: tasks.filter(t => t.status === c).length}), {}), [tasks]);
  const completion = tasks.length ? Math.round((counts['Done'] / tasks.length) * 100) : 0;
  const filteredTasks = useMemo(() => tasks.filter(t => `${t.title} ${t.description} ${t.label} ${t.assignee}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All priorities' || t.priority === filter)), [tasks, search, filter]);
  const chartData = COLUMNS.map(name => ({name, tasks: counts[name] || 0}));
  const openCreate = (status='To Do') => { setForm({title:'', description:'', priority:'Medium', status, label:'General', assignee:user || '', due:''}); setModal({kind:'create'}); };
  const openEdit = task => { setForm({...task}); setModal({kind:'edit', id:task.id}); };
  const saveTask = e => { e.preventDefault(); if (!form.title.trim()) { notify('Please enter a task title.'); return; } if (modal.kind === 'edit') setTasks(prev => prev.map(t => t.id === modal.id ? {...t, ...form, title:form.title.trim()} : t)); else setTasks(prev => [...prev, {...form, id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), title:form.title.trim()}]); setModal(null); notify(modal.kind === 'edit' ? 'Task updated successfully.' : 'Task created successfully.'); };
  const deleteTask = id => { setTasks(prev => prev.filter(t => t.id !== id)); setModal(null); notify('Task deleted.'); };
  const moveTask = (id, status) => setTasks(prev => prev.map(t => t.id === id ? {...t, status} : t));
  const signIn = e => { e.preventDefault(); if (!email.trim() || !password.trim()) return; const display = email.split('@')[0].replace(/[._-]/g,' '); const name = display.replace(/\b\w/g, x => x.toUpperCase()); setUser(name || 'Guest'); localStorage.setItem('kanban-user', name || 'Guest'); setPage('Dashboard'); notify('Welcome to your workspace!'); };
  const signOut = () => { setUser(''); localStorage.removeItem('kanban-user'); setPage('Board'); };
  const askBot = text => { const q = (text ?? chatInput).trim(); if (!q) return; setMessages(prev => [...prev, {from:'user',text:q}, {from:'bot',text:botAnswer(q, tasks)}]); setChatInput(''); };
  if (!user) return <main className="auth-page"><div className="auth-decoration decor-one"/><div className="auth-decoration decor-two"/><section className="login-card"><div className="brand-mark">k</div><p className="eyebrow">YOUR WORKSPACE, IN FLOW</p><h1>Kanban</h1><p className="muted center">Look Who’s Back</p><form onSubmit={signIn} className="login-form"><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" required /></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required /></label>{authMode==='signup' && <label>Profession<select value={profession} onChange={e=>setProfession(e.target.value)}><option>Student</option><option>Designer</option><option>Developer</option><option>Project Manager</option><option>Other</option></select></label>}<button className="text-button forgot" type="button" onClick={()=>notify('Password recovery can be connected to an email service.')}>Forgot Password?</button><button className="primary-btn full" type="submit">{authMode==='signin'?'Sign In':'Create Account'} <span>→</span></button></form><p className="signup-line">{authMode==='signin'?"Don't have an account?":"Already have an account?"} <button className="text-button" onClick={()=>setAuthMode(authMode==='signin'?'signup':'signin')}>{authMode==='signin'?'Sign Up':'Sign In'}</button></p><p className="login-note">Keep tasks flowing, one card at a time.</p></section><div className="auth-side-note"><span>01</span> CREATE TASKS <i/> <span>02</span> MOVE CARDS <i/> <span>03</span> TRACK PROGRESS</div></main>;
  return <div className="app-shell"><aside className="sidebar"><button className="brand" onClick={()=>setPage('Board')}><span className="brand-icon">k</span><span>kanban<small>KEEP TASKS FLOWING</small></span></button><div className="workspace-label">WORKSPACE</div><nav>{[['Dashboard','▦'],['Board','▤'],['Calendar','▦'],['Analytics','◔']].map(([name,icon])=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>setPage(name)}><span>{icon}</span>{name}{name==='Board'&&<b>{tasks.length}</b>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-spark">✦</span><strong>Small steps add up.</strong><p>Keep your team moving forward.</p></div><button className="profile" onClick={signOut}><span className="avatar">{user.slice(0,1).toUpperCase()}</span><span className="profile-text"><strong>{user}</strong><small>Workspace member</small></span><span className="logout">↗</span></button></div></aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div><div className="top-actions"><span className="date-label">{new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span><button
  className="icon-btn"
  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  aria-label="Toggle dark mode"
  onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
>
  {theme === 'dark' ? '☀' : '☾'}
</button>
<button className="icon-btn" title="Help" onClick={()=>setHelpOpen(true)}>?</button><span className="avatar small-avatar">{user.slice(0,1).toUpperCase()}</span></div></header>
      {page==='Board' && <section className="content"><div className="page-heading"><div><p className="eyebrow">PROJECT WORKSPACE</p><h1>🚀 Let's get the things moving.</h1><p className="muted">A little progress each day adds up to big results.</p></div><button className="primary-btn" onClick={()=>openCreate()}>＋ Add Task</button></div><div className="board-toolbar"><div className="search-wrap"><span>⌕</span><input aria-label="Search tasks" placeholder="Search tasks..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><select aria-label="Filter priority" className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><span className="results-count">{filteredTasks.length} tasks</span></div><div className="board">{COLUMNS.map((column,index)=><section key={column} className={`board-column column-${index}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault(); if(dragged){moveTask(dragged,column);setDragged(null);notify(`Task moved to ${column}.`);}}}><div className="column-heading"><div className="column-title"><span className="status-dot"/>{column}<span className="count-pill">{filteredTasks.filter(t=>t.status===column).length}</span></div><button className="more-btn" title={`Add to ${column}`} onClick={()=>openCreate(column)}>＋</button></div><div className="task-list">{filteredTasks.filter(t=>t.status===column).map(task=><article className="task-card" key={task.id} draggable onDragStart={()=>setDragged(task.id)} onDragEnd={()=>setDragged(null)}><div className="task-top"><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span><button className="card-more" onClick={()=>openEdit(task)} aria-label={`Edit ${task.title}`}>•••</button></div><button className="task-title" onClick={()=>openEdit(task)}>{task.title}</button><p className="task-description">{task.description}</p><span className="task-label">{task.label}</span><div className="task-footer"><span className="task-id">TASK-{task.id.replace(/\D/g,'').slice(-3) || '001'}</span><div className="task-meta">{task.due && <span title="Due date">◷ {task.due.slice(5).replace('-','/')}</span>}<span className="mini-avatar" title={task.assignee || 'Unassigned'}>{(task.assignee||'?').slice(0,1).toUpperCase()}</span></div></div><div className="card-quick-actions"><select aria-label={`Move ${task.title}`} value={task.status} onChange={e=>{moveTask(task.id,e.target.value);notify('Task status updated.')}}>{COLUMNS.map(c=><option key={c}>{c}</option>)}</select><button onClick={()=>openEdit(task)}>Edit ↗</button></div></article>)}</div><button className="add-column-task" onClick={()=>openCreate(column)}>＋ Add task</button></section>)}</div><div className="board-footnote"><span>✦</span> Great work happens one task at a time. <span className="footnote-right">Changes save automatically</span></div></section>}
      
      {page==='Dashboard' && <section className="content"><div className="page-heading"><div><p className="eyebrow">YOUR OVERVIEW</p><h1>Project Dashboard</h1><p className="muted">A clear view of what your team is working on.</p></div><button className="primary-btn" onClick={()=>{setPage('Board');openCreate()}}>＋ Create task</button></div><div className="stats-grid"><Stat title="Total Tasks" value={tasks.length} icon="▤" tone="brown" note="Across your workspace"/><Stat title="In Progress" value={counts['In Progress']} icon="◷" tone="blue" note="Currently being worked on"/><Stat title="Completed" value={counts.Done} icon="✓" tone="green" note={`${completion}% completion rate`}/><Stat title="Needs Review" value={counts['In Review']} icon="◎" tone="red" note="Ready for a second look"/></div><div className="progress-panel"><div className="progress-heading"><strong>Project completion</strong><strong>{completion}%</strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${completion}%`}} /></div><p className="muted">{counts.Done} of {tasks.length} tasks completed</p></div><div className="dashboard-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h2>Task overview</h2><p className="muted">Tasks by workflow stage</p></div><span className="panel-icon">↗</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top:15,right:10,left:-20,bottom:5}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9dfd2"/><XAxis dataKey="name" tick={{fontSize:11,fill:'#817569'}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fontSize:11,fill:'#817569'}} axisLine={false} tickLine={false}/><Tooltip cursor={{fill:'#f4ece1'}}/><Bar dataKey="tasks" fill="#79583f" radius={[6,6,0,0]} maxBarSize={54}/></BarChart></ResponsiveContainer></div></div><div className="panel recent-panel"><div className="panel-heading"><div><h2>Recent tasks</h2><p className="muted">Your latest pieces of work</p></div><button className="text-button" onClick={()=>setPage('Board')}>View board →</button></div>{tasks.slice(-4).reverse().map(t=><button className="recent-task" key={t.id} onClick={()=>{setPage('Board');openEdit(t)}}><span className={`recent-check ${t.status==='Done'?'checked':''}`}>{t.status==='Done'?'✓':''}</span><span className="recent-task-info"><strong>{t.title}</strong><small>{t.status} · {t.assignee||'Unassigned'}</small></span><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></button>)}</div></div><div className="quote-banner"><span>✦</span><div><strong>What will you move forward today?</strong><p>Focus on the next small step. Progress follows.</p></div><button onClick={()=>setPage('Board')}>Open board →</button></div></section>}

      {page==='Analytics' && <section className="content"><div className="page-heading"><div><p className="eyebrow">INSIGHTS & TRENDS</p><h1>Project Analytics</h1><p className="muted">Understand your workflow at a glance.</p></div></div><div className="stats-grid"><Stat title="Total Tasks" value={tasks.length} icon="▤" tone="brown"/><Stat title="Completion Rate" value={`${tasks.length?Math.round(counts.Done/tasks.length*100):0}%`} icon="✓" tone="green"/><Stat title="High Priority" value={tasks.filter(t=>t.priority==='High').length} icon="↑" tone="red"/><Stat title="Unassigned" value={tasks.filter(t=>!t.assignee).length} icon="◎" tone="blue"/></div><div className="panel chart-panel analytics-chart"><div className="panel-heading"><div><h2>Workflow distribution</h2><p className="muted">Current task count by stage</p></div></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9dfd2"/><XAxis dataKey="name" tick={{fontSize:12,fill:'#817569'}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="tasks" fill="#79583f" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div></section>}
      {page==='Calendar' && <section className="content"><div className="page-heading"><div><p className="eyebrow">PLAN YOUR WORK</p><h1>Task Calendar</h1><p className="muted">Your tasks and due dates in one place.</p></div><button className="primary-btn" onClick={()=>openCreate()}>＋ Add Task</button></div><div className="calendar-list panel"><div className="panel-heading"><div><h2>Upcoming deadlines</h2><p className="muted">Sorted by due date</p></div></div>{[...tasks].filter(t=>t.due).sort((a,b)=>a.due.localeCompare(b.due)).map(t=><button className="calendar-row" key={t.id} onClick={()=>openEdit(t)}><div className="calendar-date"><strong>{new Date(`${t.due}T12:00:00`).getDate()}</strong><small>{new Date(`${t.due}T12:00:00`).toLocaleDateString('en-US',{month:'short'})}</small></div><div className="calendar-task"><strong>{t.title}</strong><small>{t.assignee||'Unassigned'} · {t.label}</small></div><span className="calendar-status">{t.status}</span><span className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</span></button>)}{tasks.filter(t=>t.due).length===0&&<p className="empty-state">No due dates yet. Add a task to get started.</p>}</div></section>}
    </main>
    <button className="floating-help" onClick={()=>setHelpOpen(!helpOpen)} title="Open HelpBot">{helpOpen?'×':'✦'}<span>{helpOpen?'Close':'HelpBot'}</span></button>
    {helpOpen&&<aside className="help-panel"><div className="help-header"><div className="bot-avatar">✦</div><div><strong>HelpBot</strong><small>Here to help!</small></div><button onClick={()=>setHelpOpen(false)}>×</button></div><div className="chat-messages">{messages.map((m,i)=><div key={i} className={`chat-message ${m.from}`}>{m.text}</div>)}</div><div className="quick-questions"><span>Quick questions</span>{[
  'What is Kanban?',
  'How many tasks are pending?',
  'Which tasks are high priority?',
  'Which tasks are completed?',
  'How do I create a task?'
].map(q=><button key={q} onClick={()=>askBot(q)}>{q}</button>)}</div><form className="chat-form" onSubmit={e=>{e.preventDefault();askBot();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask HelpBot..."/><button aria-label="Send message">➤</button></form></aside>}
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><section className="task-modal"><div className="modal-top"><div><p className="eyebrow">WORKSPACE TASK</p><h2>{modal.kind==='edit'?'Edit Task':'Create a Task'}</h2><p className="muted">Add the details to keep your project moving.</p></div><button className="close-btn" onClick={()=>setModal(null)}>×</button></div><form onSubmit={saveTask} className="task-form"><label>Task title<input autoFocus value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Enter task title..." required maxLength={100}/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the task..." rows="4"/></label><div className="form-row"><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{COLUMNS.map(c=><option key={c}>{c}</option>)}</select></label></div><div className="form-row"><label>Label<input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} placeholder="e.g. Design"/></label><label>Assignee<input value={form.assignee} onChange={e=>setForm({...form,assignee:e.target.value})} placeholder="Who's on it?"/></label></div><label>Due date<input type="date" value={form.due||''} onChange={e=>setForm({...form,due:e.target.value})}/></label><div className="modal-actions">{modal.kind==='edit'&&<button type="button" className="delete-btn" onClick={()=>deleteTask(modal.id)}>Delete task</button>}<span className="action-spacer"/><button type="button" className="secondary-btn" onClick={()=>setModal(null)}>Cancel</button><button type="submit" className="primary-btn">{modal.kind==='edit'?'Save changes':'＋ Create task'}</button></div></form></section></div>}
    {toast&&<div className="toast">✓ <span>{toast}</span></div>}
    <footer className="app-footer">Responsive Rebels <span>•</span> Project 13 <span>•</span> G16_PID-13 <span className="footer-right">Organize work. Keep the project moving.</span></footer>
  </div>;
}
function Stat({title,value,icon,tone,note}) { return <div className="stat-card"><div className="stat-top"><span>{title}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong className="stat-value">{value}</strong><p>{note}</p></div>; }
function botAnswer(q, taskList = []) {
  const s = String(q ?? "").toLowerCase().trim();
  const total = taskList.length;
  const pending = taskList.filter(t => t.status !== "Done");
  const done = taskList.filter(t => t.status === "Done");
  const high = taskList.filter(t => t.priority === "High");

  // Greetings and friendly conversation
  if (/^(hi|hii+|hello+|hey+|heya|hiya|helo)[\s!.?]*$/.test(s)) {
    return "Hello! 😊 I'm your Smart HelpBot. How can I help you today?";
  }
  if (/\bhow are you\b/.test(s)) {
    return "I'm doing great, thanks for asking! 😊 I'm ready to help you manage your Kanban project.";
  }
  if (/\b(your name|who are you)\b/.test(s)) {
    return "I'm Smart HelpBot 🤖, your project assistant. I can help explain Kanban and answer questions about your tasks.";
  }
  if (s === "thanks" || s === "thank you" || s === "thanku" || s === "thx") {
    return "You're welcome! 💛 Ask me whenever you need help.";
  }
  if (/\b(good morning|good afternoon|good evening)\b/.test(s)) {
    return "Hello! 😊 Hope your day is going well. What can I help you with?";
  }
  if (/^(bye|goodbye|see you)[\s!.?]*$/.test(s)) {
    return "Goodbye! 👋 Keep making progress on your project!";
  }
  if (/\b(joke|make me laugh)\b/.test(s)) {
    return "Why did the task go to the Kanban board? 😄 It wanted to move up in the world!";
  }

  // Questions about current board data
  if (/\b(pending|not completed|left to do|unfinished)\b/.test(s)) {
    return `You have ${pending.length} pending task${pending.length === 1 ? "" : "s"} out of ${total} total tasks.`;
  }
  if (/\b(high priority|high-priority|urgent)\b/.test(s)) {
    return high.length
      ? `You have ${high.length} high-priority task${high.length === 1 ? "" : "s"}: ${high.map(t => t.title).join(", ")}.`
      : "There are no high-priority tasks right now. 🎉";
  }
  if (/\b(completed|finished|done)\b/.test(s)) {
    return done.length
      ? `${done.length} task${done.length === 1 ? "" : "s"} completed: ${done.map(t => t.title).join(", ")}.`
      : "No tasks have been completed yet. Keep going! 💪";
  }
  if (/\b(total tasks|how many tasks|number of tasks|all tasks)\b/.test(s)) {
    return `There are ${total} tasks on your board.`;
  }
  if (/\bin progress\b/.test(s)) {
    const inProgress = taskList.filter(t => t.status === "In Progress");
    return inProgress.length
      ? `${inProgress.length} task${inProgress.length === 1 ? "" : "s"} currently in progress: ${inProgress.map(t => t.title).join(", ")}.`
      : "There are no tasks in progress right now.";
  }
  if (/\bin review\b/.test(s)) {
    const inReview = taskList.filter(t => t.status === "In Review");
    return inReview.length
      ? `${inReview.length} task${inReview.length === 1 ? "" : "s"} in review: ${inReview.map(t => t.title).join(", ")}.`
      : "There are no tasks waiting for review.";
  }
  if (/\b(unassigned|no assignee)\b/.test(s)) {
    const unassigned = taskList.filter(t => !t.assignee || !t.assignee.trim());
    return `There are ${unassigned.length} unassigned task${unassigned.length === 1 ? "" : "s"}.`;
  }
  if (/\b(overdue|past due|late task)\b/.test(s)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = taskList.filter(t => t.due && new Date(`${t.due}T00:00:00`) < today && t.status !== "Done");
    return overdue.length
      ? `There are ${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}: ${overdue.map(t => t.title).join(", ")}.`
      : "There are no overdue unfinished tasks. 🎉";
  }
  if (/\b(progress|completion rate|percentage complete|percent complete)\b/.test(s)) {
    const percent = total ? Math.round((done.length / total) * 100) : 0;
    return `Your project is ${percent}% complete (${done.length} of ${total} tasks done).`;
  }

  // How-to and general Kanban questions
  if (/\b(create|add|new)\b/.test(s) && /\btask\b/.test(s)) {
    return "To create a task, open the Board and click + Add Task. Enter the title and any details, then save it.";
  }
  if (/\b(edit|update|change)\b/.test(s) && /\btask\b/.test(s)) {
    return "On the Board, click a task card or its Edit button. Update the details and save your changes.";
  }
  if (/\b(delete|remove)\b/.test(s) && /\btask\b/.test(s)) {
    return "On the Board, open the task you want to remove, then click Delete task in the task window.";
  }
  if (/\b(move|change status|status of)\b/.test(s) && /\btask\b/.test(s)) {
    return "You can drag a task card into another column, or use the status dropdown on the card to move it.";
  }
  if (/\b(what is|explain|meaning of|tell me about)\b/.test(s) && /\bkanban\b/.test(s)) {
    return "Kanban is a visual way to manage work. This board uses To Do, In Progress, In Review, and Done columns so you can track each task's stage.";
  }
  if (/\b(help|what can you do|options)\b/.test(s)) {
    return "I can explain Kanban, show pending or completed tasks, list high-priority work, check progress, and explain how to create, edit, move, or delete tasks.";
  }

  // Friendly fallback: this is still a rule-based bot, not an AI model
  return "Thanks for your question! 😊 I can answer greetings and help with your Kanban board, task counts, priorities, progress, and task actions. Try asking me in another way, or ask about a specific task.";
}

export default App;




