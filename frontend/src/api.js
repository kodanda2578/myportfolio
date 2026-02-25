const USERS_KEY = 'fsad_users';
const PROJECTS_KEY = 'fsad_projects';

// Initial Mock Data
const initialUsers = [
  { id: 1, name: 'Admin User', email: 'admin@school.edu', password: 'password', role: 'admin' },
  { id: 2, name: 'Student One', email: 'student1@school.edu', password: 'password', role: 'student' }
];

// Initial Projects Data
const initialProjects = [
  {
    id: 1,
    studentId: 2,
    studentName: 'Student One',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce project with cart and checkout functionalities built using React and Node.js.',
    status: 'Pending',
    feedback: '',
    milestones: [
      { id: Date.now() + 1, title: 'Project Setup & Design', completed: true },
      { id: Date.now() + 2, title: 'Backend CRUD API', completed: true },
      { id: Date.now() + 3, title: 'Frontend Integration', completed: false }
    ]
  }
];

export const initDb = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(PROJECTS_KEY)) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
  }
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY));
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
  return null;
};

export const getProjects = () => {
  return JSON.parse(localStorage.getItem(PROJECTS_KEY));
};

export const getStudentProjects = (studentId) => {
  const projects = getProjects();
  return projects.filter(p => p.studentId === studentId);
};

export const createProject = (project) => {
  const projects = getProjects();
  const newProject = {
    ...project,
    id: Date.now(),
    status: 'Pending',
    feedback: ''
  };
  projects.push(newProject);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return newProject;
};

export const updateProjectAdmin = (id, status, feedback) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index].status = status;
    projects[index].feedback = feedback;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
  return projects[index];
};

export const addMilestone = (projectId, milestoneTitle) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index].milestones.push({ id: Date.now(), title: milestoneTitle, completed: false });
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }
  return projects[index];
};

export const toggleMilestone = (projectId, milestoneId) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    const mIndex = projects[index].milestones.findIndex(m => m.id === milestoneId);
    if (mIndex !== -1) {
      projects[index].milestones[mIndex].completed = !projects[index].milestones[mIndex].completed;
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    }
  }
  return projects[index];
};
